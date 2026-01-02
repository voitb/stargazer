import * as fs from "node:fs";
import * as path from "node:path";
import { createServerFn } from "@tanstack/react-start";
import { nanoid } from "nanoid";
import { z } from "zod";
import {
	CreateTaskInputSchema,
	MoveTaskInputSchema,
	type Task,
	UpdateTaskInputSchema,
} from "@/schemas/task";
import { findTaskFilePath, loadTaskById } from "../lib/board-loader";
import { getTasksDir, resolveConfigSync } from "../lib/config";
import { generateFilename, serializeTask } from "../lib/task-parser";

export const createTask = createServerFn({ method: "POST" })
	.inputValidator((data: unknown) => CreateTaskInputSchema.parse(data))
	.handler(async ({ data }): Promise<Task> => {
		const config = resolveConfigSync();
		const tasksDir = getTasksDir(config);

		const id = `task-${nanoid(8)}`;
		const metadata = {
			id,
			title: data.title,
			status: data.status,
			priority: data.priority,
			labels: data.labels,
			assignee: data.assignee,
			created: new Date().toISOString().split("T")[0],
			due: data.due,
			order: 0,
		};

		const task: Task = {
			id,
			filePath: "",
			metadata,
			content: data.content,
		};

		const filename = generateFilename(id, data.title);
		const filePath = path.join(tasksDir, filename);
		task.filePath = filePath;

		const markdown = serializeTask(task);
		await fs.promises.writeFile(filePath, markdown, "utf-8");

		return task;
	});

export const updateTask = createServerFn({ method: "POST" })
	.inputValidator((data: unknown) => UpdateTaskInputSchema.parse(data))
	.handler(async ({ data }): Promise<Task> => {
		const config = resolveConfigSync();
		const tasksDir = getTasksDir(config);

		const existingTask = await loadTaskById(tasksDir, data.id);
		if (!existingTask) {
			throw new Error(`Task not found: ${data.id}`);
		}

		const updatedTask: Task = {
			...existingTask,
			metadata: {
				...existingTask.metadata,
				...(data.title !== undefined && { title: data.title }),
				...(data.status !== undefined && { status: data.status }),
				...(data.priority !== undefined && { priority: data.priority }),
				...(data.labels !== undefined && { labels: data.labels }),
				...(data.assignee !== undefined && { assignee: data.assignee }),
				...(data.due !== undefined && { due: data.due }),
				...(data.order !== undefined && { order: data.order }),
			},
			content: data.content !== undefined ? data.content : existingTask.content,
		};

		let filePath = existingTask.filePath;
		if (data.title && data.title !== existingTask.metadata.title) {
			const newFilename = generateFilename(data.id, data.title);
			const newFilePath = path.join(tasksDir, newFilename);

			if (newFilePath !== existingTask.filePath) {
				await fs.promises.unlink(existingTask.filePath);
				filePath = newFilePath;
			}
		}

		updatedTask.filePath = filePath;

		const markdown = serializeTask(updatedTask);
		await fs.promises.writeFile(filePath, markdown, "utf-8");

		return updatedTask;
	});

export const deleteTask = createServerFn({ method: "POST" })
	.inputValidator((data: unknown) =>
		z.object({ taskId: z.string() }).parse(data),
	)
	.handler(async ({ data }): Promise<{ success: boolean; taskId: string }> => {
		const config = resolveConfigSync();
		const tasksDir = getTasksDir(config);

		const filePath = await findTaskFilePath(tasksDir, data.taskId);
		if (!filePath) {
			throw new Error(`Task not found: ${data.taskId}`);
		}

		await fs.promises.unlink(filePath);

		return { success: true, taskId: data.taskId };
	});

export const moveTask = createServerFn({ method: "POST" })
	.inputValidator((data: unknown) => MoveTaskInputSchema.parse(data))
	.handler(async ({ data }): Promise<Task> => {
		const config = resolveConfigSync();
		const tasksDir = getTasksDir(config);

		const existingTask = await loadTaskById(tasksDir, data.taskId);
		if (!existingTask) {
			throw new Error(`Task not found: ${data.taskId}`);
		}

		const updatedTask: Task = {
			...existingTask,
			metadata: {
				...existingTask.metadata,
				status: data.newStatus,
				order: data.newOrder,
			},
		};

		const markdown = serializeTask(updatedTask);
		await fs.promises.writeFile(existingTask.filePath, markdown, "utf-8");

		return updatedTask;
	});
