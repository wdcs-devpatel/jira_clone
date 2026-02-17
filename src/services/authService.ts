import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/auth`;

export const registerUser = async (userData: any) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

export const loginUser = async (identifier: string, password: string) => {
  const response = await axios.post(`${API_URL}/login`, {
    identifier,
    password,
  });
  return response.data;
};