import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Plus, Pencil, Trash2, X, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getAllTasks, addTask, updateTask, deleteTask, updateTaskStatus } from "../services/taskService";
import { enrichTasksWithProject } from "../utils/projectHelper";

const COLUMNS = [
  { key: "todo", title: "To Do" },
  { key: "in-progress", title: "In Progress" },
  { key: "done", title: "Done" },
];

export default function KanbanBoard() {
  const { projectId } = useParams();
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [title, setTitle] = useState("");
  const [targetStatus, setTargetStatus] = useState("todo");

  useEffect(() => {
    if (token) loadTasks();
  }, [projectId, token]);

  async function loadTasks() {
    try {
      const all = await getAllTasks(token);
      const enriched = enrichTasksWithProject(all, token);
      setTasks(enriched.filter(t => String(t.projectId) === String(projectId)));
    } catch (error) {
      console.error(error);
    }
  }

  async function handleSave() {
    if (!title.trim()) return;
    if (editingTask) {
      await updateTask(editingTask.id, { title, status: targetStatus, projectId }, token);
    } else {
      await addTask({ title, status: targetStatus, projectId }, token);
    }
    setShowModal(false);
    loadTasks();
  }

  async function handleDelete(taskId) {
    if (!confirm("Delete this task?")) return;
    await deleteTask(taskId, token);
    loadTasks();
  }

  async function onDrop(e, status) {
    e.preventDefault();
    const droppedId = e.dataTransfer.getData("taskId");
    await updateTaskStatus(droppedId, status, token);
    loadTasks();
  }

  if (!token) return null;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <Link to="/dashboard" className="text-slate-500 hover:text-indigo-600 flex items-center gap-2 mb-4 text-sm font-medium">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        Board: <span className="text-indigo-600 dark:text-indigo-400 font-mono">{projectId}</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map(col => (
          <div key={col.key} onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDrop(e, col.key)} className="bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-4 min-h-[500px] border border-slate-200 dark:border-slate-700 shadow-inner">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold uppercase text-xs tracking-widest text-slate-500 dark:text-slate-200">{col.title}</h2>
              <button onClick={() => { setEditingTask(null); setTitle(""); setTargetStatus(col.key); setShowModal(true); }} className="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 p-1 rounded-lg transition-colors"><Plus size={20} /></button>
            </div>
            <div className="space-y-3">
              {tasks.filter(t => t.status === col.key).map(task => (
                <div key={task.id} draggable onDragStart={(e) => e.dataTransfer.setData("taskId", task.id)} className="bg-white dark:bg-slate-700/60 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 group hover:ring-2 hover:ring-indigo-500/50 transition-all">
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{task.title}</p>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingTask(task); setTitle(task.title); setTargetStatus(task.status); setShowModal(true); }} className="p-1 hover:text-indigo-600"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(task.id)} className="p-1 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {tasks.filter(t => t.status === col.key).length === 0 && (
                <div className="flex items-center justify-center h-24 text-slate-400 dark:text-slate-600 text-xs font-medium border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl mt-2">
                    Empty Column
                </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800">
            <h2 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">{editingTask ? "Edit Task" : "Add Task"}</h2>
            <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title..." className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 mb-6 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-5 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">Cancel</button>
              <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-500 transition-all active:scale-95">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}