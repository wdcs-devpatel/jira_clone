import { api } from "./authService";

export async function getCompanies() {
  try {
    const res = await api.get("/companies");
    return res.data;
  } catch (error) {
    console.error("Failed to fetch companies:", error);
    return [];
  }
}

export async function getUserCompanies() {
  try {
    const res = await api.get("/companies/users");
    return res.data;
  } catch (error) {
    console.error("Failed to fetch user companies:", error);
    return [];
  }
}

export async function updateUserCompany(userId: number, company: string) {
  try {
    const res = await api.put(`/companies/user/${userId}`, { company });
    return res.data;
  } catch (error) {
    console.error("Failed to update company:", error);
    throw error;  
  }
}

/* NEW FUNCTION */
export async function getUserCompany(userId: number) {
  try {
    const res = await api.get("/companies/users");
    const mapping = res.data.find((m: any) => m.userId === userId);
    return mapping?.company || "WebClues";
  } catch (err) {
    console.error("Failed to fetch user company:", err);
    return "WebClues";
  }
}