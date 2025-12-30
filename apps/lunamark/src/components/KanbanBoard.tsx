import { useState } from 'react'
import { DragDropProvider } from '@dnd-kit/react'
import { move } from '@dnd-kit/helpers'
import type { Board, Task, TaskStatus } from '../lib/schemas/task'
import { Column } from './Column'

interface KanbanBoardProps {
  initialBoard: Board
}

/**
 * Main Kanban board component with drag-and-drop functionality
 *
 * Uses @dnd-kit for accessible drag-and-drop between columns.
 * Currently read-only - drag state is local only.
 * Phase 2 will add server persistence.
 */
export function KanbanBoard({ initialBoard }: KanbanBoardProps) {
  // Local state for optimistic UI updates
  // In Phase 2, this will sync with server via mutations
  const [items, setItems] = useState<Record<TaskStatus, string[]>>(() => {
    const initial: Record<TaskStatus, string[]> = {
      todo: [],
      'in-progress': [],
      review: [],
      done: [],
    }
    for (const column of initialBoard.columns) {
      initial[column.id] = column.tasks.map((t) => t.id)
    }
    return initial
  })

  // Map of task ID to Task object for quick lookup
  const [tasksMap] = useState<Map<string, Task>>(() => {
    const map = new Map<string, Task>()
    for (const column of initialBoard.columns) {
      for (const task of column.tasks) {
        map.set(task.id, task)
      }
    }
    return map
  })

  // Handle drag-and-drop between columns
  const handleDragOver = (event: Parameters<typeof move>[1]) => {
    const { source } = event.operation

    // Only handle item drags, not column drags
    if (source?.type === 'column') return

    setItems((current) => move(current, event))
  }

  // Build columns with current task order
  const columns = initialBoard.columns.map((col) => ({
    ...col,
    tasks: items[col.id]
      .map((id) => tasksMap.get(id))
      .filter((t): t is Task => t !== undefined),
  }))

  return (
    <DragDropProvider onDragOver={handleDragOver}>
      <div className="flex gap-4 p-6 overflow-x-auto min-h-screen bg-gray-100">
        {columns.map((column) => (
          <Column key={column.id} column={column} />
        ))}
      </div>
    </DragDropProvider>
  )
}
