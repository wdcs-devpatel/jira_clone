import { api } from "./authService";

const BASE = "/projects";

export interface Project {
  id?: number;
  name: string;
  description?: string;
  priority?: string;
  teamLeader?: string;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * GET ALL PROJECTS
 * Fetches projects based on search query and sort order.
 */
export const getProjects = async (search: string = "", sort: string = "newest"): Promise<Project[]> => {
  const res = await api.get(BASE, {
    params: {
      search: search,
      sort: sort
    }
  });
  return res.data;
};

/**
 * CREATE PROJECT
 * Uses POST /api/projects
 */
export const addProject = async (data: Partial<Project>): Promise<Project> => {
  const res = await api.post(BASE, data);
  return res.data;
};

/**
 * GET SINGLE PROJECT
 * Uses GET /api/projects/:id
 */
export const getProjectById = async (id: number | string): Promise<Project> => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

/**
 * UPDATE PROJECT
 * Uses PUT /api/projects/:id
 */
export const updateProject = async (id: number | string, data: Partial<Project>): Promise<Project> => {
  const res = await api.put(`${BASE}/${id}`, data);
  return res.data;
};

/**
 * DELETE PROJECT
 * Uses DELETE /api/projects/:id
 */
export const deleteProject = async (id: number | string): Promise<void> => {
  await api.delete(`${BASE}/${id}`);
};