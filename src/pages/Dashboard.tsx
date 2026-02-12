import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllTasks } from "../services/taskService";

import { Task, TaskPriority } from "../interfaces";

import {
  getProjects,
  addProject,
  updateProject,
  deleteProject,
  enrichTasksWithProject,
  Project,
} from "../utils/projectHelper";

import CreateProjectModal from "../components/CreateProjectModal";
import ProjectCard from "../components/ProjectCard";

import {
  LayoutDashboard,
  Plus,
  Activity,
  Search,
  SlidersHorizontal,
  Loader2,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Clock,
  ListTodo,
  ChevronDown
} from "lucide-react";

export default function Dashboard() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [showCreateProject, setShowCreateProject] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const priorityWeight: Record<TaskPriority, number> = { 
    high: 3, 
    medium: 2, 
    low: 1 
  };

  useEffect(() => {
    if (token) loadDashboard();
  }, [token]);

  async function loadDashboard() {
    if (!token) return;
    setLoading(true);
    try {
      const projectList = (getProjects(token) as Project[]) || [];
      const rawTasks = await getAllTasks(token);
      
      const enrichedTasks = (enrichTasksWithProject(rawTasks, token) as unknown as Task[]) || [];
      
      setProjects(projectList);
      setTasks(enrichedTasks);
    } catch (err) {
      console.error("Dashboard Load Error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProject(projectData: Project) {
    if (!token) return;
    try {
      if (editingProject?.id) {
        updateProject(editingProject.id, projectData, token);
      } else {
        addProject(projectData, token);
      }
      setEditingProject(null);
      setShowCreateProject(false);
      loadDashboard();
    } catch (err) {
      console.error("Save Project Error:", err);
    }
  }

  async function handleDeleteProject(id: string) {
    if (!token) return;
    if (window.confirm("Delete this project? This will also remove associated tasks.")) {
      deleteProject(id, token);
      loadDashboard();
    }
  }

  const processedProjects = useMemo(() => {
    let result = [...projects];
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lowerSearch) || 
        p.description?.toLowerCase().includes(lowerSearch)
      );
    }
    result.sort((a, b) => {
      const weightA = a.priority ? priorityWeight[a.priority as TaskPriority] : 0;
      const weightB = b.priority ? priorityWeight[b.priority as TaskPriority] : 0;
      
      switch (sortBy) {
        case "priority-desc": return weightB - weightA;
        case "priority-asc": return weightA - weightB;
        case "name-asc": return a.name.localeCompare(b.name);
        case "name-desc": return b.name.localeCompare(a.name);
        default: return 0;
      }
    });
    return result;
  }, [projects, searchTerm, sortBy]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "done").length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    const todo = tasks.filter((t) => t.status === "todo").length;
    return { total, completed, inProgress, todo };
  }, [tasks]);

  const progress = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);

  if (!token) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1220] p-6 md:p-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-600 rounded-lg text-white">
                <LayoutDashboard size={20} />
              </div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Dashboard</h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your projects and track performance.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative group flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search projects..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none w-full md:w-64 text-sm dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500/20 transition-all" 
              />
            </div>
            <button 
              onClick={() => setShowCreateProject(true)} 
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all active:scale-95 whitespace-nowrap"
            >
              <Plus size={20} /> New Project
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Tasks", value: stats.total, icon: ListTodo, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
            { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
            { label: "In Progress", value: stats.inProgress, icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10" },
            { label: "To Do", value: stats.todo, icon: LayoutDashboard, color: "text-slate-600", bg: "bg-slate-50 dark:bg-slate-500/10" },
          ].map((stat, idx) => (
            <div key={idx} className="rounded-3xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 tracking-[0.15em] uppercase mb-2">{stat.label}</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-indigo-600 dark:text-indigo-400">
                  <Activity size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Global Progress</p>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">{progress}% Completion</h2>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-500 flex items-center bg-emerald-500/10 px-3 py-1 rounded-full">
                <TrendingUp size={12} className="mr-1"/> Stable
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <span>Total Workload</span>
                <span>{stats.completed} / {stats.total} Tasks Finished</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden p-1 shadow-inner">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(79,70,229,0.5)] relative overflow-hidden" 
                  style={{ width: `${progress}%` }} 
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Task Breakdown</p>
            <div className="space-y-5">
              {[
                { label: "To Do", value: stats.todo, color: "bg-slate-400" },
                { label: "In Progress", value: stats.inProgress, color: "bg-amber-500" },
                { label: "Completed", value: stats.completed, color: "bg-emerald-500" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{item.label}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-24">
            <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
            <p className="text-slate-500 font-medium tracking-wide">Synchronizing your dashboard...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center px-4">
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight flex items-center gap-2">
                Active Projects
                <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                  {processedProjects.length}
                </span>
              </h2>
              <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 group hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 active:scale-[0.98]">
  <SlidersHorizontal 
    size={14} 
    className="text-slate-400 group-hover:text-indigo-500 transition-colors duration-300 mr-2" 
  />
  
  <select 
    value={sortBy} 
    onChange={(e) => setSortBy(e.target.value)}
    className="appearance-none bg-transparent py-2.5 pr-8 outline-none text-[10px] font-black text-slate-600 dark:text-slate-200 cursor-pointer uppercase tracking-widest relative z-10"
  >
    <option value="newest" className="dark:bg-slate-900">Newest First</option>
    <option value="priority-desc" className="dark:bg-slate-900">Priority: High to Low</option>
    <option value="priority-asc" className="dark:bg-slate-900">Priority: Low to High</option>
    <option value="name-asc" className="dark:bg-slate-900">Name: A - Z</option>
  </select>

     <ChevronDown 
    size={14} 
    className="text-slate-400 -ml-6 pointer-events-none group-hover:text-indigo-500 group-hover:translate-y-0.5 transition-all duration-300" 
  />
</div>
            </div>

            {processedProjects.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {processedProjects.map((p) => (
                  <ProjectCard 
                    key={p.id} 
                    project={p as any} 
                    onEdit={(proj) => setEditingProject(proj as any)} 
                    onDelete={handleDeleteProject} 
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
                <div className="p-5 bg-slate-100 dark:bg-slate-800 rounded-full mb-4 text-slate-400">
                  <AlertCircle size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">No active projects</h3>
                <p className="text-slate-500 text-sm mt-2 mb-8 text-center max-w-sm">Launch your first mission by clicking the "New Project" button above.</p>
              </div>
            )}
          </div>
        )}

        {(showCreateProject || editingProject) && (
          <CreateProjectModal 
            editingProject={editingProject} 
            onClose={() => { setShowCreateProject(false); setEditingProject(null); }} 
            onSaved={handleSaveProject} 
          />
        )}
      </div>
    </div>
  );
}