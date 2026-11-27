import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Access token lives in memory; sessionStorage only lets a page reload in the same tab
// restore the session (validated against /auth/me before use).
const TOKEN_KEY = "omnihealth.token";
let authToken = null;
let unauthorizedHandler = null;

const storage = {
  get: () => {
    try {
      return sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (value) => {
    try {
      if (value) sessionStorage.setItem(TOKEN_KEY, value);
      else sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage unavailable: session lasts until reload */
    }
  },
};

export const setAuthToken = (token) => {
  authToken = token || null;
  storage.set(authToken);
};

export const getStoredToken = () => storage.get();

/** Called once (from the store setup) with a function that logs the user out. */
export const onUnauthorized = (handler) => {
  unauthorizedHandler = handler;
};

api.interceptors.request.use((config) => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLogin = error?.config?.url?.includes("/auth/login");
    if (error?.response?.status === 401 && !isLogin && authToken) {
      setAuthToken(null);
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  }
);

export default api;
