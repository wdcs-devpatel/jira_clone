import { api } from "./authService";

/**
 * GET ALL ROLES WITH PERMISSIONS
 */
export async function getRolesWithPermissions() {
  try {
    const res = await api.get("/roles");
    return res.data;
  } catch (error: any) {
    console.error("Error fetching roles:", error);
    throw error;
  }
}

/**
 * GET ALL AVAILABLE PERMISSIONS
 */
export async function getAllPermissions() {
  try {
    const res = await api.get("/permissions");
    return res.data;
  } catch (error: any) {
    console.error("Error fetching permissions:", error);
    throw error;
  }
}

/**
 * UPDATE ROLE PERMISSIONS
 * Overwrites existing permissions with the new set of IDs
 */
export async function updateRolePermissions(roleId: number, permissionIds: number[]) {
  try {
    const res = await api.put(`/roles/${roleId}/permissions`, { permissionIds });
    return res.data;
  } catch (error: any) {
    throw error;
  }
}