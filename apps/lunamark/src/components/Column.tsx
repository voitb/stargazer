import { useDroppable } from '@dnd-kit/react'
import type { Column as ColumnType } from '../lib/schemas/task'
import { TaskCard } from './TaskCard'

interface ColumnProps {
  column: ColumnType
}

/**
 * Column header colors based on status
 */
const columnColors: Record<string, string> = {
  gray: 'bg-gray-500',
  blue: 'bg-blue-500',
  yellow: 'bg-yellow-500',
  green: 'bg-green-500',
}

/**
 * Droppable column container for the Kanban board
 */
export function Column({ column }: ColumnProps) {
  const { ref, isDropTarget } = useDroppable({
    id: column.id,
    type: 'column',
    accept: ['item'],
    data: { column },
  })

  return (
    <div
      className={`
        flex flex-col w-72 min-w-72 bg-gray-50 rounded-lg
        ${isDropTarget ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}
      `}
    >
      {/* Column Header */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-200">
        <div
          className={`w-2 h-2 rounded-full ${columnColors[column.color || 'gray']}`}
        />
        <h2 className="font-semibold text-gray-700 text-sm">{column.title}</h2>
        <span className="ml-auto bg-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
          {column.tasks.length}
        </span>
      </div>

      {/* Tasks Container */}
      <div
        ref={ref}
        className={`
          flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px]
          ${isDropTarget ? 'bg-blue-50' : ''}
        `}
      >
        {column.tasks.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-gray-400 text-sm">
            No tasks
          </div>
        ) : (
          column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} column={column.id} />
          ))
        )}
      </div>

      {/* Column Footer (optional: add task button) */}
      {/* <div className="p-2 border-t border-gray-200">
        <button className="w-full text-sm text-gray-500 hover:text-gray-700 py-1">
          + Add Task
        </button>
      </div> */}
    </div>
  )
}
