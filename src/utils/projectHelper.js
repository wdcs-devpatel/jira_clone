
export const PROJECTS = [
  { id: "alpha", name: "Project Alpha", description: "Main product work" },
  { id: "beta", name: "Project Beta", description: "Internal improvements" },
  { id: "gamma", name: "Project Gamma", description: "Experimental features" },
];

function assignProject(taskId) {
  const mod = taskId % 3;
  if (mod === 0) return "alpha";
  if (mod === 1) return "beta";
  return "gamma";
}

export function enrichTasksWithProject(tasks = []) {
  let stored = {};

  try {
    stored = JSON.parse(localStorage.getItem("taskProjects")) || {};
  } catch {
    stored = {};
  }

  const enriched = tasks.map((task) => {
    if (!stored[task.id]) {
      stored[task.id] = assignProject(task.id);
    }

    return {
      ...task,
      projectId: stored[task.id],
    };
  });

  try {
    localStorage.setItem("taskProjects", JSON.stringify(stored));
  } catch {
  }

  return enriched;
}
