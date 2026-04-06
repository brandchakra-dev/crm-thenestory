import api from "./axiosClient";

export const getSummary = () => api.get("/reports/superadmin-summary");

export const getTrend = (type) =>
  api.get(`/reports/trend?type=${type}`);

export const getStatusDist = () =>
  api.get("/reports/status-distribution");

export const getUserPerformance = () =>
  api.get("/reports/user-performance");
