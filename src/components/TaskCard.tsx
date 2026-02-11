  // src/components/TaskCard.tsx

  import { useDraggable } from "@dnd-kit/core";
  import { Task } from "../interfaces/task/task.interface";

  interface TaskCardProps {
    task: Task;
    column: string;
  }

  export default function TaskCard({ task, column }: TaskCardProps) {
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
        className="rounded-md bg-white p-3 shadow-sm cursor-grab"
      >
        <p className="text-sm font-medium leading-snug">
          {task.title}
        </p>
      </div>
    );
  }
