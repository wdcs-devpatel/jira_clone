export type UserId = string | number;

export interface Role {
  id: number;
  name: string; // e.g., "Admin", "Project Manager", "Team Leader"
}

export interface User {
  id: UserId;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  image?: string;
  phone?: string; 
  
  // 🔥 RBAC Fields
  role_id: number;
  Role?: Role;
  permissions: string[]; // e.g., ["create_project", "edit_task"]

  name?: string;     // Computed field for UI display
  [key: string]: any; 
}