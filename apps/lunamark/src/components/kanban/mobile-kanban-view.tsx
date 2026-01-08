import { useState } from "react";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import type { Sensors } from "@dnd-kit/dom";
import { ColumnTabs } from "@ui/components/kanban/column-tabs";
import { SwipeableContainer } from "@ui/components/kanban/swipeable-container";
import { COLUMN_COLORS } from "@/lib/kanban/constants";
import { KanbanColumn } from "./column";
import { TaskCardContent } from "./task-card-content";
import type { Column, Task } from "@/schemas/task";
import type { useTaskEditor } from "@/hooks/task-editor/use-task-editor";

interface MobileKanbanViewProps {
  columns: Column[];
  taskEditor: ReturnType<typeof useTaskEditor>;
  activeTask: Task | null;
  sensors: Sensors;
  onDragStart: (event: any) => void;
  onDragOver: (event: any) => void;
  onDragEnd: (event: any) => void;
}

export function MobileKanbanView({
  columns,
  taskEditor,
  activeTask,
  sensors,
  onDragStart,
  onDragOver,
  onDragEnd,
}: MobileKanbanViewProps) {
  const [activeColumnIndex, setActiveColumnIndex] = useState(0);

  const tabs = columns.map((col) => ({
    id: col.id,
    title: col.title,
    count: col.tasks.length,
    color: col.color ? COLUMN_COLORS[col.color] : undefined,
  }));

  return (
    <div className="flex flex-col h-full">
      {/* Tab navigation */}
      <ColumnTabs
        tabs={tabs}
        activeIndex={activeColumnIndex}
        onTabChange={setActiveColumnIndex}
      />

      {/* Swipeable content */}
      <DragDropProvider
        sensors={sensors}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <SwipeableContainer
          activeIndex={activeColumnIndex}
          onIndexChange={setActiveColumnIndex}
          ariaLive="polite"
        >
          {columns.map((column) => (
            <div key={column.id} className="px-4 py-4 h-full">
              <KanbanColumn
                column={column}
                onEditTask={taskEditor.openEdit}
                fluid={false}
              />
            </div>
          ))}
        </SwipeableContainer>

        <DragOverlay>
          {activeTask && <TaskCardContent task={activeTask} isDragOverlay />}
        </DragOverlay>
      </DragDropProvider>
    </div>
  );
}
