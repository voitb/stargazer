import {
	KeyboardSensor,
	PointerActivationConstraints,
	PointerSensor,
} from "@dnd-kit/dom";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { useState } from "react";
import { TaskEditor } from "@/components/task-editor/task-editor";
import { useBoardState } from "@/hooks/kanban/use-board-state";
import { useDragHandlers } from "@/hooks/kanban/use-drag-handlers";
import { useMoveTask } from "@/hooks/tasks";
import { buildColumns } from "@/lib/dnd/utils";
import type { Board, Task, TaskStatus } from "@/schemas/task";
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
	const [activeTask, setActiveTask] = useState<Task | null>(null);
	const [editorState, setEditorState] = useState<{
		isOpen: boolean;
		task?: Task;
		initialStatus?: TaskStatus;
	}>({ isOpen: false });

	const { items, setItems, tasksMap, setTasksMap } =
		useBoardState(initialBoard);
	const { mutate: moveTask } = useMoveTask();
	const { handleDragStart, handleDragOver, handleDragEnd } = useDragHandlers({
		items,
		setItems,
		tasksMap,
		setTasksMap,
		moveTask,
		setActiveTask,
	});

	const columns = buildColumns(initialBoard.columns, items, tasksMap);

	function handleOpenCreate(status: TaskStatus) {
		setEditorState({ isOpen: true, initialStatus: status });
	}

	function handleOpenEdit(task: Task) {
		setEditorState({ isOpen: true, task });
	}

	function handleCloseEditor() {
		setEditorState({ isOpen: false });
	}

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
							onAddTask={() => handleOpenCreate(column.id)}
							onEditTask={handleOpenEdit}
						/>
					))}
				</div>
				<DragOverlay>
					{activeTask && <TaskCardContent task={activeTask} isDragOverlay />}
				</DragOverlay>
			</DragDropProvider>

			<TaskEditor
				isOpen={editorState.isOpen}
				task={editorState.task}
				initialStatus={editorState.initialStatus}
				onClose={handleCloseEditor}
			/>
		</>
	);
}
