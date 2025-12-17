import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getAllTasks } from "../services/taskService";
import { enrichTasksWithProject } from "../utils/projectHelper";
import Modal from "../components/Modal";
import TaskDetails from "./TaskDetails";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  async function loadTasks() {
    try {
      const raw = await getAllTasks();
      const enriched = enrichTasksWithProject(raw);
      setTasks(enriched);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, [location.pathname]); // ✅ THIS IS THE FIX

  if (loading) {
    return <p className="p-6 text-slate-400">Loading tasks…</p>;
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-semibold mb-6">Task List</h1>

      <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
        <div className="grid grid-cols-12 px-4 py-3 text-xs text-slate-400 border-b border-slate-700">
          <div className="col-span-7">Title</div>
          <div className="col-span-3">Project</div>
          <div className="col-span-2">Status</div>
        </div>

        {tasks.map(task => (
          <div
            key={task.id}
            onClick={() => setSelectedTask(task)}
            className="grid grid-cols-12 px-4 py-3 text-sm border-b border-slate-700 hover:bg-slate-700 cursor-pointer"
          >
            <div className="col-span-7 truncate">
              {task.title}
            </div>

            <div className="col-span-3 text-slate-400">
              {task.projectId}
            </div>

            <div className="col-span-2">
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  task.status === "done"
                    ? "bg-green-600/80"
                    : "bg-yellow-600/80"
                }`}
              >
                {task.status}
              </span>
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="px-4 py-6 text-center text-slate-400">
            No tasks found
          </div>
        )}
      </div>

      <Modal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      >
        {selectedTask && <TaskDetails task={selectedTask} />}
      </Modal>
    </div>
  );
}
