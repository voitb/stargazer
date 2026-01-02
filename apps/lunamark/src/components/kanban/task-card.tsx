import { useSortable } from "@dnd-kit/react/sortable";
import { cn } from "@/lib/utils/cn";
import type { Task } from "@/schemas/task";
import { DropIndicator } from "./drop-indicator";
import { TaskCardContent } from "./task-card-content";

interface TaskCardProps {
	task: Task;
	column: string;
	index: number;
	isLast?: boolean;
	onClick?: () => void;
}

export function TaskCard({
	task,
	column,
	index,
	isLast,
	onClick,
}: TaskCardProps) {
	const { ref, isDragging, isDropTarget } = useSortable({
		id: task.id,
		index,
		group: column,
		type: "item",
		accept: ["item"],
		data: { task, column },
	});

	return (
		<div ref={ref}>
			<DropIndicator isVisible={isDropTarget} />
			<TaskCardContent
				task={task}
				onClick={onClick}
				className={cn(
					isDragging && "opacity-50 shadow-lg ring-2 ring-blue-400",
				)}
			/>
			{isLast && <DropIndicator isVisible={isDropTarget && !isDragging} />}
		</div>
	);
}
