import { useEffect, useState } from "react";
import { getAllTasks } from "../services/taskService";
import Modal from "../components/Modal";
import TaskDetails from "./TaskDetails";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTasks() {
      try {
        const data = await getAllTasks();
        setTasks(data || []);
      } catch {
        setTasks([]);
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, []);

  if (loading) {
    return <p className="p-6 text-white">Loading tasks…</p>;
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-semibold mb-6">Task List</h1>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => setSelectedTask(task)}
            className="px-4 py-3 border-b border-gray-700 cursor-pointer hover:bg-gray-700"
          >
            {task.todo}
          </div>
        ))}
      </div>

      <Modal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      >
        {selectedTask && <TaskDetails task={selectedTask} />}
      </Modal>
    </div>
  );
}
