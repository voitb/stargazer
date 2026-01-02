import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MoveTaskInput, Task } from "@/schemas/task";
import { moveTask } from "@/server/tasks";
import {
	type BoardMutationContext,
	createBoardMutationCallbacks,
} from "./board-mutation-utils";

export function useMoveTask() {
	const queryClient = useQueryClient();

	return useMutation<Task, Error, MoveTaskInput, BoardMutationContext>({
		mutationFn: (input: MoveTaskInput) => moveTask({ data: input }),
		...createBoardMutationCallbacks(queryClient, (board, input) => {
			let movedTask: Task | undefined;
			for (const col of board.columns) {
				movedTask = col.tasks.find((t) => t.id === input.taskId);
				if (movedTask) break;
			}

			if (!movedTask) return board;

			const updatedTask: Task = {
				...movedTask,
				metadata: {
					...movedTask.metadata,
					status: input.newStatus,
					order: input.newOrder,
				},
			};

			return {
				...board,
				columns: board.columns.map((col) => {
					const filteredTasks = col.tasks.filter((t) => t.id !== input.taskId);

					if (col.id === input.newStatus) {
						const tasksWithNew = [...filteredTasks, updatedTask];
						tasksWithNew.sort((a, b) => a.metadata.order - b.metadata.order);
						return { ...col, tasks: tasksWithNew };
					}

					return { ...col, tasks: filteredTasks };
				}),
			};
		}),
	});
}
