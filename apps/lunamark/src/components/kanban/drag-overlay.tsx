import type { Task } from "@/schemas/task";
import { TaskCardContent } from "./task-card-content";

interface KanbanDragOverlayProps {
	activeTask: Task | null;
}

export function KanbanDragOverlay({ activeTask }: KanbanDragOverlayProps) {
	if (!activeTask) return null;

	return (
		<div className="fixed pointer-events-none z-50">
			<TaskCardContent task={activeTask} isDragOverlay />
		</div>
	);
}
