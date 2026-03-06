import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom"; 
import { getAllTasks, searchTasks, addTask } from "../services/taskService"; 
import { getProjects } from "../services/projectService";
import { PRIORITIES } from "../utils/constants";
import { useAuth } from "../context/AuthContext"; 
import { 
  getBacklogs, 
  createBacklog, 
  updateBacklog, 
  deleteBacklog 
} from "../services/backlogService"; 
import {
  CheckCircle2,
  Circle,
  Clock,
  ClipboardList,
  Search,
  Filter,
  Lock,
  Trash2,
  Edit2,
  Save,
  X,
  PlusCircle,
  Layout 
} from "lucide-react";

type Status = "todo" | "in-progress" | "done";
type Priority = "critical" | "high" | "medium" | "low";

interface Task {
  id: number;
  title: string;
  status: Status;
  priority: Priority;
  projectId: number;
}

interface Backlog {
  _id: string;
  title: string;
  projectId: number;
  createdBy: number;
  priority: Priority;
  status: Status;
}

export default function TaskList() {
  const navigate = useNavigate(); 
  const { permissions } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [backlogs, setBacklogs] = useState<Backlog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectMap, setProjectMap] = useState<Record<string, string>>({});
  
  const [projects, setProjects] = useState<any[]>([]);
  const [newBacklogProject, setNewBacklogProject] = useState<number | null>(null);

  const [showCreator, setShowCreator] = useState(false);
  const [newBacklogTitle, setNewBacklogTitle] = useState("");
  const [newBacklogPriority, setNewBacklogPriority] = useState<Priority>("medium");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPriority, setEditPriority] = useState<Priority>("medium");
  // ✅ 1. Add Edit Project State
  const [editProject, setEditProject] = useState<number | null>(null);
  
  const isInitialMount = useRef(true);
  const canEditTask = permissions.includes("edit_task");

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    loadInitialData();
    loadBacklogs();
  }, []);

  async function loadInitialData() {
    setLoading(true);
    try {
      const projectList = await getProjects();
      setProjects(projectList);

      const map: Record<string, string> = {};
      projectList.forEach(p => {
        if (p.id) map[String(p.id)] = p.name;
      });
      setProjectMap(map);

      const taskPromises = projectList.map(p => getAllTasks(p.id!));
      const results = await Promise.allSettled(taskPromises);
      const flatTasks = results
        .filter((r): r is PromiseFulfilledResult<Task[]> => r.status === "fulfilled")
        .flatMap(r => r.value);

      setTasks(flatTasks);
    } catch (err) {
      console.error("Task Load Error:", err);
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- BACKLOG LOGIC ---------------- */
  async function loadBacklogs() {
    try {
      const data = await getBacklogs();
      setBacklogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Backlog Load Error:", err);
      setBacklogs([]);
    }
  }

  async function createBacklogItem() {
    if (!newBacklogTitle.trim() || !newBacklogProject) return;
    try {
      const newBacklog = await createBacklog({
        title: newBacklogTitle,
        priority: newBacklogPriority,
        status: "todo",
        projectId: newBacklogProject,
        createdBy: 1
      });
      setBacklogs(prev => [newBacklog, ...prev]);
      
      setNewBacklogTitle("");
      setNewBacklogPriority("medium");
      setNewBacklogProject(null);
      setShowCreator(false);
    } catch (err) {
      console.error("Create Backlog Error:", err);
    }
  }

  async function moveToTodo(item: Backlog) {
    try {
      await addTask({
        title: item.title,
        priority: item.priority,
        status: "To Do", 
      }, item.projectId);

      await deleteBacklog(item._id);
      setBacklogs(prev => prev.filter(b => b._id !== item._id));
      loadInitialData(); 
    } catch (err) {
      console.error("Move backlog to todo error", err);
    }
  }

  async function handleDeleteBacklog(id: string) {
    if (!window.confirm("Are you sure you want to delete this backlog item?")) return;
    try {
      await deleteBacklog(id);
      setBacklogs(prev => prev.filter(b => b._id !== id));
    } catch (err) {
      console.error("Delete backlog error", err);
    }
  }

  // ✅ 2. Updated startEdit()
  function startEdit(item: Backlog) {
    setEditingId(item._id);
    setEditTitle(item.title);
    setEditPriority(item.priority);
    setEditProject(item.projectId);
  }

  // ✅ 3. Updated saveEdit()
  async function saveEdit(id: string) {
    try {
      const updated = await updateBacklog(id, {
        title: editTitle,
        priority: editPriority,
        projectId: editProject as number
      });
      setBacklogs(prev => prev.map(b => (b._id === id ? updated : b)));
      setEditingId(null);
    } catch (err) {
      console.error("Update backlog error", err);
    }
  }

  /* ---------------- SEARCH ---------------- */
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const delay = setTimeout(() => fetchSearchResults(), 400); 
    return () => clearTimeout(delay);
  }, [searchTerm]);

  async function fetchSearchResults() {
    setLoading(true);
    try {
      if (!searchTerm.trim()) {
        await loadInitialData();
        return;
      }
      const results = await searchTasks(searchTerm);
      setTasks(results);
    } catch (err) {
      console.error("Search Error:", err);
    } finally {
      setLoading(false);
    }
  }

  // ✅ 5. Improved Type Safety for status config
  function getStatusConfig(status: Status | string) {
    const s = status.toLowerCase();
    if (s === "done") return { label: "Done", style: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400", icon: <CheckCircle2 size={12} /> };
    if (s === "in progress") return { label: "In Progress", style: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400", icon: <Clock size={12} /> };
    return { label: "To Do", style: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400", icon: <Circle size={12} /> };
  }

  return (
    <div className="p-6 md:p-10 min-h-screen bg-slate-50 dark:bg-[#0b1220]">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Task List</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Review and manage your team's workload.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none text-sm w-64 dark:text-white transition-all"
              />
            </div>
            <button className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-indigo-500 transition-colors">
              <Filter size={18}/>
            </button>
          </div>
        </div>

        {/* Active Task Table */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">Updating tasks...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-12 px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-b text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <div className="col-span-6">Task Title</div>
                <div className="col-span-2 text-center">Priority</div>
                <div className="col-span-2 text-center">Project</div>
                <div className="col-span-2 text-right">Status</div>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {tasks.map(task => {
                  const p = PRIORITIES[task.priority] || PRIORITIES.medium;
                  const status = getStatusConfig(task.status);
                  return (
                    <div
                      key={task.id}
                      onClick={() => canEditTask && navigate(`/kanban/${task.projectId}/task/${task.id}`)}
                      className={`grid grid-cols-12 px-8 py-6 transition-all group ${canEditTask ? "cursor-pointer hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5" : "cursor-default opacity-80"}`}
                    >
                      <div className="col-span-6 font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                        {task.title}
                        {!canEditTask && <Lock size={12} className="text-slate-400" />}
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${p.bg} ${p.color}`}>{p.label}</span>
                      </div>
                      <div className="col-span-2 text-center text-xs font-bold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                        {projectMap[String(task.projectId)] || "Unassigned"}
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase ${status.style}`}>
                          {status.icon} {status.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Backlog Section */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Backlog</h2>
            <button
              onClick={() => setShowCreator(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition"
            >
              + Add Backlog
            </button>
          </div>

          {showCreator && (
            <div className="flex flex-wrap gap-3 mb-6 p-4 border border-indigo-100 dark:border-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-500/5 rounded-2xl items-center">
              <input
                type="text" autoFocus placeholder="What needs to be done?"
                value={newBacklogTitle} onChange={(e) => setNewBacklogTitle(e.target.value)}
                className="flex-1 min-w-[200px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              />
              
              <select
                value={newBacklogPriority} onChange={(e) => setNewBacklogPriority(e.target.value as Priority)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={newBacklogProject || ""}
                onChange={(e) => setNewBacklogProject(Number(e.target.value))}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>

              <div className="flex gap-2 ml-auto">
                <button 
                  onClick={createBacklogItem} 
                  disabled={!newBacklogTitle.trim() || !newBacklogProject} 
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-all"
                >
                  Create
                </button>
                <button onClick={() => setShowCreator(false)} className="px-4 py-2 border border-slate-200 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-bold">Cancel</button>
              </div>
            </div>
          )}

          {backlogs.length === 0 ? (
            <div className="text-slate-400 text-sm italic">No backlog items yet</div>
          ) : (
            <div className="space-y-3">
              {backlogs.map((item: Backlog) => {
                const p = PRIORITIES[item.priority as Priority] || PRIORITIES.medium;
                const isEditing = editingId === item._id;

                return (
                  <div key={item._id} className="flex justify-between items-center p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800/50 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all group">
                    <div className="flex-1 mr-4">
                      {/* ✅ 4. Updated Edit UI with Project Selector */}
                      {isEditing ? (
                        <div className="flex flex-wrap gap-2 items-center">
                          <input
                            autoFocus value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="px-3 py-1 border border-indigo-500 rounded-lg text-sm dark:bg-slate-800 dark:text-white outline-none"
                          />
                          <select
                            value={editPriority}
                            onChange={(e) => setEditPriority(e.target.value as Priority)}
                            className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800 dark:text-white"
                          >
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                          </select>
                          <select
                            value={editProject || ""}
                            onChange={(e) => setEditProject(Number(e.target.value))}
                            className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:bg-slate-800 dark:text-white"
                          >
                            {projects.map((p) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                            {item.title}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                            Project: {projectMap[String(item.projectId)] || "Unknown"}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {!isEditing && (
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${p.bg} ${p.color}`}>
                          {p.label}
                        </span>
                      )}

                      <div className="flex gap-1">
                        {isEditing ? (
                          <>
                            <button onClick={() => saveEdit(item._id)} className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors" title="Save"><Save size={14} /></button>
                            <button onClick={() => setEditingId(null)} className="p-1.5 bg-slate-400 text-white rounded-lg hover:bg-slate-500 transition-colors" title="Cancel"><X size={14} /></button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => moveToTodo(item)}
                              className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1 text-[10px] font-bold px-2"
                            >
                              <PlusCircle size={12} /> ADD TO TODO
                            </button>
                            <button onClick={() => startEdit(item)} className="p-1.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors" title="Edit"><Edit2 size={14} /></button>
                            <button onClick={() => handleDeleteBacklog(item._id)} className="p-1.5 bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors" title="Delete"><Trash2 size={14} /></button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}