import { useRef } from 'react'
import { move } from '@dnd-kit/helpers'
import type { Task, TaskStatus, MoveTaskInput } from '@/schemas/task'
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

export function useDragHandlers({
  items,
  setItems,
  tasksMap,
  setTasksMap,
  moveTask,
  setActiveTask,
}: UseDragHandlersParams) {
  const currentItems = useRef<Record<TaskStatus, string[]>>(items)
  const dragStartItems = useRef<Record<TaskStatus, string[]>>(items)

  function handleDragStart(event: Parameters<typeof move>[1]) {
    const { source } = event.operation

    dragStartItems.current = { ...items }
    currentItems.current = { ...items }

    if (source?.type === 'item') {
      const task = tasksMap.get(source.id as string)
      setActiveTask(task ?? null)
    }
  }

  function handleDragOver(event: Parameters<typeof move>[1]) {
    const { source } = event.operation
    if (source?.type === 'column') return

    setItems((current) => {
      const next = move(current, event)
      currentItems.current = next
      return next
    })
  }

  function handleDragEnd(event: Parameters<typeof move>[1]) {
    const { source } = event.operation

    if (source?.type === 'column' || !source) {
      setActiveTask(null)
      return
    }

    const taskId = source.id as string

    if ('canceled' in event && event.canceled) {
      setItems(dragStartItems.current)
      setActiveTask(null)
      return
    }

    const finalItems = currentItems.current

    const newStatus = findTaskColumn(finalItems, taskId)
    if (!newStatus) {
      setItems(dragStartItems.current)
      setActiveTask(null)
      return
    }

    const columnItems = finalItems[newStatus]
    const taskIndex = columnItems.indexOf(taskId)
    const prevTaskId = columnItems[taskIndex - 1]
    const nextTaskId = columnItems[taskIndex + 1]

    const prevOrder = prevTaskId ? tasksMap.get(prevTaskId)?.metadata.order : undefined
    const nextOrder = nextTaskId ? tasksMap.get(nextTaskId)?.metadata.order : undefined
    const newOrder = calculateNewOrder(prevOrder, nextOrder)

    moveTask({ taskId, newStatus, newOrder })

    setTasksMap((prev) => {
      const task = prev.get(taskId)
      if (!task) return prev

      const updated = new Map(prev)
      updated.set(taskId, {
        ...task,
        metadata: { ...task.metadata, status: newStatus, order: newOrder },
      })
      return updated
    })

    setActiveTask(null)
  }

  return { handleDragStart, handleDragOver, handleDragEnd }
}
