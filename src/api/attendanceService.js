import axios from "./axiosClient";

export const punchIn = (lat, lng) => axios.post("/attendance/punch-in", {lat,lng});
export const punchOut = () => axios.post("/attendance/punch-out");
export const getMyAttendance = (month,year) => axios.get("/attendance/my?month=${month}&year=${year}");
export const getTeamAttendance = () => axios.get("/attendance/team");
export const getAllAttendance = () => axios.get("/attendance/all");

export const exportAttendance = () => axios.get("/attendance/export",{ responseType:"blob" });
export const deleteAttendance = (id) => axios.delete(`/attendance/${id}`);
