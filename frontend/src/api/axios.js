// client/src/app/api.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "https://book-my-ticket-g3yg.onrender.com";

const api = axios.create({
  baseURL: API_BASE + "/api",
  headers: { "Content-Type": "application/json" },
});

// optional: attach token from localStorage for non-SSR simple apps
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
