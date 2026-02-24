import { api } from "./authService";

const BASE = "/projects";

export interface Project {
  id?: number;
  name: string;
  description?: string;
  priority?: string;
  teamLeader?: string;
}

  
export const getProjects = async (search: string = "", sort: string = "newest"): Promise<Project[]> => {
  const res = await api.get(BASE, {
    params: {
      search: search,
      sort: sort
    }
  });
  return res.data;
};

/* CREATE PROJECT */
export const addProject = async (data: Partial<Project>): Promise<Project> => {
  const res = await api.post(BASE, data);
  return res.data;
};

/* UPDATE */
export const updateProject = async (id: number, data: Partial<Project>): Promise<Project> => {
  const res = await api.put(`${BASE}/${id}`, data);
  return res.data;
};

/* DELETE */
export const deleteProject = async (id: number | string): Promise<void> => {
  await api.delete(`${BASE}/${id}`);
};