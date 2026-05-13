import axios from "axios";

const isProduction = import.meta.env.MODE === "production";
const baseURL = isProduction
  ? "https://webapi.thenestory.in/api"
  : "/api";

const axiosClient = axios.create({
  baseURL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve());
  failedQueue = [];
};

// ── REQUEST INTERCEPTOR ──────────────────────────────────
axiosClient.interceptors.request.use(
  (config) => {
    // Content-Type set karo (FormData ke liye nahi)
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    // ✅ Har request mein accessToken Bearer header se bhejo
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
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
    const code            = err.response?.data?.code;
    const url             = originalRequest?.url || "";

    // In endpoints pe retry mat karo — infinite loop hoga
    const isAuthEndpoint =
      url.includes("/auth/login") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/logout");

    // ✅ Sirf TOKEN_EXPIRED pe refresh karo
    if (
      status === 401 &&
      code === "TOKEN_EXPIRED" &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      // Agar refresh already chal raha hai toh queue mein daal do
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosClient(originalRequest))
          .catch((e) => Promise.reject(e));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // ✅ refreshToken body mein bhejo (cross-origin cookie nahi aati)
        const refreshToken = localStorage.getItem("refreshToken");

        const res = await axiosClient.post("/auth/refresh", {
          refreshToken, // backend req.body.refreshToken se padega
        });

        // ✅ Naye dono tokens localStorage mein save karo
        const newAccessToken  = res.data.accessToken;
        const newRefreshToken = res.data.refreshToken;

        localStorage.setItem("accessToken",  newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        processQueue(null);
        return axiosClient(originalRequest); // original request retry karo

      } catch (refreshErr) {
        processQueue(refreshErr);

        // Sirf real auth failure pe /login redirect karo
        const refreshStatus = refreshErr.response?.status;
        if (refreshStatus === 401 || refreshStatus === 403) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
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