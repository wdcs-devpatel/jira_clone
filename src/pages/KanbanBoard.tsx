import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios"; 
import { ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";

// ✅ UPDATED: Importing modified Status and service functions
import {
  getAllTasks,
  updateTaskStatus,
  Status
} from "../services/taskService";

import { getUsers } from "../services/userService";
import KanbanColumn from "../components/KanbanColumn";
import { TaskId } from "../interfaces/task/task.interface";

// ✅ FIXED: Updated COLUMNS to To Do, In Progress, QA, and Done
const COLUMNS: { key: Status; title: string }[] = [
  { key: "To Do", title: "To Do" },
  { key: "In Progress", title: "In Progress" },
  { key: "QA", title: "QA" },
  { key: "Done", title: "Done" },
];

export default function KanbanBoard() {
  const { permissions } = useAuth();
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]); 
  const [doneNotification, setDoneNotification] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const canCreateTask = permissions.includes("create_task");
  const canUpdateStatus = permissions.includes("edit_task"); 
  const canViewUsers = permissions.includes("view_users");

  useEffect(() => {
    if (projectId) {
      localStorage.setItem("currentProjectId", projectId);
      window.dispatchEvent(new Event("storage"));
      loadInitialData();
    }
  }, [projectId]);

  async function loadInitialData() {
    try {
      setLoading(true);

      const memberIdsRes = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/projects/${projectId}/members`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
        }
      );

      const memberIds: any[] = memberIdsRes.data;

      let allUsers: any[] = [];
      if (canViewUsers) {
        try {
          allUsers = await getUsers();
        } catch {
          console.warn("RBAC: Cannot view user list.");
        }
      }

      const sortedUsers = allUsers.sort((a: any) => {
        const aId = a._id || a.id;
        return memberIds.includes(aId) ? -1 : 1;
      });
      
      setUsers(sortedUsers);
      await loadTasks();
    } catch (err) {
      console.error("Kanban Load Error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadTasks() {
    try {
      const fetchedTasks = await getAllTasks(projectId);
      setTasks(fetchedTasks);
    } catch (err) {
      console.error("Load Tasks Error:", err);
    }
  }
  
  const handleDragStart = (e: React.DragEvent, taskId: TaskId) => {
    if (!canUpdateStatus) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("taskId", String(taskId));
  };

  const onDragOver = (e: React.DragEvent) => {
    if (canUpdateStatus) e.preventDefault();
  };

  const onDrop = async (e: React.DragEvent, newStatus: Status) => {
    e.preventDefault();
    if (!canUpdateStatus) return;

    const taskId = e.dataTransfer.getData("taskId");

    if (taskId) {
      if (newStatus === "Done") {
        const droppedTask = tasks.find(t => String(t._id || t.id) === taskId);
        setDoneNotification(`Nice work! "${droppedTask?.title || 'Task'}" is completed.`);
        setTimeout(() => setDoneNotification(null), 3000);
      }

      try {
        await updateTaskStatus(taskId, newStatus);
        await loadTasks();
      } catch (error) {
        console.error("Drop Error:", error);
      }
    }
  };

  // ✅ FIXED: Changed defaultStatus to "To Do"
  const handleNavigateToTask = (task: any = null, defaultStatus: Status = "To Do") => {
    if (task) {
      const id = task._id || task.id;
      navigate(`/kanban/${projectId}/task/${id}`);
    } else {
      navigate(`/kanban/${projectId}/task/create?status=${defaultStatus}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b1220]">
        <div className="text-xs font-black uppercase tracking-widest animate-pulse text-indigo-500">
          Syncing MongoDB Board...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#0b1220] p-4 md:p-8 transition-colors duration-300">

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

      <div className="max-w-[1600px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link
            to="/dashboard"
            className="text-slate-500 hover:text-indigo-500 flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          
          <div className="flex items-center gap-4">
            {!canViewUsers && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-amber-500/20">
                <ShieldAlert size={12} /> Restricted View
              </div>
            )}
            {!canUpdateStatus && (
              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-200 dark:border-indigo-800">
                Collab Mode (View Only)
              </div>
            )}
          </div>
        </div>

        {/* ✅ FIXED: Grid updated to 4 columns (md:grid-cols-4) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {COLUMNS.map((col) => (
            <div
              key={col.key}
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, col.key)}
              className="h-full"
            >
              <KanbanColumn
                title={col.title}
                status={col.key}
                tasks={tasks.filter((t) => t.status === col.key)}
                users={users}
                onEdit={handleNavigateToTask}
                onDelete={() => {}}
                onAddClick={
                  canCreateTask
                    ? () => handleNavigateToTask(null, col.key)
                    : () => {}
                }
                onDragStart={handleDragStart}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}