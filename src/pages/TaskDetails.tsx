import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { ArrowLeft, X } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { getUsers } from "../services/userService";
import { 
  updateTask, 
  getAllTasks,
  addTask 
} from "../services/taskService";
import { PRIORITY_LIST, Priority } from "../utils/constants";

export default function TaskDetails() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>();
  
  const isCreateMode = taskId === "create";
  const numericTaskId = !isCreateMode ? Number(taskId) : null;
  const numericProjectId = Number(projectId);

  const queryParams = new URLSearchParams(location.search);
  const initialStatus = queryParams.get("status") || "todo";

  const [loading, setLoading] = useState(!isCreateMode);
  const [activeTab, setActiveTab] = useState<"general" | "comments">("general");

  // ✅ Assignee state
  const [assigneeId, setAssigneeId] = useState<number | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(initialStatus);
  const [priority, setPriority] = useState<Priority>("medium");
  const [subtasks, setSubtasks] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");

  const permissions = user?.permissions || [];
  const canManageTasks =
    permissions.includes("edit_task") ||
    permissions.includes("create_task");

  /* ==============================
     LOAD USERS
  ============================== */
  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (err) {
      console.error("User fetch error:", err);
    }
  }

  /* ==============================
     LOAD TASK (EDIT MODE)
  ============================== */
  useEffect(() => {
    if (!isCreateMode && !isNaN(numericTaskId!)) {
      loadTaskData();
    }
  }, [taskId]);

  async function loadTaskData() {
    try {
      setLoading(true);
      const allTasks = await getAllTasks(numericProjectId);
      const foundTask = allTasks.find(
        (t: any) => Number(t.id) === numericTaskId
      );

      if (foundTask) {
        setTitle(foundTask.title || "");
        setDescription(foundTask.description || "");
        setPriority(foundTask.priority || "medium");
        setStatus(foundTask.status || "todo");
        setAssigneeId(foundTask.assigneeId || null);

        setSubtasks(
          typeof foundTask.subtasks === "string"
            ? JSON.parse(foundTask.subtasks)
            : foundTask.subtasks || []
        );

        setComments(
          typeof foundTask.comments === "string"
            ? JSON.parse(foundTask.comments)
            : foundTask.comments || []
        );
      } else {
        toast.error("Task not found");
        navigate(`/kanban/${projectId}`);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }

  /* ==============================
     COMMENTS
  ============================== */
  const addComment = () => {
    if (!newComment.trim()) return;

    const commentObj = {
      id: Date.now(),
      text: newComment,
      author: user?.username || "Anonymous",
      createdAt: new Date().toISOString(),
    };

    setComments([...comments, commentObj]);
    setNewComment("");
  };

  /* ==============================
     SAVE TASK
  ============================== */
  async function handleSave() {
    if (!isCreateMode && isNaN(numericTaskId!)) {
      toast.error("Invalid Task ID reference.");
      return;
    }

    try {
      const taskPayload = {
        title,
        description,
        priority,
        status,
        assigneeId,
        subtasks,
        comments,
      };

      if (isCreateMode) {
        await addTask(taskPayload, numericProjectId);
        toast.success("Task created successfully");
      } else {
        await updateTask(numericTaskId!, taskPayload);
        toast.success("Task updated successfully");
      }

      navigate(`/kanban/${projectId}`);
    } catch (err: any) {
      console.error("Save Error:", err);
      toast.error(
        err.response?.data?.message || "Internal Server Error during save"
      );
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center dark:text-white font-black uppercase text-xs tracking-widest">
        Syncing Config...
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1220] p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <div className="mb-4">
          <Link
            to={`/kanban/${projectId}`}
            className="group inline-flex items-center gap-2 text-slate-400 hover:text-indigo-500 text-[9px] font-black uppercase tracking-widest"
          >
            <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border shadow-sm">
              <ArrowLeft size={12} />
            </div>
            Back to Board
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border overflow-hidden">
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
              {isCreateMode ? "New Task Draft" : "Task Configuration"}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* LEFT COLUMN */}
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold uppercase">
                    Title
                  </label>
                  <input
                    disabled={!canManageTasks}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border mt-2"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase">
                    Description
                  </label>
                  <textarea
                    disabled={!canManageTasks}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border mt-2"
                  />
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-6">
                {/* PRIORITY */}
                <div>
                  <label className="text-xs font-bold uppercase">
                    Priority
                  </label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {PRIORITY_LIST.map((p) => (
                      <button
                        key={p.value}
                        disabled={!canManageTasks}
                        onClick={() =>
                          setPriority(p.value as Priority)
                        }
                        className={`py-2 rounded-xl border text-xs font-bold ${
                          priority === p.value
                            ? "bg-indigo-600 text-white"
                            : ""
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ASSIGNEE */}
                <div>
                  <label className="text-xs font-bold uppercase">
                    Assignee
                  </label>

                  <select
                    disabled={!canManageTasks}
                    value={assigneeId || ""}
                    onChange={(e) =>
                      setAssigneeId(
                        e.target.value
                          ? Number(e.target.value)
                          : null
                      )
                    }
                    className="w-full px-4 py-3 rounded-xl border mt-2"
                  >
                    <option value="">Unassigned</option>

                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName} ({u.username})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* SAVE BUTTON */}
            <div className="mt-8 flex justify-end gap-6">
              <button
                onClick={() =>
                  navigate(`/kanban/${projectId}`)
                }
                className="text-sm font-bold text-slate-500"
              >
                Discard
              </button>

              {canManageTasks && (
                <button
                  onClick={handleSave}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold"
                >
                  {isCreateMode ? "Create" : "Save"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}