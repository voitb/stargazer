import {
	KeyboardSensor,
	PointerActivationConstraints,
	PointerSensor,
} from "@dnd-kit/dom";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { useMemo } from "react";
import { TaskPreviewDialog } from "@/components/task-preview-dialog";
import { useBoardFilters } from "@/hooks/kanban/use-board-filters";
import { useBoardState } from "@/hooks/kanban/use-board-state";
import { useKanbanDrag } from "@/hooks/kanban/use-kanban-drag";
import type { useTaskEditor } from "@/hooks/task-editor/use-task-editor";
import { useMoveTask } from "@/hooks/tasks";
import { buildColumns } from "@/lib/dnd/utils";
import type { Board, Column as ColumnType, Task } from "@/schemas/task";
import { BoardFilters } from "./board-filters";
import { KanbanColumn } from "./column";
import { TaskCardContent } from "./task-card-content";

const sensors = [
	PointerSensor.configure({
		activationConstraints: [
			new PointerActivationConstraints.Distance({ value: 8 }),
		],
	}),
	KeyboardSensor,
];

interface KanbanBoardProps {
	initialBoard: Board;
	taskEditor: ReturnType<typeof useTaskEditor>;
}

function filterTasks(tasks: Task[], filters: ReturnType<typeof useBoardFilters>["filters"]): Task[] {
	return tasks.filter((task) => {
		if (filters.assignee && task.metadata.assignee !== filters.assignee) {
			return false;
		}
		if (filters.priority && task.metadata.priority !== filters.priority) {
			return false;
		}
		if (
			filters.labels.length > 0 &&
			!filters.labels.some((l) => task.metadata.labels.includes(l))
		) {
			return false;
		}
		return true;
	});
}

function applyFiltersToColumns(
	columns: ColumnType[],
	filters: ReturnType<typeof useBoardFilters>["filters"],
): ColumnType[] {
	return columns.map((column) => ({
		...column,
		tasks: filterTasks(column.tasks, filters),
	}));
}

export function KanbanBoard({ initialBoard, taskEditor }: KanbanBoardProps) {
	const {
		filters,
		hasActiveFilters,
		setAssignee,
		setPriority,
		toggleLabel,
		clearFilters,
	} = useBoardFilters();

	const { items, setItems, tasksMap, setTasksMap } =
		useBoardState(initialBoard);
	const { mutate: moveTask } = useMoveTask();
	const { handleDragStart, handleDragOver, handleDragEnd, activeTask } =
		useKanbanDrag({
			items,
			tasksMap,
			onItemsChange: setItems,
			onTasksMapChange: setTasksMap,
			onTaskMove: moveTask,
		});

	const allTasks = useMemo(
		() => initialBoard.columns.flatMap((c) => c.tasks),
		[initialBoard],
	);

	const uniqueAssignees = useMemo(() => {
		const map = new Map<string, { name: string; avatarUrl?: string | null }>();
		for (const task of allTasks) {
			if (task.metadata.assignee && !map.has(task.metadata.assignee)) {
				map.set(task.metadata.assignee, {
					name: task.metadata.assignee,
					avatarUrl: task.metadata.avatarUrl,
				});
			}
		}
		return Array.from(map.values());
	}, [allTasks]);

	const uniqueLabels = useMemo(() => {
		const labels = new Set<string>();
		for (const task of allTasks) {
			for (const label of task.metadata.labels) {
				labels.add(label);
			}
		}
		return Array.from(labels).sort();
	}, [allTasks]);

	const unfilteredColumns = buildColumns(initialBoard.columns, items, tasksMap);
	const columns = applyFiltersToColumns(unfilteredColumns, filters);

	return (
		<>
			{/* Sticky filter bar - flex-shrink-0 prevents collapse */}
			<div className="flex-shrink-0">
				<BoardFilters
					assignees={uniqueAssignees}
					labels={uniqueLabels}
					filters={filters}
					hasActiveFilters={hasActiveFilters}
					onAssigneeChange={setAssignee}
					onPriorityChange={setPriority}
					onLabelToggle={toggleLabel}
					onClearFilters={clearFilters}
				/>
			</div>

			{/* Scrollable columns area - fills remaining space */}
			<DragDropProvider
				sensors={sensors}
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDragEnd={handleDragEnd}
			>
				<div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden scrollbar-thin">
					<div className="flex gap-4 p-6 h-full">
						{columns.map((column) => (
							<KanbanColumn
								key={column.id}
								column={column}
								onEditTask={taskEditor.openEdit}
							/>
						))}
					</div>
				</div>
				<DragOverlay>
					{activeTask && <TaskCardContent task={activeTask} isDragOverlay />}
				</DragOverlay>
			</DragDropProvider>

			<TaskPreviewDialog
				key={taskEditor.task?.id ?? `create-${taskEditor.initialStatus}`}
				isOpen={taskEditor.isOpen}
				task={taskEditor.task}
				initialStatus={taskEditor.initialStatus}
				onClose={taskEditor.close}
			/>
		</>
	);
}
