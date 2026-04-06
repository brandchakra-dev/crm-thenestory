import api from "./axiosClient";

export const fetchMyFollowups = () => api.get("/followups/follow").then(r => r.data);
