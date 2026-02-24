import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios"; 
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

import {
  getAllTasks,
  updateTaskStatus,
} from "../services/taskService";

import { getUsers } from "../services/userService";
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
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const numericProjectId = projectId ? Number(projectId) : null;
  
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]); 
  const [doneNotification, setDoneNotification] = useState<string | null>(null);

  const userPosition = user?.position?.toLowerCase().trim() || "";
  
  const canManageTasks = [
    "project manager", 
    "team leader",  
    "qa tester"
  ].includes(userPosition);

  useEffect(() => {
    if (projectId) {
      localStorage.setItem("currentProjectId", projectId);
      window.dispatchEvent(new Event("storage"));
    }
  }, [projectId]);

  useEffect(() => {
    if (numericProjectId !== null && !isNaN(numericProjectId)) {
      loadInitialData();
    }
  }, [numericProjectId]);

  async function loadInitialData() {
    if (numericProjectId === null || isNaN(numericProjectId)) return;
    
    try {
      const [allUsers, memberIdsRes] = await Promise.all([
        getUsers(),
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/projects/${numericProjectId}/members`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
        })
      ]);

      const memberIds: number[] = memberIdsRes.data;

      const sortedUsers = allUsers.sort((a: any, b: any) => {
        const aIsMember = memberIds.includes(a.id);
        const bIsMember = memberIds.includes(b.id);
        if (aIsMember && !bIsMember) return -1;
        if (!aIsMember && bIsMember) return 1;
        return 0;
      });
      
      setUsers(sortedUsers);
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
    if (!canManageTasks) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("taskId", String(taskId));
  };

  const onDragOver = (e: React.DragEvent) => {
    if (canManageTasks) e.preventDefault();
  };

  const onDrop = async (e: React.DragEvent, newStatus: Status) => {
    e.preventDefault();
    if (!canManageTasks) return;

    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      if (newStatus === "done") {
        const droppedTask = tasks.find(t => String(t.id) === taskId);
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

  /**
   * REFACTORED: Instead of opening a modal, we navigate to the task details page.
   */
  const handleNavigateToTask = (task: any = null, defaultStatus: Status = "todo") => {
    if (task) {
      // Navigates to /kanban/:projectId/task/:taskId
      navigate(`/kanban/${projectId}/task/${task.id}`);
    } else {
      // Optional: Logic for creating a new task page
      // navigate(`/kanban/${projectId}/task/create?status=${defaultStatus}`);
      
      // If you still want a modal for "Creation Only", keep showModal state, 
      // otherwise, redirect to a creation page.
      alert("Redirect to Create Task Page or use a simple Create Modal");
    }
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
        <div className="flex justify-between items-center mb-8">
           <Link to="/dashboard" className="text-slate-500 hover:text-indigo-500 flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors">
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          {!canManageTasks && (
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-200 dark:border-indigo-800">
              Collab Mode (View Only)
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {COLUMNS.map((col) => (
            <div key={col.key} onDragOver={onDragOver} onDrop={(e) => onDrop(e, col.key)} className="h-full">
              <KanbanColumn
                title={col.title}
                status={col.key}
                tasks={tasks.filter((t) => t.status === col.key)}
                users={users} 
                onEdit={handleNavigateToTask} 
                onDelete={() => {}} // Handle deletion inside the Details page
                onAddClick={canManageTasks ? () => handleNavigateToTask(null, col.key) : () => {}}
                onDragStart={handleDragStart}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}