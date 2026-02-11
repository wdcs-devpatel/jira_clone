import { useState, useEffect, FormEvent } from "react";
import { PRIORITY_LIST } from "../utils/constants";

type Priority = "high" | "medium" | "low";

interface Project {
  id?: string;
  name: string;
  description?: string;
  priority: Priority;
}

interface CreateProjectModalProps {
  editingProject: Project | null;
  onClose: () => void;
  onSaved: (project: Project) => void;
}

export default function CreateProjectModal({
  editingProject,
  onClose,  
  onSaved,
}: CreateProjectModalProps) {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [priority, setPriority] = useState<Priority>("medium");

  useEffect(() => {
    if (editingProject) {
      setName(editingProject.name);
      setDescription(editingProject.description || "");
      setPriority(editingProject.priority || "medium");
    } else {
      setName("");
      setDescription("");
      setPriority("medium");
    }
  }, [editingProject]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSaved({ 
      ...(editingProject?.id && { id: editingProject.id }),
      name, 
      description, 
      priority 
    });
  }
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          {editingProject ? "Edit Project" : "Create New Project"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">
              Project Name
            </label>
            <input
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 min-h-[100px] text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">
              Project Priority
            </label>
            <div className="grid grid-cols-3 gap-3">
              {PRIORITY_LIST.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
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

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2.5 text-slate-500 font-bold hover:text-slate-700 transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg transition-all">
              {editingProject ? "Update" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}