import { create } from "zustand";
import { authApi } from "../api/auth.js";
import { disconnectSocket } from "../api/socket.js";

/**
 * Global auth state. Holds the current user, loading flags, and auth actions.
 * `isInitializing` lets the router know when the initial "am I logged in?"
 * check (via /auth/me) is still in flight, so it can show a loading state
 * instead of flashing the login page before redirecting.
 */
export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  isLoading: false,
  error: null,

  // Called once on app load to check for an existing valid session
  initialize: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      set({ isInitializing: false });
      return;
    }
    try {
      const { user } = await authApi.getMe();
      set({ user, isAuthenticated: true, isInitializing: false });
    } catch {
      localStorage.removeItem("token");
      set({ user: null, isAuthenticated: false, isInitializing: false });
    }
  },

  signup: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authApi.signup(payload);
      localStorage.setItem("token", token);
      set({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, message: err.message };
    }
  },

  login: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authApi.login(payload);
      localStorage.setItem("token", token);
      set({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, message: err.message };
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // even if the server call fails, clear local state so the user can still log out
    }
    localStorage.removeItem("token");
    disconnectSocket();
    set({ user: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));

// When the API client detects a 401, force local logout state so the UI
// reacts immediately (e.g. redirect to login) without waiting on a manual call.
window.addEventListener("auth:unauthorized", () => {
  useAuthStore.setState({ user: null, isAuthenticated: false });
});
