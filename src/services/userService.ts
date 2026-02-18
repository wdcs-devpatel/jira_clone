import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;

/**
 * User interface reflecting the database structure
 */
export interface User {
  id: number | string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  name?: string; // Derived or alias for UI components
}

/**
 * Fetches all users from the database.
 * Used for dropdowns and assignee lists.
 */
export async function getUsers(): Promise<User[]> {
  const token = localStorage.getItem("token");

  try {
    const res = await axios.get(`${API}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Maps backend 'username' to 'name' for frontend dropdown compatibility
    return res.data.map((u: any) => ({
      ...u,
      name: u.username, 
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

/**
 * Updates the logged-in user's profile.
 * Note: userId is included for compatibility, but the backend 
 * uses the JWT token to identify the user for security.
 */
export async function updateProfile(userId: any, profileData: any) {
  const token = localStorage.getItem("token");

  try {
    const res = await axios.put(`${API}/users/profile`, profileData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error: any) {
    console.error("Error updating profile:", error);
    throw new Error(error.response?.data?.message || "Failed to update profile");
  }
}