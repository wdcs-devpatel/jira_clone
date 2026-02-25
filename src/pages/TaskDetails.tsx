import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { ArrowLeft, MessageSquare, Trash2, X, PlusCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { 
  updateTask, 
  getAllTasks,
  addTask // ✅ Ensure this is imported for creating new tasks
} from "../services/taskService";
import { PRIORITY_LIST, Priority } from "../utils/constants";

export default function TaskDetails() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>();
  
  // ✅ Detect if we are creating a new task or editing an existing one
  const isCreateMode = taskId === "create";
  const numericTaskId = !isCreateMode ? Number(taskId) : null;
  const numericProjectId = Number(projectId);

  // ✅ Get initial status from URL query params (e.g., ?status=todo)
  const queryParams = new URLSearchParams(location.search);
  const initialStatus = queryParams.get("status") || "todo";

  const [loading, setLoading] = useState(!isCreateMode);
  const [activeTab, setActiveTab] = useState<"general" | "comments">("general");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(initialStatus);
  const [priority, setPriority] = useState<Priority>("medium");
  const [subtasks, setSubtasks] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");

  // ✅ Permission-based logic
  const permissions = user?.permissions || [];
  const canManageTasks = permissions.includes("edit_task") || permissions.includes("create_task");

  useEffect(() => {
    if (!isCreateMode && !isNaN(numericTaskId!)) {
      loadTaskData();
    }
  }, [taskId]);

  async function loadTaskData() {
    try {
      setLoading(true);
      const allTasks = await getAllTasks(numericProjectId);
      const foundTask = allTasks.find((t: any) => Number(t.id) === numericTaskId);
      
      if (foundTask) {
        setTitle(foundTask.title || "");
        setDescription(foundTask.description || "");
        setPriority(foundTask.priority || "medium");
        setStatus(foundTask.status || "todo");
        
        setSubtasks(typeof foundTask.subtasks === 'string' ? JSON.parse(foundTask.subtasks) : foundTask.subtasks || []);
        setComments(typeof foundTask.comments === 'string' ? JSON.parse(foundTask.comments) : foundTask.comments || []);
      } else {
        toast.error("Task not found");
        navigate(`/kanban/${projectId}`);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }

  const addComment = () => {
    if (!newComment.trim()) return;
    const commentObj = {
      id: Date.now(),
      text: newComment,
      author: user?.username || "Anonymous",
      createdAt: new Date().toISOString()
    };
    setComments([...comments, commentObj]);
    setNewComment("");
  };

  async function handleSave() {
    // 🛑 Prevent "NaN" request by validating mode
    if (!isCreateMode && isNaN(numericTaskId!)) {
      toast.error("Invalid Task reference.");
      return;
    }

    try {
      const taskPayload = { 
        title, 
        description, 
        priority, 
        status,
        subtasks, 
        comments 
      };

      if (isCreateMode) {
        // ✅ FIX: Use addTask (POST) for new tasks
        await addTask(taskPayload, numericProjectId);
        toast.success("Task created successfully");
      } else {
        // ✅ Use updateTask (PUT) for existing tasks
        await updateTask(numericTaskId!, taskPayload);
        toast.success("Task updated successfully");
      }
      
      navigate(`/kanban/${projectId}`);
    } catch (err: any) { 
      console.error("Save Error:", err);
      toast.error(err.response?.data?.message || "Internal Server Error during save");
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:text-white font-black uppercase text-xs tracking-widest">Syncing Config...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1220] p-6 md:p-12 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-8">
          <Link 
            to={`/kanban/${projectId}`} 
            className="group inline-flex items-center gap-2 text-slate-400 hover:text-indigo-500 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
          >
            <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 group-hover:border-indigo-500/50 shadow-sm">
              <ArrowLeft size={14} />
            </div>
            Back to Kanban Board
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-200 dark:border-slate-800/60 overflow-hidden">
          <div className="p-10 md:p-16">
            
            <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-4 mb-10">
              <span className="w-2.5 h-10 bg-indigo-600 rounded-full"></span>
              {isCreateMode ? "New Task Draft" : "Task Configuration"}
            </h2>

            <div className="flex gap-10 mb-12 border-b border-slate-100 dark:border-slate-800/50">
              <button onClick={() => setActiveTab("general")} className={`text-[11px] font-black uppercase tracking-widest pb-5 relative ${activeTab === "general" ? "text-indigo-600" : "text-slate-400"}`}>
                General Details
                {activeTab === "general" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></span>}
              </button>
              {!isCreateMode && (
                <button onClick={() => setActiveTab("comments")} className={`text-[11px] font-black uppercase tracking-widest pb-5 relative ${activeTab === "comments" ? "text-indigo-600" : "text-slate-400"}`}>
                  Comments ({comments.length})
                  {activeTab === "comments" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></span>}
                </button>
              )}
            </div>

            <div className="min-h-[500px]">
              {activeTab === "general" ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="space-y-10">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 mb-4 block tracking-[0.2em] uppercase">Task Title</label>
                      <input placeholder="What needs to be done?" disabled={!canManageTasks} value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-8 py-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border dark:border-slate-800 dark:text-white focus:border-indigo-500 outline-none disabled:opacity-60" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 mb-4 block tracking-[0.2em] uppercase">Description</label>
                      <textarea placeholder="Describe the requirements..." disabled={!canManageTasks} value={description} onChange={(e) => setDescription(e.target.value)} rows={10} className="w-full px-8 py-6 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border dark:border-slate-800 dark:text-white focus:border-indigo-500 outline-none resize-none disabled:opacity-60" />
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 mb-5 block tracking-[0.2em] uppercase">Priority</label>
                      <div className="grid grid-cols-3 gap-4">
                        {PRIORITY_LIST.map((p) => (
                          <button key={p.value} disabled={!canManageTasks} onClick={() => setPriority(p.value as Priority)} className={`py-4 rounded-2xl border text-[10px] font-black uppercase transition-all ${priority === p.value ? `${p.bg} ${p.color} ring-4 ring-indigo-500/10` : "text-slate-400 border-slate-200 dark:border-slate-800"}`}>
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-950/30 p-10 rounded-[2.5rem] border dark:border-slate-800">
                      <div className="flex justify-between items-center mb-8">
                        <label className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Subtasks</label>
                        {canManageTasks && <button onClick={() => setSubtasks([...subtasks, { id: Date.now(), text: "", completed: false }])} className="text-[10px] font-black text-indigo-600 uppercase">+ Add Step</button>}
                      </div>
                      <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                        {subtasks.map((st, i) => (
                          <div key={st.id || i} className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border dark:border-slate-800">
                            <input disabled={!canManageTasks} type="checkbox" checked={st.completed} onChange={() => {
                              const updated = [...subtasks];
                              updated[i].completed = !updated[i].completed;
                              setSubtasks(updated);
                            }} className="w-5 h-5 rounded-lg text-indigo-600" />
                            <input disabled={!canManageTasks} placeholder="Item description" className="bg-transparent text-sm w-full outline-none dark:text-white" value={st.text} onChange={(e) => {
                              const updated = [...subtasks];
                              updated[i].text = e.target.value;
                              setSubtasks(updated);
                            }} />
                            {canManageTasks && <button onClick={() => setSubtasks(subtasks.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-red-500"><X size={16} /></button>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in h-full flex flex-col max-w-4xl mx-auto">
                   {/* Comments Section (Same as your provided code) */}
                </div>
              )}
            </div>

            <div className="mt-16 pt-10 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-10">
              <button onClick={() => navigate(`/kanban/${projectId}`)} className="text-[11px] font-black uppercase text-slate-400 hover:text-red-500 tracking-[0.2em]">Discard</button>
              {canManageTasks && (
                <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white px-14 py-5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95">
                  {isCreateMode ? "Create Task" : "Update Task"}
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
} 