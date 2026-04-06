import api from "../api/axiosClient";   

export const buildFD = (body, files = {}) => {
  const fd = new FormData();
  fd.append("data", JSON.stringify(body));

  Object.entries(files).forEach(([key, value]) => {
    if (!value) return;

    if (value instanceof File) {
      fd.append(key, value); // ✅ FIX
    } else if (value instanceof FileList) {
      Array.from(value).forEach(file => fd.append(key, file));
    } else if (Array.isArray(value)) {
      value.forEach(file => fd.append(key, file));
    }
  });

  return fd;
};

export const projectsApi = {
  list:           (p)         => api.get("/projects", { params: p }),
  get:            (id)        => api.get(`/projects/${id}`),
  create:         (fd)        => api.post("/projects", fd),
  update:         (id, fd)    => api.put(`/projects/${id}`, fd),
  remove:         (id)        => api.delete(`/projects/${id}`),
  removeImage:    (id, imgId) => api.delete(`/projects/${id}/image/${imgId}`),
  toggleFeatured: (id)        => api.patch(`/projects/${id}/toggle-featured`),
  imageUrl:       (id, imgId) => `/api/projects/${id}/image/${imgId}`,
  floorPlanUrl:   (id, idx)   => `/api/projects/${id}/floorplan/${idx}`,
};

// ✅ FIXED: Added params support
export const citiesApi = {
  list:     (params = {}) => api.get("/cities", { params }),  // ← FIXED
  get:      (id)          => api.get(`/cities/${id}`),
  create:   (fd)          => api.post("/cities", fd),
  update:   (id, fd)      => api.put(`/cities/${id}`, fd),
  remove:   (id)          => api.delete(`/cities/${id}`),
  removeImage: (id)       => api.delete(`/cities/${id}/image`),
  imageUrl: (id)          => `/api/cities/${id}/image`,
};

// ✅ FIXED: Added params support
export const buildersApi = {
  list:     (params = {}) => api.get("/builders", { params }),  // ← FIXED
  get:      (id)          => api.get(`/builders/${id}`),
  create:   (fd)          => api.post("/builders", fd),
  update:   (id, fd)      => api.put(`/builders/${id}`, fd),
  remove:   (id)          => api.delete(`/builders/${id}`),
  removeLogo: (id)        => api.delete(`/builders/${id}/logo`),
  logoUrl:  (id)          => `/api/builders/${id}/logo`,
  toggleFeatured: (id)    => api.patch(`/builders/${id}/toggle-featured`),
};

export const videosApi = {
  list:           (params = {}) => api.get("/videos", { params }),
  get:            (id)          => api.get(`/videos/${id}`),
  create:         (body)        => api.post("/videos", body),
  update:         (id, body)    => api.put(`/videos/${id}`, body),
  remove:         (id)          => api.delete(`/videos/${id}`),
  toggleFeatured: (id)          => api.patch(`/videos/${id}/toggle-featured`),
};

export const blogsApi = {
  list:     (params = {}) => api.get("/blogs", { params }),
  get:      (id)          => api.get(`/blogs/${id}`),
  create:   (fd)          => api.post("/blogs", fd),
  update:   (id, fd)      => api.put(`/blogs/${id}`, fd),
  remove:   (id)          => api.delete(`/blogs/${id}`),
  publish:  (id)          => api.patch(`/blogs/${id}/publish`),
  toggleFeatured: (id)    => api.patch(`/blogs/${id}/toggle-featured`),
  coverUrl: (id)          => `/api/blogs/${id}/cover`,
};

export const dashboardApi = {
  stats: () => api.get("/dashboard/stats"),
};

export default api;