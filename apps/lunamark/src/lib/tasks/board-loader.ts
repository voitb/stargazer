import * as fs from "node:fs";
import * as path from "node:path";
import {
	type Board,
	type Column,
	type ColumnConfig,
	DEFAULT_COLUMNS,
	type Task,
	type TaskStatus,
} from "@/schemas/task";
import { parseTask } from "./task-parser";

export interface LoadBoardOptions {
	tasksDir: string;
	columns?: ColumnConfig[];
}

export async function loadBoard(options: LoadBoardOptions): Promise<Board> {
	const { tasksDir, columns: columnConfig = DEFAULT_COLUMNS } = options;

	if (!fs.existsSync(tasksDir)) {
		await fs.promises.mkdir(tasksDir, { recursive: true });
	}

	const files = await fs.promises.readdir(tasksDir);
	const mdFiles = files.filter((f) => f.endsWith(".md"));
	const tasks: Task[] = [];

	for (const file of mdFiles) {
		const filePath = path.join(tasksDir, file);
		const content = await fs.promises.readFile(filePath, "utf-8");
		const result = parseTask(filePath, content);

		if (result.ok) {
			tasks.push(result.data);
		} else {
			console.warn(`[Lunamark] ${result.error}`);
		}
	}

	const tasksByStatus = groupTasksByStatus(tasks);
	const columns: Column[] = columnConfig.map((config) => ({
		...config,
		tasks: sortTasksByOrder(tasksByStatus.get(config.id) || []),
	}));

	return {
		columns,
		tasksDir,
		lastUpdated: new Date().toISOString(),
	};
}

function groupTasksByStatus(tasks: Task[]): Map<TaskStatus, Task[]> {
	const grouped = new Map<TaskStatus, Task[]>();

	for (const task of tasks) {
		const status = task.metadata.status;
		const existing = grouped.get(status) || [];
		grouped.set(status, [...existing, task]);
	}

	return grouped;
}

function sortTasksByOrder(tasks: Task[]): Task[] {
	return [...tasks].sort((a, b) => a.metadata.order - b.metadata.order);
}

export async function loadTaskById(
	tasksDir: string,
	taskId: string,
): Promise<Task | null> {
	const files = await fs.promises.readdir(tasksDir);
	const mdFiles = files.filter((f) => f.endsWith(".md"));

	for (const file of mdFiles) {
		const filePath = path.join(tasksDir, file);
		const content = await fs.promises.readFile(filePath, "utf-8");
		const result = parseTask(filePath, content);

		if (result.ok && result.data.id === taskId) {
			return result.data;
		}
	}

	return null;
}

export async function findTaskFilePath(
	tasksDir: string,
	taskId: string,
): Promise<string | null> {
	const task = await loadTaskById(tasksDir, taskId);
	return task?.filePath || null;
}
