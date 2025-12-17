const STORAGE_KEY = "projects";
const TASK_PROJECTS_KEY = "taskProjects"; 



function safeSet(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function getProjects() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(stored) && stored.length > 0) return stored;
  } catch {}


  const defaults = [
    { id: "alpha", name: "Project Alpha", description: "Main product work" },
    { id: "beta", name: "Project Beta", description: "Internal improvements" },
    { id: "gamma", name: "Project Gamma", description: "Experimental features" },
  ];

  safeSet(defaults);
  return defaults;
}

export function addProject(project) {
  const projects = getProjects();

  const newProject = { ...project, id: project.id || `proj-${Date.now()}` };
  projects.push(newProject);
  safeSet(projects);
  return newProject;
}

export function updateProject(id, updates) {
  const projects = getProjects().map(p =>
    p.id === id ? { ...p, ...updates } : p
  );
  safeSet(projects);
}

export function deleteProject(id) {
  const projects = getProjects().filter(p => p.id !== id);
  safeSet(projects);
}

export function enrichTasksWithProject(tasks = []) {
  let storedMap = {};

  try {
    storedMap = JSON.parse(localStorage.getItem(TASK_PROJECTS_KEY)) || {};
  } catch {}

  const projects = getProjects();
  if (projects.length === 0) return tasks; 

  const enriched = tasks.map(task => {
   
    if (task.projectId) {
        
        if (!storedMap[task.id]) {
            storedMap[task.id] = task.projectId;
        }
        return task;
    }

   
    if (storedMap[task.id]) {
      return { ...task, projectId: storedMap[task.id] };
    }


    const numericId = Number(task.id);
   
    const projectIndex = !isNaN(numericId) ? numericId % projects.length : 0;
    const assignedProjectId = projects[projectIndex]?.id || projects[0].id;

    
    storedMap[task.id] = assignedProjectId;

    return { ...task, projectId: assignedProjectId };
  });

  try {
    localStorage.setItem(TASK_PROJECTS_KEY, JSON.stringify(storedMap));
  } catch {}

  return enriched;
}