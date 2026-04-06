import React, { createContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../api/axiosClient';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const fetchUser = async () => {
    try {
      const res = await axios.get("/auth/me");
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.pathname === "/login") {
      setLoading(false);
      return; 
    }
    fetchUser();
  }, [location.pathname]);

  const logout = async () => {
    try { await axios.post("/auth/logout"); } catch {}
    setUser(null);
    nav("/login");
  };

  if (loading) return null; // or loader

  const hasRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const permissions = {
    superadmin: { canEdit:true, canDelete:true, canAssignManager:true, canAssignExecutive:true, canCloseLead:true, canAddFollowUp:true },
    admin:      { canEdit:true, canDelete:false, canAssignManager:true, canAssignExecutive:true, canCloseLead:true, canAddFollowUp:true },
    manager:    { canEdit:true, canDelete:false, canAssignManager:false, canAssignExecutive:true, canCloseLead:true, canAddFollowUp:true },
    executive:  { canEdit:false, canDelete:false, canAssignManager:false, canAssignExecutive:false, canCloseLead:false, canAddFollowUp:true }
  };

  const can = (action) => {
    if (!user) return false;
    return permissions[user.role]?.[action] || false;
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, hasRole, can }}>
      {children}
    </AuthContext.Provider>
  );
};


export default AuthContext;
