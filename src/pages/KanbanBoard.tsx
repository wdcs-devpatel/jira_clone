import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios"; // Ensure axios is imported
import { ArrowLeft, MessageSquare, Pencil, Trash2, X, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

import {
  getAllTasks,
  addTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
} from "../services/taskService";

import { getUsers } from "../services/userService";
import { PRIORITY_LIST, Priority } from "../utils/constants";

import KanbanColumn from "../components/KanbanColumn";
import { TaskId } from "../interfaces/task/task.interface";

type Status = "todo" | "in-progress" | "done";

const COLUMNS: { key: Status; title: string }[] = [
  { key: "todo", title: "To Do" },
  { key: "in-progress", title: "In Progress" },
  { key: "done", title: "Done" },
];

export default function KanbanBoard() {
  const { user } = useAuth();
  const { projectId } = useParams<{ projectId: string }>();
  const numericProjectId = projectId ? Number(projectId) : null;
  
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]); 
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);

  const [doneNotification, setDoneNotification] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "comments">("general");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [targetStatus, setTargetStatus] = useState<Status>("todo");
  const [assigneeId, setAssigneeId] = useState<string>("");
  
  const [subtasks, setSubtasks] = useState<{ id: number; text: string; completed: boolean }[]>([]);
  const [comments, setComments] = useState<{ id: number; text: string; author: string }[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);

  useEffect(() => {
    if (numericProjectId !== null && !isNaN(numericProjectId)) {
      localStorage.setItem("currentProjectId", String(numericProjectId));
      loadInitialData();
    }
  }, [numericProjectId]);

  async function loadInitialData() {
    if (numericProjectId === null || isNaN(numericProjectId)) return;
    const token = localStorage.getItem("token");

    try {
      // 1. Fetch all users and project member IDs simultaneously
      const [allUsersRes, memberIdsRes] = await Promise.all([
        getUsers(), // Fetches all users from userService
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/projects/${numericProjectId}/members`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const allUsers = allUsersRes;
      const memberIds: number[] = memberIdsRes.data;

      // 2. Filter users to only include those whose IDs are in the members list
      // Note: We include the logged-in user as well just in case they aren't in the explicit member list
      const projectMembers = allUsers.filter((u: any) => 
        memberIds.includes(u.id) || u.id === user?.id
      );

      // 3. Sort so current user is first in dropdown
      const sorted = projectMembers.sort((a: any) => a.id === user?.id ? -1 : 1);
      
      setUsers(sorted);
      await loadTasks();
    } catch (err) {
      console.error("Initial Load Error:", err);
    }
  }

  async function loadTasks() {
    if (numericProjectId === null || isNaN(numericProjectId)) return;
    try {
      const fetchedTasks = await getAllTasks(numericProjectId);
      setTasks(fetchedTasks);
    } catch (err) {
      console.error("Load Tasks Error:", err);
    }
  }

  const handleDragStart = (e: React.DragEvent, taskId: TaskId) => {
    e.dataTransfer.setData("taskId", String(taskId));
  };

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const onDrop = async (e: React.DragEvent, newStatus: Status) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      if (newStatus === "done") {
        const droppedTask = tasks.find(t => String(t.id) === taskId);
        setDoneNotification(`Nice work! "${droppedTask?.title || 'Task'}" is completed.`);
        setTimeout(() => setDoneNotification(null), 3000);
      }

      setTasks(prev => prev.map(t => String(t.id) === taskId ? { ...t, status: newStatus } : t));
      try {
        await updateTaskStatus(taskId, newStatus);
        await loadTasks();
      } catch (error) {
        console.error("Drop Error:", error);
        await loadTasks();
      }
    }
  };

  const openModal = (task: any = null, defaultStatus: Status = "todo") => {
    setActiveTab("general"); 
    if (task) {
      setEditingTask(task);
      setTitle(task.title || "");
      setDescription(task.description || "");
      setPriority(task.priority || "medium");
      setTargetStatus(task.status || defaultStatus);
      setAssigneeId(String(task.assigneeId) || "");
      setSubtasks(task.subtasks || []);
      setComments(task.comments || []);
    } else {
      setEditingTask(null);
      setTitle("");
      setDescription("");
      setPriority("medium");
      setTargetStatus(defaultStatus);
      setAssigneeId(String(user?.id || ""));
      setSubtasks([]);
      setComments([]);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setEditingCommentId(null);
    setTitle("");
    setNewComment("");
  };

  async function handleSave() {
    if (!title.trim() || numericProjectId === null || isNaN(numericProjectId)) return;

    const taskData = {
      title,
      description,
      priority,
      status: targetStatus,
      projectId: numericProjectId, 
      assigneeId: assigneeId ? Number(assigneeId) : null,
      subtasks,
      comments,
    };

    try {
      if (editingTask) {
        await updateTask(editingTask.id, taskData);
      } else {
        await addTask(taskData as any, numericProjectId); 
      }
      closeModal();
      await loadTasks();
    } catch (error) {
      console.error("Save Task Error:", error);
    }
  }

  async function handleDelete(taskId: TaskId) {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteTask(taskId);
      await loadTasks();
    } catch (error) {
      console.error("Delete Task Error:", error);
    }
  }

  const addSubtask = () => {
    setSubtasks([...subtasks, { id: Date.now(), text: "", completed: false }]);
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    if (editingCommentId) {
      setComments(comments.map(c => c.id === editingCommentId ? { ...c, text: newComment } : c));
      setEditingCommentId(null);
    } else {
      setComments([...comments, { id: Date.now(), text: newComment, author: user?.username || "Me" }]);
    }
    setNewComment("");
  };

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#0b1220] p-6 md:p-10 transition-colors duration-300">
      
      {doneNotification && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[110] animate-in slide-in-from-top-10 fade-in duration-500 ease-out">
          <div className="bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-emerald-400">
            <div className="bg-white/20 p-1 rounded-full">
              <CheckCircle2 size={18} />
            </div>
            <span className="font-bold text-sm tracking-wide">{doneNotification}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <Link to="/dashboard" className="text-slate-500 hover:text-indigo-500 flex items-center gap-2 mb-8 text-xs font-bold uppercase tracking-widest transition-colors">
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {COLUMNS.map((col) => (
            <div key={col.key} onDragOver={onDragOver} onDrop={(e) => onDrop(e, col.key)} className="h-full">
              <KanbanColumn
                title={col.title}
                status={col.key}
                tasks={tasks.filter((t) => t.status === col.key)}
                users={users} // Users list is now filtered to members only
                onEdit={openModal}
                onDelete={handleDelete}
                onAddClick={() => openModal(null, col.key)}
                onDragStart={handleDragStart}
              />
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-800/60 my-auto transition-all duration-300">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
                {editingTask ? "Edit Task" : "New Task"}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex gap-4 mb-8 border-b border-slate-100 dark:border-slate-800/50 pb-2">
              <button 
                onClick={() => setActiveTab("general")}
                className={`text-[11px] font-black uppercase tracking-widest pb-2 transition-all ${activeTab === "general" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
              >
                General Details
              </button>
              <button 
                onClick={() => setActiveTab("comments")}
                className={`text-[11px] font-black uppercase tracking-widest pb-2 transition-all flex items-center gap-2 ${activeTab === "comments" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
              >
                Comments ({comments.length})
              </button>
            </div>

            <div className="min-h-[400px]">
              {activeTab === "general" ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in duration-300">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-2 block tracking-widest">Task Title</label>
                      <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-2 block tracking-widest">Description</label>
                      <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:border-indigo-500 outline-none resize-none" />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-3 block tracking-widest">Priority</label>
                      <div className="grid grid-cols-3 gap-3">
                        {PRIORITY_LIST.map((p) => (
                          <button key={p.value} onClick={() => setPriority(p.value as Priority)} className={`py-2.5 rounded-xl border text-[10px] font-black uppercase transition-all ${priority === p.value ? `${p.bg} ${p.color} ring-2 ring-indigo-500` : "border-slate-200 dark:border-slate-800 text-slate-400 bg-slate-50 dark:bg-slate-900/30 hover:border-slate-300"}`}>{p.label}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500 mb-2 block tracking-widest">Assignee</label>
                      <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 focus:border-indigo-500 outline-none">
                        <option value="">Select Assignee</option>
                        {users.map(u => <option key={u.id} value={String(u.id)}>{u.name}</option>)}
                      </select>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/30 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800/40">
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest">Subtasks</label>
                        <button onClick={addSubtask} className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">Add</button>
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {subtasks.map((st, index) => (
                          <div key={st.id} className="flex items-center gap-3 bg-white dark:bg-slate-950/50 p-2 rounded-lg border border-slate-200 dark:border-slate-800/50">
                            <input type="checkbox" checked={st.completed} onChange={() => {
                              const newSubs = [...subtasks];
                              newSubs[index].completed = !newSubs[index].completed;
                              setSubtasks(newSubs);
                            }} />
                            <input className="bg-transparent text-xs w-full focus:outline-none text-slate-600 dark:text-slate-400" value={st.text} onChange={(e) => {
                              const newSubs = [...subtasks];
                              newSubs[index].text = e.target.value;
                              setSubtasks(newSubs);
                            }} />
                            <button onClick={() => setSubtasks(subtasks.filter(s => s.id !== st.id))} className="text-slate-400 hover:text-red-500"><X size={12}/></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-[400px] animate-in slide-in-from-right-4 duration-300">
                  <div className="flex-1 space-y-4 overflow-y-auto mb-6 pr-2 custom-scrollbar">
                    {comments.length > 0 ? (
                      comments.map((comment) => (
                        <div key={comment.id} className="bg-slate-50 dark:bg-slate-900/80 p-5 rounded-3xl border border-slate-200 dark:border-slate-800/50 group transition-all">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-[10px] font-black">
                                {comment.author[0]}
                              </div>
                              <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{comment.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-slate-400 dark:text-slate-600 font-mono">{new Date(comment.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setEditingCommentId(comment.id); setNewComment(comment.text); }} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-indigo-600 transition-colors"><Pencil size={12}/></button>
                                <button onClick={() => setComments(comments.filter(c => c.id !== comment.id))} className="p-1 hover:bg-red-50 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={12}/></button>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-8">{comment.text}</p>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600 gap-3">
                        <MessageSquare size={48} className="opacity-10" />
                        <p className="text-xs font-bold uppercase tracking-widest">No comments yet</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-stretch gap-2 bg-slate-100 dark:bg-slate-950 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 focus-within:border-indigo-500 transition-colors">
                    <input 
                      value={newComment} 
                      onChange={(e) => setNewComment(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && addComment()} 
                      className="flex-1 bg-transparent px-4 py-2 text-sm text-slate-900 dark:text-white outline-none" 
                      placeholder={editingCommentId ? "Edit comment..." : "Type your comment..."} 
                    />
                    <button 
                      onClick={addComment} 
                      className="bg-indigo-600 hover:bg-indigo-500 px-6 rounded-xl text-[10px] font-black text-white uppercase transition-all shadow-lg"
                    >
                      {editingCommentId ? "Save" : "Post"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-6 mt-8 pt-8 border-t border-slate-100 dark:border-slate-800/80">
              <button onClick={closeModal} className="text-[11px] font-black uppercase text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">Dismiss</button>
              <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl text-[11px] font-black uppercase transition-all shadow-xl">
                {editingTask ? "Update Task" : "Create Task"}
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}