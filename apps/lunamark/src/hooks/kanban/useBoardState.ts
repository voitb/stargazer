import { useState, useEffect } from 'react'
import type { Board, Task, TaskStatus } from '@/schemas/task'
import { buildItemsFromBoard, buildTasksMapFromBoard } from '@/lib/dnd/utils'

/**
 * Hook to manage Kanban board state for drag-and-drop
 *
 * Maintains:
 * - items: Map of status -> task IDs for DnD ordering
 * - tasksMap: Map of task ID -> Task for quick lookup
 *
 * Automatically syncs with initialBoard when it changes
 */
export function useBoardState(initialBoard: Board) {
  const [items, setItems] = useState<Record<TaskStatus, string[]>>(() =>
    buildItemsFromBoard(initialBoard)
  )
  const [tasksMap, setTasksMap] = useState<Map<string, Task>>(() =>
    buildTasksMapFromBoard(initialBoard)
  )

  // Sync with initialBoard changes (e.g., after server refetch)
  useEffect(() => {
    setItems(buildItemsFromBoard(initialBoard))
    setTasksMap(buildTasksMapFromBoard(initialBoard))
  }, [initialBoard])

  return { items, setItems, tasksMap, setTasksMap }
}
