import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom"; 
import { getAllTasks, searchTasks } from "../services/taskService";
import { getProjects } from "../services/projectService";
import { PRIORITIES } from "../utils/constants";
import { useAuth } from "../context/AuthContext"; // ✅ Import Auth
import {
  CheckCircle2,
  Circle,
  Clock,
  ClipboardList,
  Search,
  Filter,
  Lock
} from "lucide-react";

type Status = "todo" | "in-progress" | "done";
type Priority = "high" | "medium" | "low";

interface Task {
  id: number;
  title: string;
  status: Status;
  priority: Priority;
  projectId: number;
}

export default function TaskList() {
  const navigate = useNavigate(); 
  const { permissions } = useAuth(); // ✅ Extract permissions
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectMap, setProjectMap] = useState<Record<string, string>>({});
  
  const isInitialMount = useRef(true);

  // ✅ Permission-based logic
  // You might want to restrict editing or viewing details based on 'edit_task'
  const canEditTask = permissions.includes("edit_task");

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    setLoading(true);
    try {
      const projects = await getProjects();

      const map: Record<string, string> = {};
      projects.forEach(p => {
        if (p.id) map[String(p.id)] = p.name;
      });
      setProjectMap(map);

      const taskPromises = projects.map(p => getAllTasks(p.id!));
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

  /* ---------------- BACKEND SEARCH ---------------- */
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const delay = setTimeout(() => {
      fetchSearchResults();
    }, 400); 

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

  /* ---------------- STATUS CONFIG ---------------- */
  function getStatusConfig(status: Status) {
    switch (status) {
      case "done":
        return {
          label: "Done",
          style: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
          icon: <CheckCircle2 size={12} />
        };
      case "in-progress":
        return {
          label: "In Progress",
          style: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
          icon: <Clock size={12} />
        };
      default:
        return {
          label: "To Do",
          style: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
          icon: <Circle size={12} />
        };
    }
  }

  return (
    <div className="p-6 md:p-10 min-h-screen bg-slate-50 dark:bg-[#0b1220]">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">
              Task List
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Review and manage your team's workload.
            </p>
          </div>

          {/* Search and Filters */}
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

        {/* Table / Content Area */}
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">Updating tasks...</p>
            </div>
          ) : (
            <>
              {/* Header Row */}
              <div className="grid grid-cols-12 px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-b text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <div className="col-span-6">Task Title</div>
                <div className="col-span-2 text-center">Priority</div>
                <div className="col-span-2 text-center">Project</div>
                <div className="col-span-2 text-right">Status</div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {tasks.map(task => {
                  const p = PRIORITIES[task.priority] || PRIORITIES.medium;
                  const status = getStatusConfig(task.status);

                  return (
                    <div
                      key={task.id}
                      onClick={() => {
                        // ✅ Gated Navigation
                        if (canEditTask) {
                          navigate(`/kanban/${task.projectId}/task/${task.id}`);
                        }
                      }}
                      className={`grid grid-cols-12 px-8 py-6 transition-all group ${
                        canEditTask 
                          ? "cursor-pointer hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5" 
                          : "cursor-default opacity-80"
                      }`}
                    >
                      <div className="col-span-6 font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                        {task.title}
                        {!canEditTask && <Lock size={12} className="text-slate-400" />}
                      </div>

                      <div className="col-span-2 flex justify-center">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${p.bg} ${p.color}`}>
                          {p.label}
                        </span>
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

              {/* Empty State */}
              {tasks.length === 0 && (
                <div className="text-center py-24 flex flex-col items-center">
                  <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                    <ClipboardList size={40} className="text-slate-300 dark:text-slate-600"/>
                  </div>
                  <h3 className="text-slate-900 dark:text-white font-bold">No tasks found</h3>
                  <p className="text-slate-500 text-sm mt-1">Try adjusting your search for "{searchTerm}"</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}