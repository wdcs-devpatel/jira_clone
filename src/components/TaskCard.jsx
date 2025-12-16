import { useDraggable } from "@dnd-kit/core";

export default function TaskCard({ task, column }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    data: { column },
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-[#1f2937] hover:bg-[#273449] transition rounded-lg p-4 shadow-md cursor-grab active:cursor-grabbing"
    >
      <p className="text-sm font-medium leading-snug">
        {task.title}
      </p>
    </div>
  );
}
