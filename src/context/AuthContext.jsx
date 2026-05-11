import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../api/axiosClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const nav      = useNavigate();
  const location = useLocation();

  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // ── On mount: restore session from cookie ───────────────
  const fetchUser = async () => {
    try {
      const res = await axios.get("/auth/me");
      setUser(res.data.user);
    } catch (err) {
      const code = err.response?.data?.code;

      // TOKEN_EXPIRED → interceptor will refresh automatically and retry
      // If refresh also fails, interceptor redirects to /login
      // So here we only clear user for non-recoverable errors
      if (code !== "TOKEN_EXPIRED") {
        setUser(null);
      }
      // TOKEN_EXPIRED case: do nothing — interceptor handles it
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Don't call /auth/me on login page — user isn't logged in yet
    if (location.pathname === "/login") {
      setLoading(false);
      return;
    }
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Note: intentionally NOT re-running on location change
  // We only need to restore session once on app load

  // ── Logout ───────────────────────────────────────────────
  const logout = async () => {
    try {
      await axios.post("/auth/logout");
    } catch {
      // Even if API fails, clear local state
    } finally {
      setUser(null);
      nav("/login");
    }
  };

  // ── Role helpers ─────────────────────────────────────────
  const hasRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const permissions = {
    superadmin: { canEdit: true, canDelete: true, canCreate: true, canManageUsers: true },
    admin:      { canEdit: true, canDelete: false, canCreate: true, canManageUsers: true },
    manager:    { canEdit: true, canDelete: false, canCreate: true, canManageUsers: false },
    executive:  { canEdit: false, canDelete: false, canCreate: false, canManageUsers: false },
  };

  const can = (action) => {
    if (!user) return false;
    return permissions[user.role]?.[action] || false;
  };

  if (loading) return null; // or your loader component

  return (
    <AuthContext.Provider value={{ user, setUser, logout, hasRole, can, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;