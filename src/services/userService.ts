import { api } from "./authService";
import { User } from "../interfaces";

/**
 * GET ALL USERS
 * Uses the interceptor to automatically attach tokens and handle base URL.
 */
export async function getUsers(): Promise<User[]> {
  try {
    const res = await api.get("/users");

    // Map results to ensure consistent data types and name formatting
    return res.data.map((u: any) => ({
      ...u,
      id: Number(u.id), // Ensure ID is a number
      name: u.firstName && u.lastName 
        ? `${u.firstName} ${u.lastName}` 
        : u.username
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}


export async function updateProfile(userId: string | number, profileData: Partial<User>) {
  try {
    // We send profileData which now includes the 'position' field from the form
    const res = await api.put("/users/profile", profileData);
    return res.data;
  } catch (error: any) {
    // Re-throw so the frontend Toast can capture the error message
    throw error;
  }
}