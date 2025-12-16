export const PROJECTS = [
  { id: "alpha", name: "Project Alpha" },
  { id: "beta", name: "Project Beta" },
  { id: "gamma", name: "Project Gamma" },
];

export function assignProject(taskId) {
  const mod = taskId % 3;
  if (mod === 0) return "alpha";
  if (mod === 1) return "beta";
  return "gamma";
}

export function enrichTasksWithProject(tasks) {
  const stored = JSON.parse(localStorage.getItem("taskProjects")) || {};

  const updated = tasks.map(task => {
    if (!stored[task.id]) {
      stored[task.id] = assignProject(task.id);
    }
    return {
      ...task,
      projectId: stored[task.id],
    };
  });

  localStorage.setItem("taskProjects", JSON.stringify(stored));
  return updated;
}
