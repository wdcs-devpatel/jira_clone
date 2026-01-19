import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Plus, ArrowLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { 
  getAllTasks, 
  addTask, 
  updateTask, 
  deleteTask, 
  updateTaskStatus 
} from "../services/taskService";
import { getUsers } from "../services/userService";
import { enrichTasksWithProject } from "../utils/projectHelper";
import { PRIORITIES, PRIORITY_LIST, Priority } from "../utils/constants";
import KanbanCard from "../components/KanbanCard";

type Status = "todo" | "in-progress" | "done";

const COLUMNS: { key: Status; title: string }[] = [
  { key: "todo", title: "To Do" },
  { key: "in-progress", title: "In Progress" },
  { key: "done", title: "Done" },
];

export default function KanbanBoard() {
  const { projectId } = useParams<{ projectId: string }>();
  const { token } = useAuth();
  
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [targetStatus, setTargetStatus] = useState<Status>("todo");

  useEffect(() => { 
    if (token && projectId) loadInitialData(); 
  }, [projectId, token]);

  async function loadInitialData() {
    const fetchedUsers = await getUsers();
    setUsers(fetchedUsers);
    await loadTasks();
  }

  async function loadTasks() {
    if (!token) return;
    const all = await getAllTasks(token);
    const enriched = await enrichTasksWithProject(all, token);
    setTasks(enriched.filter((t: any) => String(t.projectId) === String(projectId)));
  }

  const handleDragStart = (e: React.DragEvent, taskId: any) => {
    e.dataTransfer.setData("taskId", String(taskId));
  };

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const onDrop = async (e: React.DragEvent, newStatus: Status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId && token) {
      await updateTaskStatus(taskId, newStatus, token);
      await loadTasks();
    }
  };

  async function handleSave() {
    if (!title.trim() || !token) return;
    const taskData = { title, status: targetStatus, priority, projectId };
    
    if (editingTask) {
      await updateTask(editingTask.id, taskData, token);
    } else {
      await addTask(taskData as any, token);
    }
    
    closeModal();
    await loadTasks();
  }

  async function handleDelete(taskId: string | number) {
    if (!token) return;
    if (window.confirm("Are you sure you want to delete this task?")) {
      await deleteTask(String(taskId), token);
      await loadTasks();
    }
  }

  const openModal = (task: any = null, defaultStatus: Status = "todo") => {
    if (task) {
      setEditingTask(task);
      setTitle(task.title);
      setPriority(task.priority);
      setTargetStatus(task.status);
    } else {
      setEditingTask(null);
      setTitle("");
      setPriority("medium");
      setTargetStatus(defaultStatus);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setTitle("");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1220] p-6 md:p-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <Link 
          to="/dashboard" 
          className="text-slate-500 dark:text-slate-400 hover:text-indigo-500 flex items-center gap-2 mb-8 text-xs font-bold uppercase tracking-widest transition-colors"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {COLUMNS.map((col) => (
            <div 
              key={col.key} 
              onDragOver={onDragOver} 
              onDrop={(e) => onDrop(e, col.key)}
              className="bg-slate-100/50 dark:bg-slate-900/40 rounded-[2.5rem] p-6 min-h-[650px] border border-slate-200 dark:border-slate-800/60 transition-all shadow-sm"
            >
              <div className="flex justify-between items-center mb-8 px-2">
                <h2 className="font-black uppercase text-[10px] tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  {col.title} <span className="ml-2 opacity-50">({tasks.filter(t => t.status === col.key).length})</span>
                </h2>
                <button 
                  onClick={() => openModal(null, col.key)} 
                  className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-500 transition-all"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {tasks.filter(t => t.status === col.key).map(task => (
                  <div 
                    key={task.id} 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <KanbanCard 
                      task={task} 
                      onEdit={openModal}
                      onDelete={handleDelete}
                      assignee={users.find(u => u.id === task.assigneeId)} 
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Persistent Dark Mode Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in duration-200">
            <h2 className="text-2xl font-black mb-6 text-slate-900 dark:text-white">
              {editingTask ? "Edit Task" : "New Task"}
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">
                  Task Title
                </label>
                <input 
                  autoFocus
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all" 
                  placeholder="Task title..." 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-widest">
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {PRIORITY_LIST.map((p) => (
                    <button 
                      key={p.value} 
                      type="button"
                      onClick={() => setPriority(p.value as Priority)} 
                      className={`py-3 rounded-xl border-2 text-[10px] font-bold uppercase transition-all ${
                        priority === p.value 
                          ? `${p.bg} ${p.color} border-current ${p.darkBg} ${p.darkText}` 
                          : "border-slate-100 dark:border-slate-800 text-slate-400 bg-transparent"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-10">
              <button 
                onClick={closeModal} 
                className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
              >
                {editingTask ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}