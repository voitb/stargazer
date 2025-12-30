import * as fs from 'node:fs'
import * as path from 'node:path'
import { parseTask } from './task-parser'
import {
  DEFAULT_COLUMNS,
  type Board,
  type Column,
  type Task,
  type TaskStatus,
} from './schemas/task'

/**
 * Load all tasks from a directory and organize them into a Board
 *
 * @param tasksDir - Absolute path to the tasks directory
 * @returns Board with tasks organized by column
 *
 * @example
 * ```ts
 * const board = await loadBoard('/path/to/tasks')
 * console.log(board.columns[0].tasks.length)
 * ```
 */
export async function loadBoard(tasksDir: string): Promise<Board> {
  // Ensure directory exists
  if (!fs.existsSync(tasksDir)) {
    await fs.promises.mkdir(tasksDir, { recursive: true })
  }

  // Read all .md files from the directory
  const files = await fs.promises.readdir(tasksDir)
  const mdFiles = files.filter((f) => f.endsWith('.md'))

  // Parse each file into a Task
  const tasks: Task[] = []
  const errors: string[] = []

  for (const file of mdFiles) {
    const filePath = path.join(tasksDir, file)
    const content = await fs.promises.readFile(filePath, 'utf-8')
    const result = parseTask(filePath, content)

    if (result.ok) {
      tasks.push(result.data)
    } else {
      errors.push(result.error)
      console.warn(`[Lunamark] ${result.error}`)
    }
  }

  // Group tasks by status column
  const tasksByStatus = groupTasksByStatus(tasks)

  // Build columns with tasks
  const columns: Column[] = DEFAULT_COLUMNS.map((config) => ({
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

/**
 * Get the tasks directory path from environment or default
 *
 * Uses import.meta.dirname to resolve relative to the source file location,
 * not process.cwd() which can vary based on where the command was run from.
 */
export function getTasksDir(): string {
  // Check environment variable first
  const envDir = process.env.LUNAMARK_TASKS_DIR

  if (envDir) {
    return path.isAbsolute(envDir) ? envDir : path.resolve(process.cwd(), envDir)
  }

  // Resolve relative to the app's root (2 levels up from src/lib/)
  const appRoot = path.resolve(import.meta.dirname, '..', '..')
  return path.resolve(appRoot, 'tasks')
}
