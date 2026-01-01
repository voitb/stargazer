import { useDroppable } from '@dnd-kit/react'
import { CollisionPriority } from '@dnd-kit/abstract'
import { Plus } from 'lucide-react'
import type { Column as ColumnType, Task } from '@/schemas/task'
import { COLUMN_COLORS } from '@/lib/kanban/constants'
import { TaskCard } from './TaskCard'

interface ColumnProps {
  column: ColumnType
  /** Callback to add a new task to this column */
  onAddTask?: () => void
  /** Callback to edit a task */
  onEditTask?: (task: Task) => void
}

/**
 * Droppable column container for the Kanban board
 *
 * Uses useDroppable to create a drop target for tasks.
 * Tasks use useSortable with `group` to enable cross-column movement.
 */
export function Column({ column, onAddTask, onEditTask }: ColumnProps) {
  const { ref, isDropTarget } = useDroppable({
    id: column.id,
    type: 'column',
    collisionPriority: CollisionPriority.Low, // Items get priority over column boundaries
    accept: ['item'],
    data: { column },
  })

  return (
    <div
      className={`
        flex flex-col w-72 min-w-72 rounded-lg
        transition-all duration-150
        ${isDropTarget
          ? 'ring-2 ring-blue-400 bg-blue-50/30 shadow-lg'
          : 'bg-gray-50'}
      `}
    >
      {/* Column Header */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-200">
        <div
          className={`w-2 h-2 rounded-full ${COLUMN_COLORS[column.color || 'gray']}`}
        />
        <h2 className="font-semibold text-gray-700 text-sm">{column.title}</h2>
        <span className="ml-auto bg-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
          {column.tasks.length}
        </span>
      </div>

      {/* Tasks Container - Drop Target */}
      <div
        ref={ref}
        className={`
          flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px]
          transition-colors duration-150
          ${isDropTarget ? 'bg-blue-50/50' : ''}
        `}
      >
        {column.tasks.length === 0 ? (
          <div
            className={`
              flex items-center justify-center h-20
              border-2 border-dashed rounded-lg mx-1
              transition-colors duration-150
              ${isDropTarget
                ? 'border-blue-400 bg-blue-50 text-blue-500'
                : 'border-gray-300 text-gray-400'}
            `}
          >
            {isDropTarget ? 'Drop here' : 'No tasks'}
          </div>
        ) : (
          column.tasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              column={column.id}
              index={index}
              isLast={index === column.tasks.length - 1}
              onClick={() => onEditTask?.(task)}
            />
          ))
        )}
      </div>

      {/* Column Footer: Add Task Button */}
      {onAddTask && (
        <div className="p-2 border-t border-gray-200">
          <button
            onClick={onAddTask}
            className="w-full flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded py-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      )}
    </div>
  )
}
