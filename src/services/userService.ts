import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;

function authHeader() {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface User {
  id: number; // Strictly number
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  name?: string;
}

export async function getUsers(): Promise<User[]> {
  try {
    const res = await axios.get(`${API}/users`, { headers: authHeader() });

    return res.data.map((u: any) => ({
      ...u,
      id: Number(u.id), // Force numeric ID
      name: u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.username
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function updateProfile(userId: any, profileData: any) {
  const res = await axios.put(`${API}/users/profile`, profileData, { headers: authHeader() });
  return res.data;
}