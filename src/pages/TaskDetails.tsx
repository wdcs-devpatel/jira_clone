import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, MessageSquare, Pencil, Trash2, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { 
  updateTask, 
  getAllTasks 
} from "../services/taskService";
import { PRIORITY_LIST, Priority } from "../utils/constants";

export default function TaskDetails() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"general" | "comments">("general");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [subtasks, setSubtasks] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");

  const userPosition = user?.position?.toLowerCase().trim() || "";
  const canManageTasks = ["project manager", "team leader", "qa", "qa tester"].includes(userPosition);

  useEffect(() => {
    loadTaskData();
  }, [taskId]);

  async function loadTaskData() {
    try {
      setLoading(true);
      const allTasks = await getAllTasks(Number(projectId));
      const foundTask = allTasks.find((t: any) => String(t.id) === taskId);
      
      if (foundTask) {
        setTitle(foundTask.title || "");
        setDescription(foundTask.description || "");
        setPriority(foundTask.priority || "medium");
        
        // Handle cases where SQL might return strings for JSON columns
        setSubtasks(typeof foundTask.subtasks === 'string' ? JSON.parse(foundTask.subtasks) : foundTask.subtasks || []);
        setComments(typeof foundTask.comments === 'string' ? JSON.parse(foundTask.comments) : foundTask.comments || []);
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
    try {
      const updatedData = { title, description, priority, subtasks, comments };
      await updateTask(Number(taskId), updatedData);
      navigate(`/kanban/${projectId}`);
    } catch (err) { console.error(err); }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:text-white font-black uppercase text-xs tracking-widest">Loading Configuration...</div>;

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
              Task Configuration
            </h2>

            <div className="flex gap-10 mb-12 border-b border-slate-100 dark:border-slate-800/50">
              <button onClick={() => setActiveTab("general")} className={`text-[11px] font-black uppercase tracking-widest pb-5 relative ${activeTab === "general" ? "text-indigo-600" : "text-slate-400"}`}>
                General Details
                {activeTab === "general" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></span>}
              </button>
              <button onClick={() => setActiveTab("comments")} className={`text-[11px] font-black uppercase tracking-widest pb-5 relative ${activeTab === "comments" ? "text-indigo-600" : "text-slate-400"}`}>
                Comments ({comments.length})
                {activeTab === "comments" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600"></span>}
              </button>
            </div>

            <div className="min-h-[500px]">
              {activeTab === "general" ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="space-y-10">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 mb-4 block tracking-[0.2em] uppercase">Task Title</label>
                      <input disabled={!canManageTasks} value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-8 py-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border dark:border-slate-800 dark:text-white focus:border-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 mb-4 block tracking-[0.2em] uppercase">Description</label>
                      <textarea disabled={!canManageTasks} value={description} onChange={(e) => setDescription(e.target.value)} rows={10} className="w-full px-8 py-6 rounded-[1.5rem] bg-slate-50 dark:bg-slate-950/50 border dark:border-slate-800 dark:text-white focus:border-indigo-500 outline-none resize-none" />
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 mb-5 block tracking-[0.2em] uppercase">Priority</label>
                      <div className="grid grid-cols-3 gap-4">
                        {PRIORITY_LIST.map((p) => (
                          <button key={p.value} onClick={() => setPriority(p.value as Priority)} className={`py-4 rounded-2xl border text-[10px] font-black uppercase transition-all ${priority === p.value ? `${p.bg} ${p.color} ring-4 ring-indigo-500/10` : "text-slate-400 border-slate-200 dark:border-slate-800"}`}>
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 dark:bg-slate-950/30 p-10 rounded-[2.5rem] border dark:border-slate-800">
                      <div className="flex justify-between items-center mb-8">
                        <label className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase">Subtasks</label>
                        <button onClick={() => setSubtasks([...subtasks, { id: Date.now(), text: "", completed: false }])} className="text-[10px] font-black text-indigo-600 uppercase">+ Add Step</button>
                      </div>
                      <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                        {subtasks.map((st, i) => (
                          <div key={st.id || i} className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border dark:border-slate-800">
                            <input type="checkbox" checked={st.completed} onChange={() => {
                              const updated = [...subtasks];
                              updated[i].completed = !updated[i].completed;
                              setSubtasks(updated);
                            }} className="w-5 h-5 rounded-lg text-indigo-600" />
                            <input className="bg-transparent text-sm w-full outline-none dark:text-white" value={st.text} onChange={(e) => {
                              const updated = [...subtasks];
                              updated[i].text = e.target.value;
                              setSubtasks(updated);
                            }} />
                            <button onClick={() => setSubtasks(subtasks.filter((_, idx) => idx !== i))} className="text-slate-300 hover:text-red-500"><X size={16} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* --- UPDATED COMMENTS VIEW --- */
                <div className="animate-in fade-in slide-in-from-right-4 duration-700 h-full flex flex-col max-w-4xl mx-auto">
                  <div className="flex-1 space-y-6 overflow-y-auto mb-10 pr-4 custom-scrollbar max-h-[500px]">
                    {comments.length > 0 ? (
                      comments.map((c) => (
                        <div key={c.id} className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 relative group">
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 font-black text-xs">
                                {c.author?.[0] || "A"}
                              </div>
                              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{c.author}</span>
                            </div>
                            <button 
                              onClick={() => setComments(comments.filter(com => com.id !== c.id))}
                              className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-lg text-red-400 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-11">{c.text}</p>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <MessageSquare size={48} className="mb-4 opacity-20" />
                        <p className="text-xs font-black uppercase tracking-widest">No comments found</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 p-3 bg-slate-50 dark:bg-slate-950/50 border dark:border-slate-800 rounded-[2rem] focus-within:border-indigo-500 transition-all">
                    <input 
                      value={newComment} 
                      onChange={(e) => setNewComment(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && addComment()}
                      placeholder="Type your message..." 
                      className="flex-1 bg-transparent px-6 py-2 text-sm dark:text-white outline-none" 
                    />
                    <button 
                      onClick={addComment}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-16 pt-10 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-10">
              <button onClick={() => navigate(`/kanban/${projectId}`)} className="text-[11px] font-black uppercase text-slate-400 hover:text-red-500 tracking-[0.2em]">Discard</button>
              <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white px-14 py-5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest shadow-xl">
                Save Changes
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}