const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/projects`;

export interface Project {
  id?: number; 
  name: string;
  description?: string;
  priority?: string;
  teamLeader?: string;
}

/**
 * FIXED: Updated to use accessToken
 */
function authHeader(): HeadersInit | undefined {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export async function getProjects(): Promise<Project[]> {
  const res = await fetch(BASE_URL, {
    method: "GET",
    headers: authHeader() || {},
  });
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

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

export async function deleteProject(id: number | string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: authHeader() || {},
  });
  if (!res.ok) throw new Error("Failed to delete project");
}