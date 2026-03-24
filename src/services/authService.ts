import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
  
/* ==============================
   ENV CONFIG
============================== */
// ✅ All requests now route through the API Gateway
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5002/api";
const AUTH_URL = `${BASE_URL}/auth`;

/* ==============================
   AXIOS INSTANCE
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
/**
 * REFRESH TOKEN
 * Standalone function to manually or automatically trigger a token rotate.
 */
export const refreshToken = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("No refresh token available");

  const refreshResponse = await axios.post(`${AUTH_URL}/refresh`, {
    refreshToken,
  });

  const { accessToken, refreshToken : newRefreshToken } = refreshResponse.data;

  // Save new tokens locally
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", newRefreshToken);

  return accessToken;
};

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
        const accessToken = await refreshToken();

        // Retry the original request with the new token
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
        "RBAC Forbidden: User lacks required permissions for this action."
      );
    }

    return Promise.reject(error);
  }
);

/* ==============================
   AUTH ACTIONS
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