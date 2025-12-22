import { useState, useEffect } from "react";
import { PRIORITY_LIST } from "../utils/constants";

export default function CreateProjectModal({ editingProject, onClose, onSaved }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

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

  const handleSubmit = (e) => { 
    e.preventDefault();
    onSaved({ name, description, priority });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
          {editingProject ? "Edit Project" : "Create New Project"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Project Name</label>
            <input 
              required
              autoFocus
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Website Redesign" 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="What is this project about?" 
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white min-h-[100px] transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Project Priority</label>
            <div className="grid grid-cols-3 gap-2">
              {PRIORITY_LIST.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setPriority(p.value);
                  }}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    priority === p.value 
                    ? "border-indigo-600 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 shadow-sm" 
                    : "border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end items-center gap-4 pt-4">
            <button 
              type="button" 
              onClick={(e) => {
                e.preventDefault();
                onClose();
              }} 
              className="px-6 py-2.5 text-slate-500 font-bold hover:text-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all active:scale-95 font-bold">
              {editingProject ? "Update" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}