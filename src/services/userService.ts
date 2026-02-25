import { api } from "./authService";
import { User } from "../interfaces";

/**
 * GET ALL USERS (Admin Only)
 * Used to populate assignees in Kanban columns and Task details.
 */
export async function getUsers(): Promise<User[]> {
  try {
    const res = await api.get("/users"); // Calls the Admin-protected GET /api/users
    return res.data.map((u: any) => ({
      ...u,
      id: Number(u.id),
      // Construct a full name or fallback to username
      name: u.firstName || u.lastName 
        ? `${u.firstName || ""} ${u.lastName || ""}`.trim() 
        : u.username
    }));
  } catch (error: any) {
    // If you see 403 here, your user lacks the "view_users" permission
    console.error("Error fetching users: Check your RBAC permissions.", error);
    return [];
  }
}

/**
 * UPDATE USER ROLE (Admin Only)
 * Used in the Admin Panel to change a user's role assignment.
 */
export async function updateUserRole(userId: number | string, roleId: number) {
  try {
    const res = await api.put(`/users/${userId}/role`, { roleId });
    return res.data;
  } catch (error: any) {
    throw error;
  }
}

/**
 * UPDATE OWN PROFILE
 * Allows the current logged-in user to update their own details.
 */
export async function updateProfile(profileData: Partial<User>) {
  try {
    const res = await api.put("/users/profile", profileData);
    return res.data;
  } catch (error: any) {
    throw error;
  }
}