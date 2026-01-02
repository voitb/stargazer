import { useEffect, useState } from "react";
import { buildItemsFromBoard, buildTasksMapFromBoard } from "@/lib/dnd/utils";
import type { Board, Task, TaskStatus } from "@/schemas/task";

export function useBoardState(initialBoard: Board) {
	const [items, setItems] = useState<Record<TaskStatus, string[]>>(() =>
		buildItemsFromBoard(initialBoard),
	);
	const [tasksMap, setTasksMap] = useState<Map<string, Task>>(() =>
		buildTasksMapFromBoard(initialBoard),
	);

	useEffect(() => {
		setItems(buildItemsFromBoard(initialBoard));
		setTasksMap(buildTasksMapFromBoard(initialBoard));
	}, [initialBoard]);

	return { items, setItems, tasksMap, setTasksMap };
}
