import { Column, ColumnHeader, ColumnContent, EmptyState } from "@ui/components/kanban";
import { COLUMN_COLORS } from "@/lib/kanban/constants";
import type { Column as ColumnType, Task } from "@/schemas/task";
import { TaskCard } from "./task-card";

interface KanbanColumnProps {
  column: ColumnType;
  onEditTask?: (task: Task) => void;
}

export function KanbanColumn({ column, onEditTask }: KanbanColumnProps) {
  return (
    <Column
      id={column.id}
      type="column"
      accept={["item"]}
      items={column.tasks}
      size="md"
    >
      <ColumnHeader
        title={column.title}
        dotColor={COLUMN_COLORS[column.color || "gray"]}
      />
      <ColumnContent>
        {column.tasks.length === 0 ? (
          <EmptyState message="No tasks yet" />
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
      </ColumnContent>
    </Column>
  );
}
