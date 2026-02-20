import { useState, useEffect, FormEvent } from "react";
import { PRIORITY_LIST } from "../utils/constants";
import { UserCheck, ChevronDown } from "lucide-react";
import { Project } from "../services/projectService";
import { getUsers } from "../services/userService"; // Added for fetching users
import { User as UserInterface, TaskPriority } from "../interfaces"; // Renamed import to avoid conflict
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
  const [teamLeader, setTeamLeader] = useState<string>(""); // Default to empty for selection
  const [managers, setManagers] = useState<UserInterface[]>([]); // State for filtered managers

  // Fetch managers for the dropdown
  useEffect(() => {
    async function loadManagers() {
      try {
        const allUsers = await getUsers();
        // Only include users defined as Project Manager in their profile
        const filtered = allUsers.filter((u) => u.position === "Project Manager");
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
      // Default to the current user if they are a Project Manager
      setTeamLeader(user?.position === "Project Manager" ? user.username : "");
    }
  }, [editingProject, user]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    
    onSaved({ 
      ...(editingProject && { id: editingProject.id }),
      name, 
      description, 
      priority,
      teamLeader,
      userId: user?.id 
    });
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in duration-300">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          {editingProject ? "Edit Project" : "Create New Project"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Project Name */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">
              Project Name
            </label>
            <input
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Team Leader / Project Manager Selection */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">
              Assign Project Manager
            </label>
            <div className="relative">
              <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={18} />
              <select
                required
                value={teamLeader}
                onChange={(e) => setTeamLeader(e.target.value)}
                className="w-full pl-12 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>Select a Project Manager</option>
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
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 min-h-[80px] text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Project Priority */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">
              Project Priority
            </label>
            <div className="grid grid-cols-3 gap-3">
              {PRIORITY_LIST.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value as TaskPriority)}
                  className={`py-3 rounded-xl border-2 font-bold text-xs transition-all flex flex-col items-center gap-1 ${
                    priority === p.value
                      ? `${p.bg} ${p.color} border-current ${p.darkBg} ${p.darkText}`
                      : "border-slate-100 dark:border-slate-800 text-slate-400 bg-transparent hover:border-slate-200"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${priority === p.value ? 'bg-current animate-pulse' : 'bg-slate-300'}`} />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-slate-500 font-bold hover:text-slate-700 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
              {editingProject ? "Update" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}