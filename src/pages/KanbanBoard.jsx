import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Plus, Pencil, Trash2, X, ArrowLeft } from "lucide-react";
import { getAllTasks, addTask, updateTask, deleteTask, updateTaskStatus } from "../services/taskService";
import { enrichTasksWithProject } from "../utils/projectHelper";

const COLUMNS = [
  { key: "todo", title: "To Do" },
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
    try {
      const all = await getAllTasks();
      const enriched = enrichTasksWithProject(all);
      setTasks(enriched.filter(t => String(t.projectId) === String(projectId)));
    } catch (error) {
      console.error(error);
    }
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
        projectId: projectId 
      });
    } else {
      await addTask({
        title,
        status: targetStatus,
        projectId: projectId, 
        createdAt: new Date().toISOString()
      });
    }

    setShowModal(false);
    await loadTasks();
  }

  async function handleDelete(taskId) {
    if (!confirm("Delete this task?")) return;
    await deleteTask(taskId);
    loadTasks();
  }

  async function onDrop(e, status) {
    e.preventDefault();
    const droppedId = e.dataTransfer.getData("taskId");
    
    const task = tasks.find(t => t.id == droppedId);
    
    if (task) {
      await updateTaskStatus(task.id, status);
      loadTasks();
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100 font-sans">
      <div className="mb-6">
        <Link to="/dashboard" className="text-slate-400 hover:text-white flex items-center gap-2 mb-4 text-sm">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold">
            Kanban Board – <span className="text-indigo-400">{projectId}</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map(col => (
          <div
            key={col.key}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, col.key)}
            className="bg-slate-800/60 rounded-2xl p-4 min-h-[420px] border border-slate-700/50"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-slate-200">{col.title}</h2>
              <button
                onClick={() => openAdd(col.key)}
                className="p-1 rounded-lg hover:bg-indigo-500/20 text-indigo-400 transition-colors"
              >
                <Plus size={20} />
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
                  className="group bg-slate-700/60 p-3 rounded-xl mb-3 cursor-grab hover:bg-slate-700 border border-transparent hover:border-indigo-500/30 transition-all shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <p className="pr-4 text-sm font-medium">{task.title}</p>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(task)}
                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-indigo-600 transition-all"
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-red-600 transition-all"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {tasks.filter(t => t.status === col.key).length === 0 && (
                  <div className="text-center py-8 text-slate-600 text-sm border-2 border-dashed border-slate-700/30 rounded-lg">
                      Drop items here
                  </div>
              )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white">
                {editingTask ? "Edit Task" : "Add Task"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Title
                    </label>
                    <input
                      autoFocus
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="What needs to be done?"
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                    />
                </div>
                
                <div>
                     <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Status
                    </label>
                    <select 
                        value={targetStatus}
                        onChange={(e) => setTargetStatus(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500/50 outline-none"
                    >
                        {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.title}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim()}
                className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}