import { move } from "@dnd-kit/helpers";
import { useRef, useState } from "react";
import type {
	DragEndEvent,
	DragHandlers,
	DragOverEvent,
	DragStartEvent,
} from "@/lib/dnd/types";
import { findTaskColumn } from "@/lib/dnd/utils";
import { calculateNewOrder } from "@/lib/tasks/task-ordering";
import type { MoveTaskInput, Task, TaskStatus } from "@/schemas/task";

interface UseKanbanDragParams {
	items: Record<TaskStatus, string[]>;
	tasksMap: Map<string, Task>;
	onItemsChange: (items: Record<TaskStatus, string[]>) => void;
	onTasksMapChange: (updater: (prev: Map<string, Task>) => Map<string, Task>) => void;
	onTaskMove: (input: MoveTaskInput) => void;
}

interface UseKanbanDragReturn extends DragHandlers {
	activeTask: Task | null;
}

export function useKanbanDrag({
	items,
	tasksMap,
	onItemsChange,
	onTasksMapChange,
	onTaskMove,
}: UseKanbanDragParams): UseKanbanDragReturn {
	const [activeTask, setActiveTask] = useState<Task | null>(null);
	const currentItems = useRef<Record<TaskStatus, string[]>>(items);
	const dragStartItems = useRef<Record<TaskStatus, string[]>>(items);

	function handleDragStart(event: DragStartEvent) {
		const { source } = event.operation;

		dragStartItems.current = { ...items };
		currentItems.current = { ...items };

		if (source?.type === "item") {
			const task = tasksMap.get(source.id as string);
			setActiveTask(task ?? null);
		}
	}

	function handleDragOver(event: DragOverEvent) {
		const { source } = event.operation;
		if (source?.type === "column") return;

		const next = move(currentItems.current, event);
		currentItems.current = next;
		onItemsChange(next);
	}

	function handleDragEnd(event: DragEndEvent) {
		const { source } = event.operation;

		if (source?.type === "column" || !source) {
			setActiveTask(null);
			return;
		}

		const taskId = source.id as string;

		if (event.canceled) {
			onItemsChange(dragStartItems.current);
			setActiveTask(null);
			return;
		}

		const finalItems = currentItems.current;

		const newStatus = findTaskColumn(finalItems, taskId);
		if (!newStatus) {
			onItemsChange(dragStartItems.current);
			setActiveTask(null);
			return;
		}

		const columnItems = finalItems[newStatus];
		const taskIndex = columnItems.indexOf(taskId);
		const prevTaskId = columnItems[taskIndex - 1];
		const nextTaskId = columnItems[taskIndex + 1];

		const prevOrder = prevTaskId
			? tasksMap.get(prevTaskId)?.metadata.order
			: undefined;
		const nextOrder = nextTaskId
			? tasksMap.get(nextTaskId)?.metadata.order
			: undefined;
		const newOrder = calculateNewOrder(prevOrder, nextOrder);

		onTaskMove({ taskId, newStatus, newOrder });

		onTasksMapChange((prev) => {
			const task = prev.get(taskId);
			if (!task) return prev;

			const updated = new Map(prev);
			updated.set(taskId, {
				...task,
				metadata: { ...task.metadata, status: newStatus, order: newOrder },
			});
			return updated;
		});

		setActiveTask(null);
	}

	return { handleDragStart, handleDragOver, handleDragEnd, activeTask };
}
