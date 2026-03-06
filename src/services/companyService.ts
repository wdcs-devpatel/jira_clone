import axios from "axios";
const API = "http://localhost:5001/api";

export async function getCompanies() {
  try {
    const res = await axios.get(`${API}/companies`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch companies:", error);
    return [];
  }
}

// ✅ Step 1 — Add API to get mappings
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