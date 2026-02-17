const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const getTasks = async () => {
  const response = await fetch(`${BASE_URL}/tasks`);
  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }
  return response.json();
};

export const createTask = async (task: {
  title: string;
  description?: string;
  status?: string;
}) => {
  const response = await fetch(`${BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",   
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    throw new Error("Failed to create task");
  }

  return response.json();
};