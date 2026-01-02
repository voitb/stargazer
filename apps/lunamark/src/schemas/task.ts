import { z } from "zod";

const dateToString = z.preprocess((val) => {
	if (val instanceof Date) {
		return val.toISOString().split("T")[0];
	}
	return val;
}, z.string());

export const TaskStatusSchema = z.enum([
	"todo",
	"in-progress",
	"review",
	"done",
]);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const TaskPrioritySchema = z.enum(["low", "medium", "high", "critical"]);
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;

export const TaskMetadataSchema = z.object({
	id: z.string().min(1, "Task ID is required"),
	title: z.string().min(1, "Task title is required"),
	status: TaskStatusSchema,
	priority: TaskPrioritySchema.optional().default("medium"),
	labels: z
		.array(z.string())
		.optional()
		.nullable()
		.transform((val) => val ?? []),
	assignee: z.string().optional().nullable(),
	created: dateToString
		.optional()
		.default(() => new Date().toISOString().split("T")[0]),
	due: dateToString.optional().nullable(),
	order: z.number().nonnegative().optional().default(0),
});
export type TaskMetadata = z.infer<typeof TaskMetadataSchema>;

export const TaskSchema = z.object({
	id: z.string(),
	filePath: z.string(),
	metadata: TaskMetadataSchema,
	content: z.string(),
});
export type Task = z.infer<typeof TaskSchema>;

export const ColumnConfigSchema = z.object({
	id: TaskStatusSchema,
	title: z.string(),
	color: z.string().optional(),
	limit: z.number().int().positive().optional(),
});
export type ColumnConfig = z.infer<typeof ColumnConfigSchema>;

export const DEFAULT_COLUMNS: ColumnConfig[] = [
	{ id: "todo", title: "To Do", color: "gray" },
	{ id: "in-progress", title: "In Progress", color: "blue" },
	{ id: "review", title: "Review", color: "yellow" },
	{ id: "done", title: "Done", color: "green" },
];

export const ColumnSchema = z.object({
	id: TaskStatusSchema,
	title: z.string(),
	color: z.string().optional(),
	limit: z.number().optional(),
	tasks: z.array(TaskSchema),
});
export type Column = z.infer<typeof ColumnSchema>;

export const BoardSchema = z.object({
	columns: z.array(ColumnSchema),
	tasksDir: z.string(),
	lastUpdated: z.string(),
});
export type Board = z.infer<typeof BoardSchema>;

export const CreateTaskInputSchema = z.object({
	title: z.string().min(1),
	status: TaskStatusSchema.default("todo"),
	priority: TaskPrioritySchema.default("medium"),
	labels: z.array(z.string()).default([]),
	assignee: z.string().optional(),
	due: z.string().optional(),
	content: z.string().default(""),
});
export type CreateTaskInput = z.infer<typeof CreateTaskInputSchema>;

export const UpdateTaskInputSchema = z.object({
	id: z.string(),
	title: z.string().optional(),
	status: TaskStatusSchema.optional(),
	priority: TaskPrioritySchema.optional(),
	labels: z.array(z.string()).optional(),
	assignee: z.string().nullable().optional(),
	due: z.string().nullable().optional(),
	order: z.number().optional(),
	content: z.string().optional(),
});
export type UpdateTaskInput = z.infer<typeof UpdateTaskInputSchema>;

export const MoveTaskInputSchema = z.object({
	taskId: z.string(),
	newStatus: TaskStatusSchema,
	newOrder: z.number().nonnegative(),
});
export type MoveTaskInput = z.infer<typeof MoveTaskInputSchema>;
