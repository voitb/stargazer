import { createServerFn } from '@tanstack/react-start'
import { loadBoard, getTasksDir } from '../lib/board-loader'
import type { Board } from '../lib/schemas/task'

/**
 * Server function to get the Kanban board with all tasks
 *
 * This function runs only on the server and has access to the file system.
 * It reads all markdown files from the tasks directory and returns them
 * organized by column.
 *
 * @example
 * ```tsx
 * // In a component or route loader
 * const board = await getBoard()
 * ```
 */
export const getBoard = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Board> => {
    const tasksDir = getTasksDir()
    return loadBoard(tasksDir)
  }
)
