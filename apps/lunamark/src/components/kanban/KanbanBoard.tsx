import { useState } from 'react'
import { DragDropProvider, DragOverlay } from '@dnd-kit/react'
import { PointerSensor, KeyboardSensor, PointerActivationConstraints } from '@dnd-kit/dom'
import { closestCorners } from '@dnd-kit/collision'

import type { Board, Task, TaskStatus } from '@/schemas/task'
import { useBoardState } from '@/hooks/kanban/useBoardState'
import { useDragHandlers } from '@/hooks/kanban/useDragHandlers'
import { useMoveTask } from '@/hooks/useTasks'
import { buildColumns } from '@/lib/dnd/utils'

import { Column } from './Column'
import { TaskCardContent } from './TaskCardContent'
import { TaskEditor } from '@/components/task-editor/TaskEditor'

/**
 * Configured sensors with activation constraints
 * - distance: 8px movement required before drag starts (prevents accidental drags)
 * - KeyboardSensor for accessibility
 *
 * Note: @dnd-kit v0.2 requires constraints as an array of constraint objects
 */
const sensors = [
  PointerSensor.configure({
    activationConstraints: [
      new PointerActivationConstraints.Distance({ value: 8 }),
    ],
  }),
  KeyboardSensor,
]

interface KanbanBoardProps {
  initialBoard: Board
}

/**
 * Main Kanban board component with drag-and-drop functionality
 *
 * Uses @dnd-kit for accessible drag-and-drop between columns.
 * Persists drag operations to markdown files via server functions.
 */
export function KanbanBoard({ initialBoard }: KanbanBoardProps) {
  // Active task for DragOverlay
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  // Task editor modal state
  const [editorState, setEditorState] = useState<{
    isOpen: boolean
    task?: Task
    initialStatus?: TaskStatus
  }>({ isOpen: false })

  // Board state management (extracted hook)
  const { items, setItems, tasksMap, setTasksMap } = useBoardState(initialBoard)

  // Move task mutation for persistence
  const { mutate: moveTask } = useMoveTask()

  // Drag-and-drop handlers (extracted hook)
  const { handleDragStart, handleDragOver, handleDragEnd } = useDragHandlers({
    items,
    setItems,
    tasksMap,
    setTasksMap,
    moveTask,
    setActiveTask,
  })

  // Build columns with current task order
  const columns = buildColumns(initialBoard.columns, items, tasksMap)

  // Callbacks for opening the editor
  function handleOpenCreate(status: TaskStatus) {
    setEditorState({ isOpen: true, initialStatus: status })
  }

  function handleOpenEdit(task: Task) {
    setEditorState({ isOpen: true, task })
  }

  function handleCloseEditor() {
    setEditorState({ isOpen: false })
  }

  return (
    <>
      <DragDropProvider
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 p-6 overflow-x-auto min-h-screen bg-gray-100">
          {columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              onAddTask={() => handleOpenCreate(column.id)}
              onEditTask={handleOpenEdit}
            />
          ))}
        </div>
        {/* Built-in DragOverlay handles cursor tracking automatically */}
        <DragOverlay>
          {activeTask && <TaskCardContent task={activeTask} isDragOverlay />}
        </DragOverlay>
      </DragDropProvider>

      <TaskEditor
        isOpen={editorState.isOpen}
        task={editorState.task}
        initialStatus={editorState.initialStatus}
        onClose={handleCloseEditor}
      />
    </>
  )
}
