// src/utils/url.js  (ek baar banao, sab jagah use karo)
const API_BASE = import.meta.env.MODE === "production"
  ? "https://webapi.thenestory.in"
  : "http://localhost:5000";

export const getImageUrl = (path) => {
  if (!path) return null;
  // Already absolute URL hai (http/https se start)
  if (path.startsWith("http")) return path;
  // Relative path — backend base lagao
  return `${API_BASE}${path}`;
};