import type { Board, Column, Task, TaskStatus } from "@/schemas/task";

export function buildItemsFromBoard(
	board: Board,
): Record<TaskStatus, string[]> {
	const items: Record<TaskStatus, string[]> = {
		todo: [],
		"in-progress": [],
		review: [],
		done: [],
	};
	for (const column of board.columns) {
		items[column.id] = column.tasks.map((t) => t.id);
	}
	return items;
}

export function buildTasksMapFromBoard(board: Board): Map<string, Task> {
	const map = new Map<string, Task>();
	for (const column of board.columns) {
		for (const task of column.tasks) {
			map.set(task.id, task);
		}
	}
	return map;
}

export function findTaskColumn(
	items: Record<TaskStatus, string[]>,
	taskId: string,
): TaskStatus | undefined {
	for (const [status, taskIds] of Object.entries(items)) {
		if (taskIds.includes(taskId)) {
			return status as TaskStatus;
		}
	}
	return undefined;
}

export function buildColumns(
	columns: Column[],
	items: Record<TaskStatus, string[]>,
	tasksMap: Map<string, Task>,
): Column[] {
	return columns.map((col) => ({
		...col,
		tasks: items[col.id]
			.map((id) => tasksMap.get(id))
			.filter((t): t is Task => t !== undefined),
	}));
}
