import { useEffect, useState } from "react";
import {
  addProject,
  updateProject,
} from "../utils/projectHelper";
import { X } from "lucide-react";

export default function CreateProjectModal({
  onClose,
  onSaved,
  editingProject,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (editingProject) {
      setName(editingProject.name);
      setDescription(editingProject.description);
    }
  }, [editingProject]);

  function handleSubmit(e) { 
    e.preventDefault();
    if (!name.trim()) return;   
    if (editingProject) {
      updateProject(editingProject.id, { name, description });
    } else {
      const id = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      addProject({ id, name, description });
    }

    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-all">
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white tracking-tight">
          {editingProject ? "Edit Project" : "Create New Project"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
              Project Name
            </label>
            <input
              autoFocus
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
              placeholder="e.g. Website Redesign"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
              Description
            </label>
            <textarea
              rows="4"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400 resize-none"
              placeholder="What is this project about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!name.trim()}
              className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingProject ? "Save Changes" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}