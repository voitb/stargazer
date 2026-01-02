import { createServerFn } from "@tanstack/react-start";
import type { Board } from "@/schemas/task";
import { loadBoard } from "../lib/board-loader";
import { getColumns, getTasksDir, resolveConfigSync } from "../lib/config";

export const getBoard = createServerFn({ method: "GET" }).handler(
	async (): Promise<Board> => {
		const config = resolveConfigSync();
		const tasksDir = getTasksDir(config);
		const columns = getColumns(config);

		return loadBoard({ tasksDir, columns });
	},
);
