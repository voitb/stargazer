import { z } from 'zod'

/**
 * Helper to coerce Date objects to ISO date strings (YYYY-MM-DD)
 * gray-matter parses YAML dates like `2025-01-15` as Date objects
 */
const dateToString = z.preprocess((val) => {
  if (val instanceof Date) {
    return val.toISOString().split('T')[0]
  }
  return val
}, z.string())

/**
 * Task status values representing Kanban columns
 */
export const TaskStatusSchema = z.enum(['todo', 'in-progress', 'review', 'done'])
export type TaskStatus = z.infer<typeof TaskStatusSchema>

/**
 * Task priority levels
 */
export const TaskPrioritySchema = z.enum(['low', 'medium', 'high', 'critical'])
export type TaskPriority = z.infer<typeof TaskPrioritySchema>

/**
 * Task metadata from YAML frontmatter
 */
export const TaskMetadataSchema = z.object({
  id: z.string().min(1, 'Task ID is required'),
  title: z.string().min(1, 'Task title is required'),
  status: TaskStatusSchema,
  priority: TaskPrioritySchema.optional().default('medium'),
  labels: z
    .array(z.string())
    .optional()
    .nullable()
    .transform((val) => val ?? []),
  assignee: z.string().optional().nullable(),
  created: dateToString.optional().default(() => new Date().toISOString().split('T')[0]),
  due: dateToString.optional().nullable(),
  order: z.number().nonnegative().optional().default(0),
})
export type TaskMetadata = z.infer<typeof TaskMetadataSchema>

/**
 * Full task with metadata and markdown content
 */
export const TaskSchema = z.object({
  id: z.string(),
  filePath: z.string(),
  metadata: TaskMetadataSchema,
  content: z.string(),
})
export type Task = z.infer<typeof TaskSchema>

/**
 * Column configuration for the Kanban board
 */
export const ColumnConfigSchema = z.object({
  id: TaskStatusSchema,
  title: z.string(),
  color: z.string().optional(),
  limit: z.number().int().positive().optional(),
})
export type ColumnConfig = z.infer<typeof ColumnConfigSchema>

/**
 * Default column configuration
 */
export const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'todo', title: 'To Do', color: 'gray' },
  { id: 'in-progress', title: 'In Progress', color: 'blue' },
  { id: 'review', title: 'Review', color: 'yellow' },
  { id: 'done', title: 'Done', color: 'green' },
]

/**
 * Column with tasks for the board
 */
export const ColumnSchema = z.object({
  id: TaskStatusSchema,
  title: z.string(),
  color: z.string().optional(),
  limit: z.number().optional(),
  tasks: z.array(TaskSchema),
})
export type Column = z.infer<typeof ColumnSchema>

/**
 * Board state with all columns
 */
export const BoardSchema = z.object({
  columns: z.array(ColumnSchema),
  tasksDir: z.string(),
  lastUpdated: z.string(),
})
export type Board = z.infer<typeof BoardSchema>

/**
 * Input for creating a new task
 */
export const CreateTaskInputSchema = z.object({
  title: z.string().min(1),
  status: TaskStatusSchema.default('todo'),
  priority: TaskPrioritySchema.default('medium'),
  labels: z.array(z.string()).default([]),
  assignee: z.string().optional(),
  due: z.string().optional(),
  content: z.string().default(''),
})
export type CreateTaskInput = z.infer<typeof CreateTaskInputSchema>

/**
 * Input for updating a task
 */
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
})
export type UpdateTaskInput = z.infer<typeof UpdateTaskInputSchema>

/**
 * Input for moving a task between columns
 */
export const MoveTaskInputSchema = z.object({
  taskId: z.string(),
  newStatus: TaskStatusSchema,
  newOrder: z.number().nonnegative(),
})
export type MoveTaskInput = z.infer<typeof MoveTaskInputSchema>
