const BASE_URL = "http://localhost:5000/api/projects";

export interface Project {
  id: number;
  name: string;
  description?: string;
  priority?: string;
}

/* =======================
   GET ALL PROJECTS
======================= */
export async function getProjects(): Promise<Project[]> {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

/* =======================
   CREATE PROJECT
======================= */
export async function addProject(data: Partial<Project>): Promise<Project> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
    headers: { "Content-Type": "application/json" },
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
  });
  if (!res.ok) throw new Error("Failed to delete project");
}