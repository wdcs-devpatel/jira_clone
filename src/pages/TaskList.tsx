import { useEffect, useState, useRef } from "react";
import { getAllTasks, searchTasks } from "../services/taskService";
import { getProjects } from "../services/projectService";
import { PRIORITIES } from "../utils/constants";
import Modal from "../components/Modal";
import TaskDetails from "./TaskDetails";
import {
  CheckCircle2,
  Circle,
  Clock,
  ClipboardList,
  Search,
  Filter
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [projectMap, setProjectMap] = useState<Record<string, string>>({});
  
  // Track if it's the first render to prevent double-firing loadInitialData
  const isInitialMount = useRef(true);

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
    // Skip the search effect on the very first mount since loadInitialData handles it
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const delay = setTimeout(() => {
      fetchSearchResults();
    }, 400); // 400ms Debounce

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

  /* ---------------- UI ---------------- */
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

          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none text-sm w-64 dark:text-white"
              />
            </div>

            <button className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <Filter size={18}/>
            </button>
          </div>
        </div>

        {/* Table / Content Area */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
          
          {loading ? (
            /* Loading State inside the table area to prevent layout shift */
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">Updating tasks...</p>
            </div>
          ) : (
            <>
              {/* Header Row */}
              <div className="grid grid-cols-12 px-8 py-4 bg-slate-50 dark:bg-slate-800/50 border-b text-[10px] font-bold text-slate-400 uppercase tracking-widest">
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
                      onClick={() => setSelectedTask(task)}
                      className="grid grid-cols-12 px-8 py-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="col-span-6 font-semibold text-slate-700 dark:text-slate-200">
                        {task.title}
                      </div>

                      <div className="col-span-2 flex justify-center">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${p.bg} ${p.color}`}>
                          {p.label}
                        </span>
                      </div>

                      <div className="col-span-2 text-center text-sm text-slate-500 dark:text-slate-400">
                        {projectMap[String(task.projectId)] || "Unassigned"}
                      </div>

                      <div className="col-span-2 flex justify-end">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${status.style}`}>
                          {status.icon} {status.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Empty State */}
              {tasks.length === 0 && (
                <div className="text-center py-24">
                  <ClipboardList size={40} className="mx-auto text-slate-300"/>
                  <p className="text-slate-500 mt-4">No tasks found matching "{searchTerm}"</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={!!selectedTask} onClose={() => setSelectedTask(null)}>
        {selectedTask && <TaskDetails task={selectedTask}/>}
      </Modal>
    </div>
  );
}