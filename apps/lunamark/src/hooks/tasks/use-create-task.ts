import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateTaskInput, Task } from "@/schemas/task";
import { createTask } from "@/server/tasks";
import {
	type BoardMutationContext,
	createBoardMutationCallbacks,
	generateTempId,
} from "./board-mutation-utils";

export function useCreateTask() {
	const queryClient = useQueryClient();

	return useMutation<Task, Error, CreateTaskInput, BoardMutationContext>({
		mutationFn: (input: CreateTaskInput) => createTask({ data: input }),
		...createBoardMutationCallbacks(queryClient, (board, input) => ({
			...board,
			columns: board.columns.map((col) =>
				col.id === (input.status ?? "todo")
					? { ...col, tasks: [createOptimisticTask(input), ...col.tasks] }
					: col,
			),
		})),
	});
}

function createOptimisticTask(input: CreateTaskInput): Task {
	const tempId = generateTempId();
	return {
		id: tempId,
		filePath: "",
		metadata: {
			id: tempId,
			title: input.title,
			status: input.status ?? "todo",
			priority: input.priority ?? "medium",
			labels: input.labels ?? [],
			assignee: input.assignee ?? null,
			created: new Date().toISOString().split("T")[0],
			due: input.due ?? null,
			order: 0,
		},
		content: input.content ?? "",
	};
}
