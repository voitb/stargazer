import * as fs from 'node:fs'
import * as path from 'node:path'
import { parseTask } from './task-parser'
import {
  DEFAULT_COLUMNS,
  type Board,
  type Column,
  type ColumnConfig,
  type Task,
  type TaskStatus,
} from '@/schemas/task'

/**
 * Options for loading the board
 */
export interface LoadBoardOptions {
  /** Absolute path to the tasks directory */
  tasksDir: string
  /** Custom column configuration (optional, defaults to DEFAULT_COLUMNS) */
  columns?: ColumnConfig[]
}

/**
 * Load all tasks from a directory and organize them into a Board
 *
 * @param options - Load options with tasksDir and optional columns
 * @returns Board with tasks organized by column
 *
 * @example
 * ```ts
 * // Basic usage
 * const board = await loadBoard({ tasksDir: '/path/to/tasks' })
 *
 * // With custom columns
 * const board = await loadBoard({
 *   tasksDir: '/path/to/tasks',
 *   columns: [{ id: 'todo', title: 'To Do', color: 'gray' }, ...]
 * })
 * ```
 */
export async function loadBoard(options: LoadBoardOptions): Promise<Board> {
  const { tasksDir, columns: columnConfig = DEFAULT_COLUMNS } = options

  // Ensure directory exists
  if (!fs.existsSync(tasksDir)) {
    await fs.promises.mkdir(tasksDir, { recursive: true })
  }

  // Read all .md files from the directory
  const files = await fs.promises.readdir(tasksDir)
  const mdFiles = files.filter((f) => f.endsWith('.md'))

  // Parse each file into a Task
  const tasks: Task[] = []

  for (const file of mdFiles) {
    const filePath = path.join(tasksDir, file)
    const content = await fs.promises.readFile(filePath, 'utf-8')
    const result = parseTask(filePath, content)

    if (result.ok) {
      tasks.push(result.data)
    } else {
      console.warn(`[Lunamark] ${result.error}`)
    }
  }

  // Group tasks by status column
  const tasksByStatus = groupTasksByStatus(tasks)

  // Build columns with tasks
  const columns: Column[] = columnConfig.map((config) => ({
    ...config,
    tasks: sortTasksByOrder(tasksByStatus.get(config.id) || []),
  }))

  return {
    columns,
    tasksDir,
    lastUpdated: new Date().toISOString(),
  }
}

/**
 * Group tasks by their status
 */
function groupTasksByStatus(tasks: Task[]): Map<TaskStatus, Task[]> {
  const grouped = new Map<TaskStatus, Task[]>()

  for (const task of tasks) {
    const status = task.metadata.status
    const existing = grouped.get(status) || []
    grouped.set(status, [...existing, task])
  }

  return grouped
}

/**
 * Sort tasks by their order field (ascending)
 */
function sortTasksByOrder(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => a.metadata.order - b.metadata.order)
}

/**
 * Load a single task by ID
 *
 * @param tasksDir - Absolute path to the tasks directory
 * @param taskId - ID of the task to load
 * @returns Task or null if not found
 */
export async function loadTaskById(
  tasksDir: string,
  taskId: string
): Promise<Task | null> {
  const files = await fs.promises.readdir(tasksDir)
  const mdFiles = files.filter((f) => f.endsWith('.md'))

  for (const file of mdFiles) {
    const filePath = path.join(tasksDir, file)
    const content = await fs.promises.readFile(filePath, 'utf-8')
    const result = parseTask(filePath, content)

    if (result.ok && result.data.id === taskId) {
      return result.data
    }
  }

  return null
}

/**
 * Find a task's file path by ID
 *
 * @param tasksDir - Absolute path to the tasks directory
 * @param taskId - ID of the task to find
 * @returns File path or null if not found
 */
export async function findTaskFilePath(
  tasksDir: string,
  taskId: string
): Promise<string | null> {
  const task = await loadTaskById(tasksDir, taskId)
  return task?.filePath || null
}

// Note: getTasksDir() has been moved to src/lib/config.ts
// Import from there: import { getTasksDir, resolveConfigSync } from './config'
