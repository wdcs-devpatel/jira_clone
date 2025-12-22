const DEFAULT_PROJECTS = [
  { id: "alpha", name: "Project Alpha", description: "Main product work", priority: "high" },
  { id: "beta", name: "Project Beta", description: "Internal improvements", priority: "low" },
  { id: "gamma", name: "Project Gamma", description: "Experimental features", priority: "medium" },
];

export function getProjects(token) {
  if (!token) return DEFAULT_PROJECTS;
  try {
    const key = `projects_${token}`;
    const stored = JSON.parse(localStorage.getItem(key));
    const userProjects = Array.isArray(stored) ? stored : [];
    return [...DEFAULT_PROJECTS, ...userProjects];
  } catch {
    return DEFAULT_PROJECTS;
  }
}

export function addProject(project, token) {
  if (!token) return;
  const key = `projects_${token}`;
  const stored = JSON.parse(localStorage.getItem(key)) || [];
  const newProject = { 
    ...project, 
    id: `proj-${Date.now()}`,
    priority: project.priority || "medium" 
  };
  const updated = [...stored, newProject];
  localStorage.setItem(key, JSON.stringify(updated));
  return newProject;
}

export function updateProject(id, updates, token) {
  if (!token) return;
  const key = `projects_${token}`;
  const stored = JSON.parse(localStorage.getItem(key)) || [];
  const updated = stored.map(p => p.id === id ? { ...p, ...updates } : p);
  localStorage.setItem(key, JSON.stringify(updated));
}

export function deleteProject(id, token) {
  if (["alpha", "beta", "gamma"].includes(id) || !token) return;
  const key = `projects_${token}`;
  const stored = JSON.parse(localStorage.getItem(key)) || [];
  const updated = stored.filter(p => p.id !== id);
  localStorage.setItem(key, JSON.stringify(updated));
}

export function enrichTasksWithProject(tasks = [], token) {
  const mapKey = token ? `taskProjects_${token}` : null;
  if (!mapKey) return tasks;
  let storedMap = {};
  try {
    storedMap = JSON.parse(localStorage.getItem(mapKey)) || {};
  } catch {
    storedMap = {};
  }
  const projects = getProjects(token);
  const enriched = tasks.map(task => {
    if (task.projectId) {
      if (!storedMap[task.id]) storedMap[task.id] = task.projectId;
      return task;
    }
    if (storedMap[task.id]) return { ...task, projectId: storedMap[task.id] };
    let hash = 0;
    const strId = String(task.id);
    for (let i = 0; i < strId.length; i++) {
      hash = strId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const projectIndex = Math.abs(hash) % projects.length;
    const assignedProjectId = projects[projectIndex]?.id || projects[0].id;
    storedMap[task.id] = assignedProjectId;
    return { ...task, projectId: assignedProjectId };
  });
  localStorage.setItem(mapKey, JSON.stringify(storedMap));
  return enriched;
}