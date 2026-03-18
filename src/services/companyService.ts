import axios from "axios";
const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5002/api";
export async function getCompanies() {
  try {
    const res = await axios.get(`${API}/companies`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch companies:", error);
    return [];
  }
}

export async function getUserCompanies() {
  try {
    const res = await axios.get(`${API}/companies/users`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch user companies:", error);
    return [];
  }
}

export async function updateUserCompany(userId: number, company: string) {
  try {
    const res = await axios.put(`${API}/companies/user/${userId}`, { company });
    return res.data;
  } catch (error) {
    console.error("Failed to update company:", error);
    throw error;  
  }
}

/* NEW FUNCTION */
export async function getUserCompany(userId: number) {
  try {
    const res = await axios.get(`${API}/companies/users`);
    const mapping = res.data.find((m: any) => m.userId === userId);
    return mapping?.company || "WebClues";
  } catch (err) {
    console.error("Failed to fetch user company:", err);
    return "WebClues";
  }
}