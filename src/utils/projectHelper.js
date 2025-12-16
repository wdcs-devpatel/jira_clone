const STORAGE_KEY = "projects";

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

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  } catch {}

  return defaults;
}

export function addProject(project) {
  const projects = getProjects();
  projects.push(project);
  safeSet(projects);
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

function safeSet(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

/* ---------------- TASK ↔ PROJECT ---------------- */

export function enrichTasksWithProject(tasks = []) {
  let stored = {};

  try {
    stored = JSON.parse(localStorage.getItem("taskProjects")) || {};
  } catch {}

  const projects = getProjects();

  const enriched = tasks.map(task => {
    if (!stored[task.id]) {
      stored[task.id] =
        projects[task.id % projects.length]?.id || projects[0]?.id;
    }

    return { ...task, projectId: stored[task.id] };
  });

  try {
    localStorage.setItem("taskProjects", JSON.stringify(stored));
  } catch {}

  return enriched;
}
