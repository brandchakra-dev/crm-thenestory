import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../api/axiosClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const nav      = useNavigate();
  const location = useLocation();

  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // ── On mount: restore session ────────────────────────────
  const fetchUser = async () => {
    try {
      // ✅ axiosClient automatically Bearer token header se bhejega
      const res = await axios.get("/auth/me");
      setUser(res.data.user);
    } catch (err) {
      const code = err.response?.data?.code;

      // TOKEN_EXPIRED → interceptor automatically refresh karega aur retry karega
      // Agar refresh bhi fail ho → interceptor /login redirect karega
      // Yahan sirf non-recoverable errors pe user clear karo
      if (code !== "TOKEN_EXPIRED") {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Login page pe /auth/me call mat karo
    if (location.pathname === "/login") {
      setLoading(false);
      return;
    }

    // ✅ Sirf tab fetchUser karo jab localStorage mein token ho
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }

    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Logout ───────────────────────────────────────────────
  const logout = async () => {
    try {
      // ✅ refreshToken body mein bhejo (cross-origin ke liye)
      const refreshToken = localStorage.getItem("refreshToken");
      await axios.post("/auth/logout", { refreshToken });
    } catch {
      // API fail ho tab bhi local state clear karo
    } finally {
      // ✅ Dono tokens clear karo
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
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
    superadmin: { canEdit: true,  canDelete: true,  canCreate: true,  canManageUsers: true  },
    admin:      { canEdit: true,  canDelete: false, canCreate: true,  canManageUsers: true  },
    manager:    { canEdit: true,  canDelete: false, canCreate: true,  canManageUsers: false },
    executive:  { canEdit: false, canDelete: false, canCreate: false, canManageUsers: false },
  };

  const can = (action) => {
    if (!user) return false;
    return permissions[user.role]?.[action] || false;
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, setUser, logout, hasRole, can, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;