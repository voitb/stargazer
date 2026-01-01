import type { Board, Task, TaskStatus, Column } from '@/schemas/task'

/**
 * Build items map from board data
 * Maps TaskStatus to array of task IDs for DnD ordering
 */
export function buildItemsFromBoard(board: Board): Record<TaskStatus, string[]> {
  const items: Record<TaskStatus, string[]> = {
    'todo': [],
    'in-progress': [],
    'review': [],
    'done': [],
  }
  for (const column of board.columns) {
    items[column.id] = column.tasks.map((t) => t.id)
  }
  return items
}

/**
 * Build tasks map from board data
 * Maps task ID to Task object for quick lookup
 */
export function buildTasksMapFromBoard(board: Board): Map<string, Task> {
  const map = new Map<string, Task>()
  for (const column of board.columns) {
    for (const task of column.tasks) {
      map.set(task.id, task)
    }
  }
  return map
}

/**
 * Find which column a task belongs to
 */
export function findTaskColumn(
  items: Record<TaskStatus, string[]>,
  taskId: string
): TaskStatus | undefined {
  for (const [status, taskIds] of Object.entries(items)) {
    if (taskIds.includes(taskId)) {
      return status as TaskStatus
    }
  }
  return undefined
}

/**
 * Build columns array with current task order from items state
 */
export function buildColumns(
  columns: Column[],
  items: Record<TaskStatus, string[]>,
  tasksMap: Map<string, Task>
): Column[] {
  return columns.map((col) => ({
    ...col,
    tasks: items[col.id]
      .map((id) => tasksMap.get(id))
      .filter((t): t is Task => t !== undefined),
  }))
}
