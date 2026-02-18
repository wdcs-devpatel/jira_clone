import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/auth`;

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

/* attach token automatically */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* auto logout if token invalid */
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("currentUser");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

/* register */
export const registerUser = async (userData: any) => {
  const res = await axios.post(`${API_URL}/register`, userData);
  return res.data;
};

/* login */
export const loginUser = async (identifier: string, password: string) => {
  const res = await axios.post(`${API_URL}/login`, {
    identifier,
    password,
  });
  return res.data;
};

/* logout */
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("currentUser");
};

/* auth check */
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

/* current user */
export const getCurrentUser = () => {
  const user = localStorage.getItem("currentUser");
  return user ? JSON.parse(user) : null;
};
