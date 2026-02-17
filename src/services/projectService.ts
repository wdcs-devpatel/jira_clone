const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/projects`;

/**
 * FIXED: id is now optional (?) to support both 
 * creation (no ID) and updates (with ID).
 */
export interface Project {
  id?: number; 
  name: string;
  description?: string;
  priority?: string;
  teamLeader?: string;
}

function authHeader(): HeadersInit | undefined {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

/* =======================
   GET ALL PROJECTS
======================= */
export async function getProjects(): Promise<Project[]> {
  const res = await fetch(BASE_URL, {
    method: "GET",
    headers: authHeader() || {},
  });
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

/* =======================
   CREATE PROJECT
======================= */
export async function addProject(data: Partial<Project>): Promise<Project> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      ...(authHeader() || {}) 
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create project");
  return res.json();
}

/* =======================
   UPDATE PROJECT
======================= */
export async function updateProject(id: number, data: Partial<Project>): Promise<Project> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json", 
      ...(authHeader() || {}) 
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update project");
  return res.json();
}

/* =======================
   DELETE PROJECT
======================= */
export async function deleteProject(id: number | string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: authHeader() || {},
  });
  if (!res.ok) throw new Error("Failed to delete project");
}