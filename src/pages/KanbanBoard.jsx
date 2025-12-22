import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Plus, Pencil, Trash2, ArrowLeft, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getAllTasks, addTask, updateTask, deleteTask, updateTaskStatus } from "../services/taskService";
import { getUsers } from "../services/userService";
import { enrichTasksWithProject } from "../utils/projectHelper";
import { PRIORITIES, PRIORITY_LIST } from "../utils/constants";

const COLUMNS = [
  { key: "todo", title: "To Do" },
  { key: "in-progress", title: "In Progress" },
  { key: "done", title: "Done" },
];

export default function KanbanBoard() {
  const { projectId } = useParams();
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [assigneeId, setAssigneeId] = useState(null);
  const [targetStatus, setTargetStatus] = useState("todo");

  useEffect(() => {
    if (token) loadInitialData();
  }, [projectId, token]);

  async function loadInitialData() {
    const fetchedUsers = await getUsers();
    setUsers(fetchedUsers);
    await loadTasks();
  }

  async function loadTasks() {
    const all = await getAllTasks(token);
    const enriched = enrichTasksWithProject(all, token);
    setTasks(enriched.filter(t => String(t.projectId) === String(projectId)));
  }

  const handleDragStart = (e, taskId) => { e.dataTransfer.setData("taskId", taskId); };
  const onDragOver = (e) => { e.preventDefault(); };

  const onDrop = async (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId && token) {
      await updateTaskStatus(taskId, newStatus, token);
      loadTasks(); 
    }
  };

  async function handleSave() {
    if (!title.trim()) return;
    const taskData = { title, status: targetStatus, priority, projectId, assigneeId };
    
    if (editingTask) {
      await updateTask(editingTask.id, taskData, token);
    } else {
      await addTask(taskData, token);
    }
    setShowModal(false);
    loadTasks();
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 tracking-tight">
      <Link to="/dashboard" className="text-slate-500 hover:text-indigo-600 flex items-center gap-2 mb-4 text-sm font-medium transition-colors">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map(col => (
          <div key={col.key} onDragOver={onDragOver} onDrop={(e) => onDrop(e, col.key)} className="bg-slate-50 dark:bg-slate-800/40 rounded-3xl p-5 min-h-[500px] border border-slate-200 dark:border-slate-700/50">
            <div className="flex justify-between items-center mb-8 px-2">
              <h2 className="font-black uppercase text-[10px] tracking-[0.2em] text-slate-400 dark:text-slate-500">{col.title}</h2>
              <button onClick={() => { setEditingTask(null); setTitle(""); setPriority("medium"); setAssigneeId(users[0]?.id); setTargetStatus(col.key); setShowModal(true); }} className="bg-white dark:bg-slate-700 text-indigo-600 p-1.5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-600"><Plus size={18} /></button>
            </div>

            <div className="space-y-4">
              {tasks.filter(t => t.status === col.key).map(task => {
                const p = PRIORITIES[task.priority] || PRIORITIES.medium;
                const assignee = users.find(u => u.id === Number(task.assigneeId)) || users[0];
                return (
                  <div key={task.id} draggable onDragStart={(e) => handleDragStart(e, task.id)} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 group hover:border-indigo-400 transition-all cursor-grab active:cursor-grabbing">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${p.bg} ${p.color}`}>
                        {p.label}
                      </span>
                      <button onClick={() => { setEditingTask(task); setTitle(task.title); setPriority(task.priority || "medium"); setAssigneeId(task.assigneeId); setTargetStatus(task.status); setShowModal(true); }} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 transition-all"><Pencil size={14} /></button>
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-6">{task.title}</p>
                    <div className="flex justify-between items-center border-t border-slate-50 dark:border-slate-700 pt-4">
                      <span className="text-[9px] font-mono text-slate-300 font-bold">ID: {String(task.id).slice(0, 8)}</span>
                      <img src={assignee?.avatar} alt={assignee?.name} className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-600 shadow-sm" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in-95">
            <h2 className="text-2xl font-black mb-8 text-slate-900 dark:text-white">{editingTask ? "Edit Task" : "New Task"}</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-[0.2em]">Task Title</label>
                <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-300" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-[0.2em]">Assignee Name</label>
                <div className="max-h-[160px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {users.map((u) => (
                    <button key={u.id} onClick={() => setAssigneeId(u.id)} className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${assigneeId === u.id ? "border-indigo-600 bg-indigo-50/50 text-indigo-600" : "border-slate-100 dark:border-slate-800 text-slate-500 hover:bg-slate-50"}`}>
                      <div className="flex items-center gap-3">
                        <img src={u.avatar} className="w-6 h-6 rounded-full" />
                        <span className="text-xs font-bold">{u.name}</span>
                      </div>
                      {assigneeId === u.id && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-[0.2em]">Priority</label>
                <div className="grid grid-cols-3 gap-3">
                  {PRIORITY_LIST.map((p) => (
                    <button key={p.value} onClick={() => setPriority(p.value)} className={`py-3 rounded-2xl border text-[11px] font-black tracking-widest uppercase transition-all ${priority === p.value ? "border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20" : "border-slate-100 dark:border-slate-800 text-slate-400"}`}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end items-center gap-4 mt-10">
              <button onClick={() => setShowModal(false)} className="px-6 py-2 text-sm font-bold text-slate-400">Cancel</button>
              <button onClick={handleSave} className="px-10 py-3 bg-indigo-600 text-white rounded-2xl shadow-xl hover:bg-indigo-500 transition-all font-black text-xs uppercase tracking-widest">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}