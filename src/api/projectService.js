import api from "./axiosClient";

export const fetchProjects = () => api.get("/project");

export const fetchProject = (id) => api.get(`/project/${id}`);

export const createProject = (data) =>
  api.post("/project", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateProject = (id, data) =>
  api.put(`/project/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteProject = (id) => api.delete(`/project/${id}`);
