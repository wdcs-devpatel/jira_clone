  import { api } from "./authService";
  import { User } from "../interfaces";

  /**
   * GET ALL USERS (Admin Only)
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
   * ✅ FIXED: Sends roleId in the body to avoid the 404 URL error
   */
  export async function updateUserRole(userId: number | string, roleId: number) {
    try {
      // Sends userId in URL and roleId in JSON body
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