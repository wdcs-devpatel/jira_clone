import { useEffect, useState } from "react";
import {
  addProject,
  updateProject,
} from "../utils/projectHelper";

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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-800 p-6 rounded-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {editingProject ? "Edit Project" : "Create Project"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded"
            placeholder="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <textarea
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
