import axios from "axios";
const API = import.meta.env.VITE_API_BASE_URL;

export interface User {
  id: number | string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  name?: string;
}

export async function getUsers(): Promise<User[]> {
  const token = localStorage.getItem("token");
  try {
    const res = await axios.get(`${API}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.map((u: any) => ({
      ...u,
      name: u.firstName && u.lastName ? `${u.firstName} ${u.lastName}` : u.username,
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function updateProfile(userId: any, profileData: any) {
  const token = localStorage.getItem("token");
  const res = await axios.put(`${API}/users/profile`, profileData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}