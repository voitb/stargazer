import { createServerFn } from '@tanstack/react-start'
import { loadBoard } from '../lib/board-loader'
import { resolveConfigSync, getTasksDir, getColumns } from '../lib/config'
import type { Board } from '@/schemas/task'

/**
 * Server function to get the Kanban board with all tasks
 *
 * This function runs only on the server and has access to the file system.
 * It reads all markdown files from the tasks directory and returns them
 * organized by column.
 *
 * Configuration is loaded from:
 * 1. Environment variables (LUNAMARK_TASKS_DIR)
 * 2. lunamark.config.ts file
 * 3. Default values
 *
 * @example
 * ```tsx
 * // In a component or route loader
 * const board = await getBoard()
 * ```
 */
export const getBoard = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Board> => {
    // Resolve configuration (finds config file, applies env vars)
    const config = resolveConfigSync()

    // Get resolved paths from config
    const tasksDir = getTasksDir(config)
    const columns = getColumns(config)

    return loadBoard({ tasksDir, columns })
  }
)
