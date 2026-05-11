import axios from "axios";

const isProduction = import.meta.env.MODE === "production";
const baseURL = isProduction
  ? "https://webapi.thenestory.in/api"
  : "/api";

const axiosClient = axios.create({
  baseURL,
  withCredentials: true, // sends cookies automatically
});

let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve());
  failedQueue = [];
};

// ── REQUEST INTERCEPTOR ───────────────────────────────────
axiosClient.interceptors.request.use(
  (config) => {
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── RESPONSE INTERCEPTOR ─────────────────────────────────
axiosClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    const status          = err.response?.status;
    const code            = err.response?.data?.code;   // ✅ use code, not just status
    const url             = originalRequest?.url || "";

    // Don't retry these endpoints — infinite loop ban'ta tha
    const isAuthEndpoint =
      url.includes("/auth/login") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/logout");

    // ✅ Only refresh when we get TOKEN_EXPIRED code specifically
    // This prevents logout on real 401s (wrong password, no permission etc.)
    if (
      status === 401 &&
      code === "TOKEN_EXPIRED" &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      // Queue concurrent requests while refresh is in progress
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => axiosClient(originalRequest))
          .catch((e) => Promise.reject(e));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axiosClient.post("/auth/refresh");
        processQueue(null);
        return axiosClient(originalRequest); // retry original request
      } catch (refreshErr) {
        processQueue(refreshErr);

        // ✅ Only redirect on actual auth failure, not network/502 errors
        const refreshStatus = refreshErr.response?.status;
        if (refreshStatus === 401 || refreshStatus === 403) {
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default axiosClient;