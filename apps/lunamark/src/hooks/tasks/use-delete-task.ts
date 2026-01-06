import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTask } from "@/server/tasks";
import {
	type BoardMutationContext,
	createBoardMutationCallbacks,
} from "./board-mutation-utils";

export function useDeleteTask() {
	const queryClient = useQueryClient();

	return useMutation<
		{ success: boolean; taskId: string },
		Error,
		string,
		BoardMutationContext
	>({
		mutationFn: (taskId: string) => deleteTask({ data: { taskId } }),
		...createBoardMutationCallbacks(queryClient, (board, taskId) => ({
			...board,
			columns: board.columns.map((col) => ({
				...col,
				tasks: col.tasks.filter((task) => task.id !== taskId),
			})),
		})),
	});
}
