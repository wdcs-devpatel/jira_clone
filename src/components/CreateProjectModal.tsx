import { useState, useEffect, FormEvent } from "react";
import { PRIORITY_LIST } from "../utils/constants";
import { UserCheck, ChevronDown, Lock } from "lucide-react";
import { Project } from "../services/projectService";
import { getUsers } from "../services/userService"; 
import { User as UserInterface, TaskPriority } from "../interfaces"; 
import { useAuth } from "../context/AuthContext";

interface CreateProjectModalProps {
  editingProject: Project | null;
  onClose: () => void;
  onSaved: (project: any) => void;
}

export default function CreateProjectModal({
  editingProject,
  onClose,
  onSaved,
}: CreateProjectModalProps) {
  const { user } = useAuth();
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [teamLeader, setTeamLeader] = useState<string>(""); 
  const [managers, setManagers] = useState<UserInterface[]>([]); 

  // --- UPDATED PERMISSION CHECK ---
  // Standardizing role strings to include 'QA Tester' as a management role 
  const userPosition = user?.position?.toLowerCase().trim() || "";
  const canManage = [
    "project manager", 
    "team leader", 
    "qa", 
    "qa tester"
  ].includes(userPosition);

  useEffect(() => {
    async function loadManagers() {
      try {
        const allUsers = await getUsers();
        // Filter dropdown to show all potential leads (Managers, Team Leaders, and QA)
        const filtered = allUsers.filter((u) => {
          const pos = u.position?.toLowerCase().trim() || "";
          return [
            "project manager", 
            "team leader",  
            "qa tester"
          ].includes(pos);
        });
        setManagers(filtered);
      } catch (err) {
        console.error("Failed to load managers", err);
      }
    }
    loadManagers();
  }, []);

  useEffect(() => {
    if (editingProject) {
      setName(editingProject.name);
      setDescription(editingProject.description || "");
      setPriority((editingProject.priority as TaskPriority) || "medium");
      setTeamLeader(editingProject.teamLeader || "");
    } else {
      setName("");
      setDescription("");
      setPriority("medium");
      // Default team leader to current user if they have management rights
      setTeamLeader(canManage ? user?.username || "" : "");
    }
  }, [editingProject, user, canManage]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    
    // Final security check before saving
    if (!canManage) {
      alert("Unauthorized: Only Project Managers, Team Leaders, or QA can manage projects.");
      return;
    }

    onSaved({ 
      ...(editingProject && { id: editingProject.id }),
      name, 
      description, 
      priority,
      teamLeader,
      userId: user?.id 
    });
  }

  if (!canManage) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl text-center border border-slate-200 dark:border-slate-800">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 text-red-600">
            <Lock size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Access Restricted</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
            Only <span className="text-indigo-600 font-bold uppercase text-xs">Managers</span>, <span className="text-indigo-600 font-bold uppercase text-xs">Leaders</span>, or <span className="text-indigo-600 font-bold uppercase text-xs">QA</span> can manage projects.
          </p>
          <button onClick={onClose} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {editingProject ? "Edit Project" : "Create New Project"}
          </h2>
          <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest">
            {user?.position}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Project Name */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 tracking-widest">
              Project Name
            </label>
            <input
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Assign Team Leader */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 tracking-widest">
              Assign Lead Responsibility
            </label>
            <div className="relative">
              <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={18} />
              <select
                required
                value={teamLeader}
                onChange={(e) => setTeamLeader(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>Select a Lead</option>
                {managers.map((m) => (
                  <option key={m.id} value={m.username}>
                    {m.firstName} {m.lastName} (@{m.username})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 tracking-widest">
              Project Vision/Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 min-h-[100px] text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-3 tracking-widest">
              Strategic Priority
            </label>
            <div className="grid grid-cols-3 gap-3">
              {PRIORITY_LIST.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value as TaskPriority)}
                  className={`py-3 rounded-2xl border font-black text-[10px] uppercase tracking-tighter transition-all flex flex-col items-center gap-1 ${
                    priority === p.value
                      ? `${p.bg} ${p.color} border-current ring-2 ring-indigo-500/20`
                      : "border-slate-100 dark:border-slate-800 text-slate-400 bg-transparent hover:bg-slate-50"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-6 mt-8 pt-8 border-t border-slate-100 dark:border-slate-800/80">
            <button type="button" onClick={onClose} className="text-[11px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors">
              Dismiss
            </button>
            <button type="submit" className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all active:scale-95">
              {editingProject ? "Update Project" : "Initialize Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}