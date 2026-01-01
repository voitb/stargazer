import { move } from '@dnd-kit/helpers'
import type { Task, TaskStatus } from '@/schemas/task'
import type { MoveTaskInput } from '@/schemas/task'
import { findTaskColumn } from '@/lib/dnd/utils'
import { calculateNewOrder } from '@/lib/kanban/task-ordering'

interface UseDragHandlersParams {
  items: Record<TaskStatus, string[]>
  setItems: React.Dispatch<React.SetStateAction<Record<TaskStatus, string[]>>>
  tasksMap: Map<string, Task>
  setTasksMap: React.Dispatch<React.SetStateAction<Map<string, Task>>>
  moveTask: (input: MoveTaskInput) => void
  setActiveTask: (task: Task | null) => void
}

/**
 * Hook that provides drag-and-drop event handlers for the Kanban board
 *
 * Handles:
 * - dragStart: Sets active task for DragOverlay
 * - dragOver: Updates local items state for visual reordering
 * - dragEnd: Persists changes to server and clears active task
 */
export function useDragHandlers({
  items,
  setItems,
  tasksMap,
  setTasksMap,
  moveTask,
  setActiveTask,
}: UseDragHandlersParams) {

  function handleDragStart(event: Parameters<typeof move>[1]) {
    const { source } = event.operation
    if (source?.type === 'item') {
      const task = tasksMap.get(source.id as string)
      setActiveTask(task ?? null)
    }
  }

  function handleDragOver(event: Parameters<typeof move>[1]) {
    const { source } = event.operation

    // Only handle item drags, not column drags
    if (source?.type === 'column') return

    setItems((current) => move(current, event))
  }

  function handleDragEnd(event: Parameters<typeof move>[1]) {
    const { source } = event.operation

    // Only handle item drags
    if (source?.type === 'column' || !source) {
      setActiveTask(null)
      return
    }

    const taskId = source.id as string

    // Find which column the task is now in from the updated items state
    const newStatus = findTaskColumn(items, taskId)
    if (!newStatus) {
      setActiveTask(null)
      return
    }

    // Calculate new order based on position in the column
    const columnItems = items[newStatus] || []
    const taskIndex = columnItems.indexOf(taskId)
    const newOrder = calculateNewOrder(taskIndex)

    // Persist to server
    moveTask({
      taskId,
      newStatus,
      newOrder,
    })

    // Update local tasksMap with new status/order
    setTasksMap((prev) => {
      const task = prev.get(taskId)
      if (!task) return prev

      const updated = new Map(prev)
      updated.set(taskId, {
        ...task,
        metadata: {
          ...task.metadata,
          status: newStatus,
          order: newOrder,
        },
      })
      return updated
    })

    setActiveTask(null)
  }

  return { handleDragStart, handleDragOver, handleDragEnd }
}
