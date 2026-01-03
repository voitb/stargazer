import {
	KeyboardSensor,
	PointerActivationConstraints,
	PointerSensor,
} from "@dnd-kit/dom";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { useMemo } from "react";
import { TaskEditor } from "@/components/task-editor/task-editor";
import { useBoardFilters } from "@/hooks/kanban/use-board-filters";
import { useBoardState } from "@/hooks/kanban/use-board-state";
import { useKanbanDrag } from "@/hooks/kanban/use-kanban-drag";
import { useTaskEditor } from "@/hooks/task-editor/use-task-editor";
import { useMoveTask } from "@/hooks/tasks";
import { buildColumns } from "@/lib/dnd/utils";
import type { Board, Column as ColumnType, Task } from "@/schemas/task";
import { BoardFilters } from "./board-filters";
import { Column } from "./column";
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

export function KanbanBoard({ initialBoard }: KanbanBoardProps) {
	const taskEditor = useTaskEditor();
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

			<DragDropProvider
				sensors={sensors}
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDragEnd={handleDragEnd}
			>
				<div className="flex gap-4 p-6 overflow-x-auto min-h-screen bg-gray-100">
					{columns.map((column) => (
						<Column
							key={column.id}
							column={column}
							onAddTask={() => taskEditor.openCreate(column.id)}
							onEditTask={taskEditor.openEdit}
						/>
					))}
				</div>
				<DragOverlay>
					{activeTask && <TaskCardContent task={activeTask} isDragOverlay />}
				</DragOverlay>
			</DragDropProvider>

			<TaskEditor
				key={taskEditor.task?.id ?? `create-${taskEditor.initialStatus}`}
				isOpen={taskEditor.isOpen}
				task={taskEditor.task}
				initialStatus={taskEditor.initialStatus}
				onClose={taskEditor.close}
			/>
		</>
	);
}
