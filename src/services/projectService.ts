const BASE_URL = "http://localhost:5000/api/projects";

export interface Project {
  id: number;
  name: string;
  description?: string;
  priority?: string;
  teamLeader?: string;
}

/* =======================
   AUTH HEADER HELPER
======================= */
function authHeader(): HeadersInit {
  const user = localStorage.getItem("currentUser");

  return {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(user ? { "x-user": user } : {})
  };
}

/* =======================
   HANDLE RESPONSE HELPER
======================= */
async function handleResponse(res: Response) {
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      data?.message ||
      `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return data;
}

/* =======================
   GET ALL PROJECTS
======================= */
export async function getProjects(): Promise<Project[]> {
  const res = await fetch(BASE_URL, {
    method: "GET",
    headers: authHeader(),
  });

  return handleResponse(res);
}

/* =======================
   CREATE PROJECT
======================= */
export async function addProject(
  data: Partial<Project>
): Promise<Project> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: authHeader(),
    body: JSON.stringify(data),
  });

  return handleResponse(res);
}

/* =======================
   UPDATE PROJECT
======================= */
export async function updateProject(
  id: number,
  data: Partial<Project>
): Promise<Project> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: authHeader(),
    body: JSON.stringify(data),
  });

  return handleResponse(res);
}

/* =======================
   DELETE PROJECT
======================= */
export async function deleteProject(
  id: number | string
): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: authHeader(),
  });

  await handleResponse(res);
}
