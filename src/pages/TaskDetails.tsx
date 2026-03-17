import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { 
  ArrowLeft, 
  MessageSquare, 
  Send,
  X,
  Trash2,
  Calendar,
  User as UserIcon,
  Edit2,
  Check,
  Clock 
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { getUsers } from "../services/userService";

// ✅ Modular Components
import TaskAttachments, { Attachment } from "../components/TaskAttachments";
import TaskActivityLog from "../components/TaskActivityLog";

// ✅ POSTGRES SERVICE: Core Task Logic
import { 
  updateTask, 
  getTaskById, 
  addTask,
  deleteTask 
} from "../services/taskService";

// ✅ MONGO SERVICE: Specialized Attachment Logic
import { 
  getAttachments, 
  uploadAttachment, 
  deleteAttachment 
} from "../services/attachmentService";

// ✅ MONGO SERVICE: Backlog Logic
import { createBacklog } from "../services/backlogService"; 

// ✅ ACTIVITY SERVICE: Logging Logic
import { createActivity, getTaskActivity } from "../services/activityService";

// ✅ ACTIVITY SERVICE: Work Tracking Logic
import { createTimeLog, getTimeLogs } from "../services/timeLogService";

import { PRIORITY_LIST, Priority } from "../utils/constants";

export default function TaskDetails() {
  const { user, permissions } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>();
  
  const isCreateMode = taskId === "create";
  const queryParams = new URLSearchParams(location.search);
  const initialStatus = queryParams.get("status") || "To Do";

  const [loading, setLoading] = useState(!isCreateMode);
  const [assigneeId, setAssigneeId] = useState<string | number | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(initialStatus);
  const [priority, setPriority] = useState<Priority>("medium");
  
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentIndex, setEditingCommentIndex] = useState<number | null>(null);
  const [editCommentText, setEditCommentText] = useState("");

  const [subtasks, setSubtasks] = useState<any[]>([]);
  const [newSubtask, setNewSubtask] = useState("");
  
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [activities, setActivities] = useState<any[]>([]);

  const [timeLogs, setTimeLogs] = useState<any[]>([]);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [timeSpentInput, setTimeSpentInput] = useState("");
  const [startDate, setStartDate] = useState("");

  // ✅ Performance Improvement: Memoized calculation of latest log
  const latestLog = timeLogs.length
    ? [...timeLogs].sort(
        (a, b) => new Date(b.dateStarted).getTime() - new Date(a.dateStarted).getTime()
      )[0]
    : null;

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (err) {
      console.error("User fetch error:", err);
    }
  }

  useEffect(() => {
    if (!isCreateMode && taskId) {
      loadTaskData();
    }
  }, [taskId]);

  async function loadTaskData() {
    try {
      if (!taskId) return;
      setLoading(true);

      const task = await getTaskById(taskId);
      setTitle(task.title || "");
      setDescription(task.description || "");
      setPriority(task.priority || "medium");
      setStatus(task.status || "To Do");
      setAssigneeId(task.assigneeId || null);
      
      setComments(
        typeof task.comments === "string"
          ? JSON.parse(task.comments)
          : task.comments || []
      );

      setSubtasks(
        typeof task.subtasks === "string"
          ? JSON.parse(task.subtasks)
          : task.subtasks || []
      );

      const mongoFiles = await getAttachments(taskId);
      setAttachments(mongoFiles || []);

      const logs = await getTaskActivity(taskId);
      setActivities(logs || []);

      const timeData = await getTimeLogs(taskId);
      setTimeLogs(timeData || []);

    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Task synchronization failed");
    } finally {
      setLoading(false);
    }
  }

  async function moveToBacklog() {
    if (!taskId) return;
    try {
      await createBacklog({
        title,
        priority,
        status: "todo",
        projectId: Number(projectId),
        createdBy: 1
      });
      await deleteTask(taskId);
      await createActivity({
        taskId,
        user: user?.username || "User",
        action: "Moved to Backlog",
        details: title
      });
      toast.success("Task moved back to backlog");
      navigate("/tasks");
    } catch (err) {
      toast.error("Failed to move task to backlog");
    }
  }

  async function handleAddTimeLog() {
    if (!taskId) return;
    const regex = /^(\d+h\s\d+m|\d+h|\d+m)$/;
    if (!regex.test(timeSpentInput.trim())) {
      toast.error("Invalid format. Use 2h 30m, 4h, or 45m");
      return;
    }
    if (!startDate) {
      toast.error("Start date is required");
      return;
    }

    try {
      await createTimeLog({
        taskId,
        user: user?.username || "User",
        timeSpent: timeSpentInput,
        dateStarted: new Date(startDate)
      });
      const logs = await getTimeLogs(taskId);
      setTimeLogs(logs);
      await createActivity({
        taskId,
        user: user?.username || "User",
        action: "Time Logged",
        details: timeSpentInput
      });
      refreshActivities();
      setTimeSpentInput("");
      setStartDate("");
      setShowTimeModal(false);
      toast.success("Work time recorded");
    } catch (err) {
      toast.error("Failed to log time");
    }
  }

  function calculateTotalTime() {
    let totalMinutes = 0;
    timeLogs.forEach((log) => {
      const hMatch = log.timeSpent.match(/(\d+)h/);
      const mMatch = log.timeSpent.match(/(\d+)m/);
      totalMinutes += (hMatch ? parseInt(hMatch[1]) * 60 : 0) + (mMatch ? parseInt(mMatch[1]) : 0);
    });
    return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
  }

  async function addSubtask() {
    if (!newSubtask.trim()) return;
    const newTask = { id: Date.now(), title: newSubtask, completed: false };
    const updated = [...subtasks, newTask];
    setSubtasks(updated);
    setNewSubtask("");
    if (!isCreateMode) {
      await createActivity({ taskId: taskId!, user: user?.username || "User", action: "Subtask Added", details: newSubtask });
      refreshActivities();
    }
  }

  async function toggleSubtask(id: number) {
    const subtask = subtasks.find(s => s.id === id);
    const updated = subtasks.map((s) => s.id === id ? { ...s, completed: !s.completed } : s);
    setSubtasks(updated);
    if (!isCreateMode && subtask) {
      await createActivity({ taskId: taskId!, user: user?.username || "User", action: `Subtask ${!subtask.completed ? 'Completed' : 'Reopened'}`, details: subtask.title });
      refreshActivities();
    }
  }

  async function addComment() {
    if (!newComment.trim()) return;
    const updated = [...comments, { author: user?.username || "User", text: newComment, createdAt: new Date() }];
    setComments(updated);
    if (!isCreateMode) {
      await createActivity({ taskId: taskId!, user: user?.username || "User", action: "Comment Added", details: newComment });
      refreshActivities();
    }
    setNewComment("");
  }

  function deleteComment(index: number) {
    const commentToDelete = comments[index];
    setComments(comments.filter((_, i) => i !== index));
    if (!isCreateMode) {
      createActivity({ taskId: taskId!, user: user?.username || "User", action: "Comment Deleted", details: commentToDelete.text.substring(0, 20) + "..." }).then(() => refreshActivities());
    }
  }

  function startEditComment(index: number) {
    setEditingCommentIndex(index);
    setEditCommentText(comments[index].text);
  }

  function saveEditComment(index: number) {
    const updated = [...comments];
    updated[index].text = editCommentText;
    updated[index].edited = true;
    setComments(updated);
    setEditingCommentIndex(null);
    if (!isCreateMode) {
      createActivity({ taskId: taskId!, user: user?.username || "User", action: "Comment Edited", details: editCommentText.substring(0, 20) + "..." }).then(() => refreshActivities());
    }
  }

  async function refreshActivities() {
    if (taskId && !isCreateMode) {
      const logs = await getTaskActivity(taskId);
      setActivities(logs || []);
    }
  }

  async function handleFileUpload() {
    if (!selectedFile || !taskId) return;
    try {
      await uploadAttachment(taskId, selectedFile);
      await createActivity({ taskId, user: user?.username || "User", action: "File Uploaded", details: selectedFile.name });
      setSelectedFile(null);
      const mongoFiles = await getAttachments(taskId);
      setAttachments(mongoFiles || []);
      refreshActivities();
      toast.success("File attached");
    } catch (err) { toast.error("Upload failed"); }
  }

  async function handleDeleteAttachment(fileId: string) {
    const fileToDelete = attachments.find(a => a._id === fileId);
    try {
      await deleteAttachment(fileId);
      setAttachments(attachments.filter(a => a._id !== fileId));
      if (fileToDelete) {
        await createActivity({ taskId: taskId!, user: user?.username || "User", action: "Attachment Removed", details: fileToDelete.filename });
      }
      refreshActivities();
      toast.success("Attachment removed");
    } catch (err) { toast.error("Delete failed"); }
  }

  async function handleSave() {
    try {
      const taskPayload = { title, description, priority, status, assigneeId, comments: JSON.stringify(comments), subtasks: JSON.stringify(subtasks) };
      if (isCreateMode) {
        const task = await addTask(taskPayload, Number(projectId));
        await createActivity({ taskId: task.id, user: user?.username || "User", action: "Task Created" });
      } else {
        await updateTask(taskId!, taskPayload);
        await createActivity({ taskId: taskId!, user: user?.username || "User", action: "Task Updated", details: `Priority: ${priority}` });
      }
      navigate(`/kanban/${projectId}`);
      toast.success("Task saved successfully");
    } catch (err) { toast.error("Save failed"); }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center dark:bg-[#0b1220] dark:text-white font-black uppercase text-xs animate-pulse">Syncing Intelligence...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1220] p-4 md:p-8 transition-colors duration-300 text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link to={`/kanban/${projectId}`} className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-500 text-[11px] font-bold uppercase tracking-[0.2em]">
            <ArrowLeft size={14} /> Back to Board
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-white dark:bg-slate-900/50 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 backdrop-blur-xl">
              <div className="flex justify-between items-start mb-8">
                <h2 className="text-3xl font-black tracking-tight">{isCreateMode ? "New Task" : "Task Configuration"}</h2>
                <div className="px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800">{status}</div>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1">Title</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter task name..." className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 mt-2 dark:bg-slate-900/50 outline-none focus:border-indigo-500/50 transition-all text-lg font-bold" />
                </div>
                
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Add details..." className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 mt-2 dark:bg-slate-900/50 outline-none focus:border-indigo-500/50 transition-all text-base resize-none" />
                </div>

                {/* Subtasks Section */}
                <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-6 text-slate-500">Subtasks Checklist</h3>
                  <div className="space-y-3 mb-6">
                    {subtasks.map((s: any) => (
                      <div key={s.id} className="flex items-center gap-4 group p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                        <input type="checkbox" checked={s.completed} onChange={() => toggleSubtask(s.id)} className="w-5 h-5 rounded-lg border-2 border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer" />
                        <span className={`text-sm font-semibold transition-all ${s.completed ? "line-through opacity-40 italic text-slate-500" : "text-slate-700 dark:text-slate-300"}`}>{s.title}</span>
                        <button onClick={() => setSubtasks(subtasks.filter(st => st.id !== s.id))} className="ml-auto opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 bg-slate-50 dark:bg-slate-800/30 p-2 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <input value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)} placeholder="Add a new requirement..." className="flex-1 px-4 py-3 bg-transparent outline-none text-sm font-medium" />
                    <button onClick={addSubtask} className="bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest hover:shadow-sm transition-all border border-slate-200 dark:border-slate-700">Add</button>
                  </div>
                </div>

                {/* ✅ Modular Attachments Component */}
                <TaskAttachments
                  attachments={attachments}
                  selectedFile={selectedFile}
                  setSelectedFile={setSelectedFile}
                  handleFileUpload={handleFileUpload}
                  handleDeleteAttachment={handleDeleteAttachment}
                  setPreviewImage={setPreviewImage}
                  isCreateMode={isCreateMode}
                />
              </div>
            </div>
            
            {/* Discussion (Comments) Section */}
            <div className="bg-white dark:bg-slate-900/50 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-8"><MessageSquare size={18} className="text-indigo-500" /><h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Discussion</h3></div>
              <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                {comments.map((c: any, idx: number) => (
                  <div key={idx} className="flex gap-4 p-5 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-slate-100 dark:border-slate-800 relative group">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xs font-black shrink-0">{(c.author || "U").charAt(0).toUpperCase()}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{c.author || "Member"}</p>
                        <div className="flex items-center gap-3">
                           <p className="text-[8px] font-bold text-slate-400 uppercase">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'Recent'}</p>
                           <div className="opacity-0 group-hover:opacity-100 flex gap-2 transition-all">
                              <button onClick={() => startEditComment(idx)} className="text-slate-400 hover:text-indigo-500"><Edit2 size={12}/></button>
                              <button onClick={() => deleteComment(idx)} className="text-slate-400 hover:text-red-500"><Trash2 size={12}/></button>
                           </div>
                        </div>
                      </div>
                      {editingCommentIndex === idx ? (
                        <div className="mt-2 flex gap-2">
                          <input value={editCommentText} onChange={(e) => setEditCommentText(e.target.value)} className="flex-1 bg-white dark:bg-slate-900 border border-indigo-500/30 rounded-lg px-3 py-1 text-sm outline-none" />
                          <button onClick={() => saveEditComment(idx)} className="text-green-500"><Check size={16}/></button>
                          <button onClick={() => setEditingCommentIndex(null)} className="text-slate-400"><X size={16}/></button>
                        </div>
                      ) : (
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{c.text}{c.edited && <span className="text-[9px] ml-2 opacity-40 italic">(edited)</span>}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="relative">
                <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Type a message..." className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 outline-none text-sm font-medium dark:bg-slate-900 focus:border-indigo-500/50 transition-all pr-16" />
                <button onClick={addComment} className="absolute right-3 top-2.5 bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl transition-all shadow-lg"><Send size={18} /></button>
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900/50 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 backdrop-blur-xl">
              <div className="space-y-8">
                {/* Priority Selection */}
                <div>
                  <div className="flex items-center gap-2 mb-4"><Calendar size={14} className="text-slate-400" /><label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Priority</label></div>
                  <div className="grid grid-cols-1 gap-2">
                    {PRIORITY_LIST.map((p) => (
                      <button key={p.value} onClick={() => setPriority(p.value as Priority)} className={`py-3 rounded-2xl border-2 text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 ${priority === p.value ? "bg-indigo-600 text-white border-indigo-600 shadow-xl" : "dark:border-slate-800 dark:text-slate-400 hover:border-slate-600"}`}>{p.label}</button>
                    ))}
                  </div>
                </div>

                {/* Assignee Selection */}
                <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-4"><UserIcon size={14} className="text-slate-400" /><label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Assignee</label></div>
                  <select 
                    value={assigneeId || ""} 
                    onChange={(e) => setAssigneeId(e.target.value)} 
                    disabled={!permissions.includes("assign_permissions")}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 dark:bg-slate-900 text-xs font-black uppercase tracking-widest outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {users
                      .filter((u) => {
                        const userPerms = u.Role?.Permissions?.map((p: any) => p.name) || [];
                        return userPerms.includes("assign_permissions");
                      })
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.username}
                        </option>
                      ))}
                  </select>
                </div>

                {/* ✅ Modular Activity Log & Time Tracking Component */}
                <TaskActivityLog 
                  activities={activities}
                  totalTime={calculateTotalTime()}
                  latestLog={latestLog}
                  onLogTimeClick={() => setShowTimeModal(true)}
                />

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={handleSave} className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white py-5 rounded-3xl text-xs font-black uppercase tracking-[0.3em] shadow-2xl transition-all active:scale-95">Save Configuration</button>
                  {!isCreateMode && status === "To Do" && (
                    <button onClick={moveToBacklog} className="w-full bg-amber-500 hover:bg-amber-400 text-white py-4 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg transition-all">Move To Backlog</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Time Tracking Modal */}
      {showTimeModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] w-full max-w-[420px] shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-black mb-6 tracking-tight">Log Work Time</h2>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1">Time Spent</label>
                <input type="text" placeholder="e.g. 2h 30m" value={timeSpentInput} onChange={(e) => setTimeSpentInput(e.target.value)} className="w-full px-5 py-3 border-2 border-slate-100 dark:border-slate-800 rounded-2xl mt-1 dark:bg-slate-800 outline-none focus:border-indigo-500/50 transition-all font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] ml-1">Work Date</label>
                <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-5 py-3 border-2 border-slate-100 dark:border-slate-800 rounded-2xl mt-1 dark:bg-slate-800 outline-none focus:border-indigo-500/50 transition-all font-bold" />
              </div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center italic">Formats: 2h, 45m, 1h 20m</p>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setShowTimeModal(false)} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all">Cancel</button>
              <button onClick={handleAddTimeLog} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all">Log Entry</button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Overlay */}
      {previewImage && (
        <div className="fixed inset-0 bg-slate-900/95 flex items-center justify-center z-[200] backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setPreviewImage(null)}>
          <button className="absolute top-8 right-8 text-white/50 bg-white/10 p-3 rounded-2xl"><X size={32} /></button>
          <img src={previewImage} className="max-h-[80vh] max-w-[90vw] rounded-3xl shadow-2xl border-4 border-white/10 object-contain" alt="preview" />
        </div>
      )}
    </div>
  );
}