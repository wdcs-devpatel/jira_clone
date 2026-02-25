import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const AUTH_URL = `${BASE_URL}/auth`;

/* ==============================
   AXIOS INSTANCE
============================== */
export const api = axios.create({
  baseURL: BASE_URL,
});

/* ==============================
   REQUEST INTERCEPTOR
============================== */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ==============================
   AUTO REFRESH & ERROR HANDLING
============================== */
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // Handle Token Expiration
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const refreshRes = await axios.post(`${AUTH_URL}/refresh`, {
          refreshToken
        });

        const { accessToken, refreshToken: newRefresh } = refreshRes.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefresh);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api.request(originalRequest);

      } catch (refreshError) {
        // ✅ Clear everything on failure to prevent 403 loops
        localStorage.clear();
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    // ✅ Log 403 errors specifically for RBAC debugging
    if (err.response?.status === 403) {
      console.error("RBAC Forbidden: User lacks required permissions for this action.");
    }

    return Promise.reject(err);
  }
);

/* ==============================
   AUTH ACTIONS
============================== */
export const loginUser = async (identifier: string, password: string) => {
  const res = await axios.post(`${AUTH_URL}/login`, {
    identifier,
    password
  });
  return res.data;
};

export const registerUser = async (userData: {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
}) => {
  const res = await axios.post(`${AUTH_URL}/register`, userData);
  return res.data;
};

export const logoutUser = () => {
  localStorage.clear();
  window.location.href = "/";
};