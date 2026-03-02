import { api } from "./authService";
import { User } from "../interfaces";

/**
 * GET CURRENT USER PROFILE
 * Fetches the most up-to-date data for the logged-in user, including permissions.
 * Essential for syncing UI after role/permission changes.
 */
export async function getProfile(): Promise<User> {
  try {
    const res = await api.get("/users/profile");
    return res.data;
  } catch (error: any) {
    console.error("Profile sync failed:", error);
    throw error;
  }
}

/**
 * GET ALL USERS (Admin Only)
 * Protected by 'view_users' permission on the backend.
 */
export async function getUsers(): Promise<User[]> {
  try {
    const res = await api.get("/users");
    return res.data.map((u: any) => ({
      ...u,
      id: Number(u.id),
      name: u.firstName || u.lastName 
        ? `${u.firstName || ""} ${u.lastName || ""}`.trim() 
        : u.username
    }));
  } catch (error: any) {
    console.error("Error fetching users: Check your RBAC permissions.", error);
    return [];
  }
}

/**
 * UPDATE USER ROLE (Admin Only)
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
 */
export async function updateProfile(profileData: Partial<User>) {
  try {
    const res = await api.put("/users/profile", profileData);
    return res.data;
  } catch (error: any) {
    throw error;
  }
}