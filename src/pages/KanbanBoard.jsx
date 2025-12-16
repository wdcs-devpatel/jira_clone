import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import {
  getAllTasks,
  addTask,
  updateTask,
  deleteTask,
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
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [title, setTitle] = useState("");
  const [targetStatus, setTargetStatus] = useState("todo");

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  async function loadTasks() {
    const all = await getAllTasks();
    const enriched = enrichTasksWithProject(all);
    setTasks(enriched.filter(t => t.projectId === projectId));
  }

  function openAdd(status) {
    setEditingTask(null);
    setTitle("");
    setTargetStatus(status);
    setShowModal(true);
  }

  function openEdit(task) {
    setEditingTask(task);
    setTitle(task.title);
    setTargetStatus(task.status);
    setShowModal(true);
  }

  async function handleSave() {
    if (!title.trim()) return;

    if (editingTask) {
      await updateTask(editingTask.id, {
        title,
        status: targetStatus,
      });
    } else {
      await addTask({
        title,
        status: targetStatus,
      });
    }

    setShowModal(false);
    loadTasks();
  }

  async function handleDelete(taskId) {
    if (!confirm("Delete this task?")) return;
    await deleteTask(taskId);
    loadTasks();
  }

  function onDrop(e, status) {
    const taskId = Number(e.dataTransfer.getData("taskId"));
    updateTaskStatus(taskId, status);
    loadTasks();
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">

      <h1 className="text-2xl font-bold mb-6">
        Kanban Board – {projectId}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map(col => (
          <div
            key={col.key}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, col.key)}
            className="bg-slate-800/60 rounded-2xl p-4 min-h-[420px]"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">{col.title}</h2>

              <button
                onClick={() => openAdd(col.key)}
                className="p-1 rounded-lg hover:bg-indigo-500/20 text-indigo-400"
                title={`Add task to ${col.title}`}
              >
                <Plus size={16} />
              </button>
            </div>

            {tasks
              .filter(t => t.status === col.key)
              .map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) =>
                    e.dataTransfer.setData("taskId", task.id)
                  }
                  className="group bg-slate-700/60 p-3 rounded-xl mb-3 cursor-grab hover:bg-slate-700 transition"
                >
                  <div className="flex justify-between items-start">
                    <p className="pr-4">{task.title}</p>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={() => openEdit(task)}
                        className="p-1 hover:text-indigo-400"
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-1 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-2xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {editingTask ? "Edit Task" : "Add Task"}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X />
              </button>
            </div>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-indigo-600 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
