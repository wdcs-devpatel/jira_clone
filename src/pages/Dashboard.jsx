import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getAllTasks } from "../services/taskService";
import { 
  getProjects, 
  addProject, 
  updateProject, 
  deleteProject, 
  enrichTasksWithProject 
} from "../utils/projectHelper";    
import CreateProjectModal from "../components/CreateProjectModal";
import ProjectCard from "../components/ProjectCard";
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Clock, 
  ListTodo, 
  Plus, 
  Activity, 
  Search,
  SlidersHorizontal,
  ChevronDown
} from "lucide-react";

export default function Dashboard() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const priorityWeight = { high: 3, medium: 2, low: 1 };

  useEffect(() => {
    if (token) loadDashboard();
  }, [token]);

  async function loadDashboard() {
    setLoading(true);
    try {
      const projectList = getProjects(token);
      const rawTasks = await getAllTasks(token);
      const enrichedTasks = enrichTasksWithProject(rawTasks, token);
      setProjects(projectList);
      setTasks(enrichedTasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveProject(projectData) {
    if (editingProject) {
      updateProject(editingProject.id, projectData, token);
    } else {
      addProject(projectData, token);
    }
    setEditingProject(null);
    setShowCreateProject(false);
    loadDashboard();
  }

  async function handleDeleteProject(id) {
    if (window.confirm("Delete this project?")) {
      deleteProject(id, token);
      loadDashboard();
    }
  }

  const processedProjects = useMemo(() => {
    let result = [...projects];

    if (searchTerm) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "priority-desc":
          return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
        case "priority-asc":
          return (priorityWeight[a.priority] || 0) - (priorityWeight[b.priority] || 0);
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return result;
  }, [projects, searchTerm, sortBy]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "done").length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;
    const pending = tasks.filter((t) => t.status === "todo").length;
    return { total, completed, inProgress, pending };
  }, [tasks]);

  const progress = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);

  if (!token) return null;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight font-sans">Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2 font-medium">Manage your projects and productivity.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-48 transition-all text-sm shadow-sm"
            />
          </div>

          <div className="relative flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 group hover:border-indigo-400 hover:ring-4 hover:ring-indigo-500/5 transition-all shadow-sm">
            <SlidersHorizontal size={16} className="text-slate-400 mr-2 group-hover:text-indigo-500 transition-colors" />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-transparent py-2.5 pr-8 outline-none text-[11px] font-black text-slate-600 dark:text-slate-200 cursor-pointer uppercase tracking-[0.1em] transition-colors"
            >
              <option value="newest" className="dark:bg-slate-900 font-sans">Newest First</option>
              <option value="priority-desc" className="dark:bg-slate-900 font-sans text-rose-600 font-bold">Priority: High to Low</option>
              <option value="priority-asc" className="dark:bg-slate-900 font-sans text-emerald-600 font-bold">Priority: Low to High</option>
              <option value="name-asc" className="dark:bg-slate-900 font-sans">Name: A to Z</option>
              <option value="name-desc" className="dark:bg-slate-900 font-sans">Name: Z to A</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 pointer-events-none text-slate-400 group-hover:text-indigo-500 group-hover:translate-y-0.5 transition-all" />
          </div>

          <button onClick={() => setShowCreateProject(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-500/25 transition-all active:scale-95 active:shadow-inner font-bold whitespace-nowrap text-sm tracking-wide">
            <Plus size={20} /> New Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Tasks", value: stats.total, icon: ListTodo, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
          { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
          { label: "In Progress", value: stats.inProgress, icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-500/10" },
          { label: "To Do", value: stats.pending, icon: LayoutDashboard, color: "text-slate-600", bg: "bg-slate-50 dark:bg-slate-500/10" },
        ].map((stat, idx) => (
          <div key={idx} className="rounded-2xl p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 tracking-[0.15em] uppercase mb-1">{stat.label}</p>
                {loading ? <div className="h-8 w-16 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mt-2" /> : <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 font-mono tracking-tight">{stat.value}</p>}
              </div>
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} shadow-inner group-hover:scale-110 transition-transform`}><stat.icon size={24} /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
              <LayoutDashboard size={20} className="text-indigo-600" /> My Projects
            </h2>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">{processedProjects.length} Active Projects</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {processedProjects.map((p) => (
              <ProjectCard 
                key={p.id} 
                project={p} 
                onEdit={(proj) => setEditingProject(proj)} 
                onDelete={handleDeleteProject} 
              />
            ))}
          </div>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
            <Activity size={20} className="text-indigo-600" /> Performance
          </h2>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">Overall Progress</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5 tracking-wide uppercase">Based on completed tasks</p>
              </div>
              <span className="text-4xl font-black text-indigo-600 tracking-tighter">{progress}%</span>
            </div>
            <div className="h-5 rounded-full bg-slate-100 dark:bg-slate-800 p-1 overflow-hidden shadow-inner flex items-center">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-in-out shadow-[0_0_15px_rgba(79,70,229,0.6)] relative overflow-hidden" 
                style={{ width: `${progress}%` }} 
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {(showCreateProject || editingProject) && (
        <CreateProjectModal
          editingProject={editingProject}
          onClose={() => {
            setShowCreateProject(false);
            setEditingProject(null);
          }}
          onSaved={handleSaveProject}
        />
      )}
    </div>
  );
} 