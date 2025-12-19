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
  const { theme } = useState(); 
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
    <div className="p-6 transition-colors">
      <div className="mb-6">
        <Link to="/dashboard" className="text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white flex items-center gap-2 mb-4 text-sm font-medium">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Kanban Board – <span className="text-indigo-600 dark:text-indigo-400 font-mono">{projectId}</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map(col => (
          <div
            key={col.key}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, col.key)}
            className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-4 min-h-[500px] border border-slate-200 dark:border-slate-700/50 shadow-inner"
          >
            <div className="flex justify-between items-center mb-4 px-1">
              <h2 className="font-bold text-slate-700 dark:text-slate-200 uppercase text-xs tracking-widest">{col.title}</h2>
              <button
                onClick={() => openAdd(col.key)}
                className="p-1 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {tasks
                .filter(t => t.status === col.key)
                .map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("taskId", task.id)}
                    className="group bg-white dark:bg-slate-700/60 p-4 rounded-xl cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-indigo-500/50 dark:hover:bg-slate-700 border border-slate-200 dark:border-transparent transition-all shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <p className="pr-4 text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">{task.title}</p>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(task)}
                          className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-all"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
              
            {tasks.filter(t => t.status === col.key).length === 0 && (
                <div className="flex items-center justify-center h-24 text-slate-400 dark:text-slate-600 text-xs font-medium border-2 border-dashed border-slate-200 dark:border-slate-700/50 rounded-xl mt-2">
                    Empty Column
                </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingTask ? "Edit Task" : "Add Task"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter mb-2">
                        Task Title
                    </label>
                    <input
                      autoFocus
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Design System updates"
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                </div>
                
                <div>
                     <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter mb-2">
                        Move to Status
                    </label>
                    <select 
                        value={targetStatus}
                        onChange={(e) => setTargetStatus(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none transition-all cursor-pointer"
                    >
                        {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.title}</option>)}
                    </select>
                </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim()}
                className="px-6 py-2.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}