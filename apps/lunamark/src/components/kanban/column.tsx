import { Column, ColumnHeader, DroppableZone, EmptyState } from "@ui/components/kanban";
import { COLUMN_COLORS } from "@/lib/kanban/constants";
import type { Column as ColumnType, Task } from "@/schemas/task";
import { TaskCard } from "./task-card";

interface KanbanColumnProps {
  column: ColumnType;
  onEditTask?: (task: Task) => void;
}

export function KanbanColumn({ column, onEditTask }: KanbanColumnProps) {
  return (
    <DroppableZone
      id={column.id}
      type="column"
      accept={["item"]}
      data={{ column }}
    >
      {(isDropTarget) => (
        <Column
          variant={isDropTarget ? "active" : "default"}
          header={
            <ColumnHeader
              title={column.title}
              count={column.tasks.length}
              dotColor={COLUMN_COLORS[column.color || "gray"]}
            />
          }
        >
          {column.tasks.length === 0 ? (
            <EmptyState
              variant={isDropTarget ? "active" : "default"}
              message="No tasks yet"
            />
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
        </Column>
      )}
    </DroppableZone>
  );
}

