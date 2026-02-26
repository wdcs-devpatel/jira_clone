import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { ArrowLeft, MessageSquare, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { 
  updateTask, 
  getAllTasks,
  addTask 
} from "../services/taskService";
import { PRIORITY_LIST, Priority } from "../utils/constants";

export default function TaskDetails() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>();
  
  const isCreateMode = taskId === "create";
  const numericTaskId = !isCreateMode ? Number(taskId) : null;
  const numericProjectId = Number(projectId);

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
        
        // ✅ Proper JSON parsing for PostgreSQL JSON columns
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
    // ✅ Updates local state; saved to DB when handleSave is called
    setComments([...comments, commentObj]);
    setNewComment("");
  };

  async function handleSave() {
    if (!isCreateMode && isNaN(numericTaskId!)) {
      toast.error("Invalid Task ID reference.");
      return;
    }

    try {
      const taskPayload = { title, description, priority, status, subtasks, comments };

      if (isCreateMode) {
        await addTask(taskPayload, numericProjectId);
        toast.success("Task created successfully");
      } else {
        // ✅ Sends numericTaskId to avoid the /api/tasks/NaN error
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1220] p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <div className="mb-4">
          <Link to={`/kanban/${projectId}`} className="group inline-flex items-center gap-2 text-slate-400 hover:text-indigo-500 text-[9px] font-black uppercase tracking-widest">
            <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"><ArrowLeft size={12} /></div>
            Back to Board
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-200 dark:border-slate-800/60 overflow-hidden">
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 mb-6">
              <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
              {isCreateMode ? "New Task Draft" : "Task Configuration"}
            </h2>

            <div className="flex gap-8 mb-6 border-b border-slate-100 dark:border-slate-800/50">
              <button onClick={() => setActiveTab("general")} className={`text-[10px] font-black uppercase tracking-widest pb-3 relative ${activeTab === "general" ? "text-indigo-600" : "text-slate-400"}`}>
                General Details
                {activeTab === "general" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></span>}
              </button>
              {!isCreateMode && (
                <button onClick={() => setActiveTab("comments")} className={`text-[10px] font-black uppercase tracking-widest pb-3 relative ${activeTab === "comments" ? "text-indigo-600" : "text-slate-400"}`}>
                  Comments ({comments.length})
                  {activeTab === "comments" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></span>}
                </button>
              )}
            </div>

            <div className="min-h-[400px]">
              {activeTab === "general" ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 mb-2 block tracking-widest uppercase">Title</label>
                      <input disabled={!canManageTasks} value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border dark:border-slate-800 dark:text-white outline-none text-sm" />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-400 mb-2 block tracking-widest uppercase">Description</label>
                      <textarea disabled={!canManageTasks} value={description} onChange={(e) => setDescription(e.target.value)} rows={6} className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-950/50 border dark:border-slate-800 dark:text-white outline-none resize-none text-sm" />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-[9px] font-black text-slate-400 mb-3 block tracking-widest uppercase">Priority</label>
                      <div className="grid grid-cols-3 gap-2">
                        {PRIORITY_LIST.map((p) => (
                          <button key={p.value} disabled={!canManageTasks} onClick={() => setPriority(p.value as Priority)} className={`py-2 rounded-xl border text-[9px] font-black uppercase transition-all ${priority === p.value ? `${p.bg} ${p.color}` : "text-slate-400 border-slate-100 dark:border-slate-800"}`}>
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-950/30 p-5 rounded-2xl border dark:border-slate-800">
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Subtasks</label>
                        {canManageTasks && <button onClick={() => setSubtasks([...subtasks, { id: Date.now(), text: "", completed: false }])} className="text-[9px] font-black text-indigo-600 uppercase">+ Add</button>}
                      </div>
                      <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                        {subtasks.map((st, i) => (
                          <div key={st.id || i} className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2.5 rounded-xl border dark:border-slate-800">
                            <input disabled={!canManageTasks} type="checkbox" checked={st.completed} onChange={() => {
                              const updated = [...subtasks];
                              updated[i].completed = !updated[i].completed;
                              setSubtasks(updated);
                            }} className="w-4 h-4 rounded text-indigo-600" />
                            <input disabled={!canManageTasks} className="bg-transparent text-xs w-full outline-none dark:text-white" value={st.text} onChange={(e) => {
                              const updated = [...subtasks];
                              updated[i].text = e.target.value;
                              setSubtasks(updated);
                            }} />
                            {canManageTasks && <button onClick={() => setSubtasks(subtasks.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-red-500"><X size={14} /></button>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in max-w-2xl mx-auto flex flex-col h-full">
                  <div className="flex-1 space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                    {comments.map((c) => (
                      <div key={c.id} className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl border dark:border-slate-800">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{c.author}</span>
                          <span className="text-[8px] text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">{c.text}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." className="flex-1 bg-slate-50 dark:bg-slate-950/50 border dark:border-slate-800 rounded-xl px-4 py-2 text-xs outline-none" />
                    <button onClick={addComment} className="bg-indigo-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase">Post</button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-6">
              <button onClick={() => navigate(`/kanban/${projectId}`)} className="text-[10px] font-black uppercase text-slate-400 hover:text-red-500 tracking-widest">Discard</button>
              {canManageTasks && (
                <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                  {isCreateMode ? "Create" : "Save"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}