import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Task, UpdateTaskInput } from "@/schemas/task";
import { updateTask } from "@/server/tasks";
import {
	type BoardMutationContext,
	createBoardMutationCallbacks,
} from "./board-mutation-utils";

export function useUpdateTask() {
	const queryClient = useQueryClient();

	return useMutation<Task, Error, UpdateTaskInput, BoardMutationContext>({
		mutationFn: (input: UpdateTaskInput) => updateTask({ data: input }),
		...createBoardMutationCallbacks(queryClient, (board, input) => ({
			...board,
			columns: board.columns.map((col) => ({
				...col,
				tasks: col.tasks.map((task) =>
					task.id === input.id
						? {
								...task,
								metadata: { ...task.metadata, ...input },
								content: input.content ?? task.content,
							}
						: task,
				),
			})),
		})),
	});
}
