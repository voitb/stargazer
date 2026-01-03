import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColumnContainer } from "@/components/ui/column-container";
import { DroppableZone } from "@/components/ui/droppable-zone";
import { EmptyState } from "@/components/ui/empty-state";
import { COLUMN_COLORS } from "@/lib/kanban/constants";
import { cn } from "@/lib/utils/cn";
import type { Column as ColumnType, Task } from "@/schemas/task";
import { TaskCard } from "./task-card";

interface ColumnProps {
  column: ColumnType;
  onAddTask?: () => void;
  onEditTask?: (task: Task) => void;
}

export function Column({ column, onAddTask, onEditTask }: ColumnProps) {
  return (
    <DroppableZone
      id={column.id}
      type="column"
      accept={["item"]}
      data={{ column }}
    >
      {(isDropTarget) => (
        <ColumnContainer
          variant={isDropTarget ? "active" : "default"}
          header={<ColumnHeader column={column} />}
          footer={
            onAddTask && (
              <Button
                variant="ghost"
                onClick={onAddTask}
                className="w-full justify-center gap-2 text-[rgb(var(--ui-fg-muted))] hover:text-[rgb(var(--ui-fg))] hover:bg-[rgb(var(--ui-bg))] hover:shadow-sm border border-transparent hover:border-[rgb(var(--ui-border))]"
              >
                <Plus className="w-4 h-4" />
                <span className="font-medium">Add Task</span>
              </Button>
            )
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
        </ColumnContainer>
      )}
    </DroppableZone>
  );
}

function ColumnHeader({ column }: { column: ColumnType }) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className={cn(
          "w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm",
          COLUMN_COLORS[column.color || "gray"],
        )}
      />
      <h2 className="font-bold text-[rgb(var(--ui-fg-muted))] text-sm tracking-tight">
        {column.title}
      </h2>
      <span className="bg-[rgb(var(--ui-bg-tertiary))]/60 text-[rgb(var(--ui-fg-muted))] text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
        {column.tasks.length}
      </span>
    </div>
  );
}

