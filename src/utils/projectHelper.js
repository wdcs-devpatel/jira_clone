const STORAGE_KEY = "projects";
const TASK_PROJECTS_KEY = "taskProjects"; // Consistent key

/* =========================
   PROJECT MANAGMENT
   ========================= */

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

  // Default Projects
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
  // Ensure we add a unique ID if not provided
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


/* =========================
   TASK ↔ PROJECT MAPPING (FIXED)
   ========================= */

export function enrichTasksWithProject(tasks = []) {
  let storedMap = {};

  try {
    storedMap = JSON.parse(localStorage.getItem(TASK_PROJECTS_KEY)) || {};
  } catch {}

  const projects = getProjects();
  if (projects.length === 0) return tasks; // Safety check

  const enriched = tasks.map(task => {
    // 1. If task ALREADY has a projectId (from manual creation), use it.
    if (task.projectId) {
        // Ensure we save this mapping so it persists if we reload
        if (!storedMap[task.id]) {
            storedMap[task.id] = task.projectId;
        }
        return task;
    }

    // 2. If we already mapped this task automatically before, use that.
    if (storedMap[task.id]) {
      return { ...task, projectId: storedMap[task.id] };
    }

    // 3. Fallback: Assign to a random default project (Round Robin)
    // Use modulo logic only for old dummy tasks without IDs
    const numericId = Number(task.id);
    // If ID is not a number (UUID), default to first project
    const projectIndex = !isNaN(numericId) ? numericId % projects.length : 0;
    const assignedProjectId = projects[projectIndex]?.id || projects[0].id;

    // Save this new mapping
    storedMap[task.id] = assignedProjectId;

    return { ...task, projectId: assignedProjectId };
  });

  // Save updated mappings back to localStorage
  try {
    localStorage.setItem(TASK_PROJECTS_KEY, JSON.stringify(storedMap));
  } catch {}

  return enriched;
}