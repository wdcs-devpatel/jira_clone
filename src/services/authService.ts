    import axios from "axios";

    const API_URL = "http://localhost:5000/api/auth";

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