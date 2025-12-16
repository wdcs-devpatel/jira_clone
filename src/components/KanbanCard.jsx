export default function KanbanCard({ task, onClick }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-gray-800 hover:bg-gray-700 transition p-4 rounded-lg shadow"
    >
      <p className="text-sm text-white font-medium">{task.title}</p>
    </div>
  );
}
