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
        flex flex-col w-80 min-w-80 rounded-xl max-h-full
        transition-all duration-200 ease-in-out
        ${isDropTarget
          ? 'bg-blue-50/80 ring-2 ring-blue-500/20'
          : 'bg-gray-50/50 hover:bg-gray-50'}
      `}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className={`w-2.5 h-2.5 rounded-full ${COLUMN_COLORS[column.color || 'gray']} ring-2 ring-white shadow-sm`} />
          </div>
          <h2 className="font-bold text-gray-700 text-sm tracking-tight">{column.title}</h2>
          <span className="bg-gray-200/60 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
            {column.tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks Container - Drop Target */}
      <div
        ref={ref}
        className={`
          flex-1 p-3 space-y-3 overflow-y-auto overflow-x-hidden min-h-[150px]
          custom-scrollbar
        `}
      >
        {column.tasks.length === 0 ? (
          <div
            className={`
              flex flex-col items-center justify-center h-32
              border-2 border-dashed rounded-xl m-1
              transition-colors duration-200
              ${isDropTarget
                ? 'border-blue-300 bg-blue-50/50 text-blue-500'
                : 'border-gray-200/60 bg-gray-50/30 text-gray-400'}
            `}
          >
            <span className="text-xs font-medium">No tasks yet</span>
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
        <div className="p-3 pt-2">
          <button
            onClick={onAddTask}
            className="group w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-white hover:shadow-sm hover:border-gray-200 border border-transparent rounded-lg py-2 transition-all duration-200"
          >
            <Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
            <span className="font-medium">Add Task</span>
          </button>
        </div>
      )}
    </div>
  )
}
