import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import type { Sensors } from "@dnd-kit/dom";
import { KanbanColumn } from "./column";
import { TaskCardContent } from "./task-card-content";
import type { Column, Task } from "@/schemas/task";
import type { useTaskEditor } from "@/hooks/task-editor/use-task-editor";

interface DesktopKanbanViewProps {
  columns: Column[];
  taskEditor: ReturnType<typeof useTaskEditor>;
  activeTask: Task | null;
  sensors: Sensors;
  onDragStart: (event: any) => void;
  onDragOver: (event: any) => void;
  onDragEnd: (event: any) => void;
}

export function DesktopKanbanView({
  columns,
  taskEditor,
  activeTask,
  sensors,
  onDragStart,
  onDragOver,
  onDragEnd,
}: DesktopKanbanViewProps) {
  return (
    <DragDropProvider
      sensors={sensors}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      {/* Fluid container: columns stretch equally */}
      <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden scrollbar-thin">
        <div className="flex gap-6 p-6 h-full mx-auto max-w-640">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onEditTask={taskEditor.openEdit}
              fluid
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeTask && <TaskCardContent task={activeTask} isDragOverlay />}
      </DragOverlay>
    </DragDropProvider>
  );
}
