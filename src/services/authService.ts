import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/auth`;

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

/* Attach access token automatically */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* AUTO REFRESH TOKEN */
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const refreshRes = await axios.post(`${API_URL}/refresh`, {
          refreshToken
        });

        const { accessToken, refreshToken: newRefresh } = refreshRes.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefresh);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api.request(originalRequest);

      } catch (refreshError) {
        localStorage.clear();
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(err);
  }
);

/* LOGIN */
export const loginUser = async (identifier: string, password: string) => {
  const res = await axios.post(`${API_URL}/login`, {
    identifier,
    password
  });
  return res.data;
};

/* REGISTER */
export const registerUser = async (userData: {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  position: string; // ADDED: Now explicitly expects the position/role
  password: string;
}) => {
  // The full userData object is sent to the backend register controller
  const res = await axios.post(`${API_URL}/register`, userData);
  return res.data;
};

/* LOGOUT */
export const logoutUser = () => {
  localStorage.clear();
};