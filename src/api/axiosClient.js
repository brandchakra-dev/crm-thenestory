import axios from "axios";

const isProduction = import.meta.env.MODE === 'production';
const baseURL = isProduction 
  ? 'https://webapi.thenestory.in/api'
  : '/api'; 

const axiosClient = axios.create({
  baseURL: baseURL,
  withCredentials: true, // ✅ This sends cookies automatically
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve());
  failedQueue = [];
};

// ✅ REQUEST INTERCEPTOR
axiosClient.interceptors.request.use(
  (config) => {
    // Set Content-Type for non-FormData
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ RESPONSE INTERCEPTOR
axiosClient.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;
    const status = err.response?.status;
    const url = originalRequest?.url || "";

    if (
      status === 401 &&
      !originalRequest._retry &&
      !url.includes("/auth/login") &&
      !url.includes("/auth/refresh") &&
      !url.includes("/auth/me")
    ) {

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => axiosClient(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axiosClient.post("/auth/refresh");
        processQueue(null);
        return axiosClient(originalRequest);
      } catch (e) {
        processQueue(e);
        
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default axiosClient;