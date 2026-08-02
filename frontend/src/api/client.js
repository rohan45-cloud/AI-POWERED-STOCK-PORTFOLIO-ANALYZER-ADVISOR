import axios from "axios";

/**
 * Central axios instance. baseURL is "/api/v1" and relies on the Vite dev
 * server proxy (see vite.config.js) to forward requests to the backend,
 * avoiding CORS issues in development. In production, the frontend and
 * API should be served such that /api/v1 resolves correctly (e.g. via
 * a reverse proxy or same-origin deployment).
 */
const api = axios.create({
  baseURL: "/api/v1",
  withCredentials: true, // send httpOnly auth cookie with every request
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Bearer token from localStorage as a fallback auth mechanism
// (useful if cookies are blocked, e.g. some mobile webviews)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize error responses so calling code can rely on err.message
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again.";

    if (error.response?.status === 401) {
      // Token invalid/expired — clear local auth state.
      // The auth store listens for this via the custom event below.
      localStorage.removeItem("token");
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    return Promise.reject({ ...error, message });
  }
);

export default api;
