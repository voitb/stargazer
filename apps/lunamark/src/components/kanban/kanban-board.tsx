import {
	KeyboardSensor,
	PointerActivationConstraints,
	PointerSensor,
} from "@dnd-kit/dom";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { TaskEditor } from "@/components/task-editor/task-editor";
import { useBoardState } from "@/hooks/kanban/use-board-state";
import { useKanbanDrag } from "@/hooks/kanban/use-kanban-drag";
import { useTaskEditor } from "@/hooks/task-editor/use-task-editor";
import { useMoveTask } from "@/hooks/tasks";
import { buildColumns } from "@/lib/dnd/utils";
import type { Board } from "@/schemas/task";
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

export function KanbanBoard({ initialBoard }: KanbanBoardProps) {
	const taskEditor = useTaskEditor();

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

	const columns = buildColumns(initialBoard.columns, items, tasksMap);

	return (
		<>
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
				isOpen={taskEditor.isOpen}
				task={taskEditor.task}
				initialStatus={taskEditor.initialStatus}
				onClose={taskEditor.close}
			/>
		</>
	);
}
