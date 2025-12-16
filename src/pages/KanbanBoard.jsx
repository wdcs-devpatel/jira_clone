import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getAllTasks,
  updateTaskStatus,
} from "../services/taskService";
import { enrichTasksWithProject } from "../utils/projectHelper";

const COLUMNS = [
  { key: "todo", title: "Todo" },
  { key: "in-progress", title: "In Progress" },
  { key: "done", title: "Done" },
];

export default function KanbanBoard() {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  async function loadTasks() {
    const data = await getAllTasks();
    const enriched = enrichTasksWithProject(data);
    setTasks(enriched.filter((t) => t.projectId === projectId));
  }

  function onDrop(e, status) {
    const taskId = Number(e.dataTransfer.getData("taskId"));

    updateTaskStatus(taskId, status);

    loadTasks();
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">
        Kanban Board – {projectId}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, col.key)}
            className="bg-slate-800 rounded-xl p-4 min-h-[400px]"
          >
            <h2 className="font-semibold mb-4">
              {col.title}
            </h2>

            {tasks
              .filter((t) => t.status === col.key)
              .map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) =>
                    e.dataTransfer.setData(
                      "taskId",
                      task.id
                    )
                  }
                  className="bg-slate-700 p-3 rounded-lg mb-3 cursor-grab hover:bg-slate-600"
                >
                  {task.title}
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
