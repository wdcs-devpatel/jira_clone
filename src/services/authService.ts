import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
  
/* ==============================
   ENV CONFIG
============================== */
// ✅ Fixed: This service now strictly points to the Postgres API for Auth & Users
const BASE_URL = import.meta.env.VITE_POSTGRES_API || "http://localhost:5000/api";
const AUTH_URL = `${BASE_URL}/auth`;

/* ==============================
   AXIOS INSTANCE (Postgres Only)
============================== */
export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false, 
});

/* ==============================
   REQUEST INTERCEPTOR
============================== */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ==============================
   RESPONSE INTERCEPTOR
   Handles:
   - Auto refresh token via Postgres Auth server
   - Safe logout on session failure
============================== */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const originalRequest: any = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    /* ------------------------------
       TOKEN EXPIRED (401)
    ------------------------------ */
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token available");

        // Use standard axios for the refresh call to avoid interceptor loops
        const refreshResponse = await axios.post(`${AUTH_URL}/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } =
          refreshResponse.data;

        // Save new tokens locally
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // Retry the original request with the new Postgres token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Refresh token failed. Logging out...");

        localStorage.clear();
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    /* ------------------------------
       RBAC FORBIDDEN (403)
    ------------------------------ */
    if (error.response?.status === 403) {
      console.error(
        "RBAC Forbidden: User lacks required permissions for this action on the Postgres server."
      );
    }

    return Promise.reject(error);
  }
);

/* ==============================
   AUTH ACTIONS (Postgres Backend)
============================== */

export const loginUser = async (
  identifier: string,
  password: string
) => {
  const res = await axios.post(`${AUTH_URL}/login`, {
    identifier,
    password,
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
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  window.location.href = "/";
};