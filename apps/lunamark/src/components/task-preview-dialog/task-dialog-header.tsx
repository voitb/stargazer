"use client";

import { Eye, Pencil } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@ui/components";

interface TaskDialogHeaderProps {
  taskId?: string;
  isEditing: boolean;
  mode: "preview" | "edit";
  onModeChange: (mode: "preview" | "edit") => void;
}

export function TaskDialogHeader({
  taskId,
  isEditing,
  mode,
  onModeChange,
}: TaskDialogHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-[rgb(var(--color-neutral-stroke-1))/0.3] bg-[rgb(var(--color-neutral-background-2))/0.3]">
      <div className="flex items-center gap-3">
        {taskId && (
          <span className="px-2 py-0.5 text-xs font-mono font-medium rounded bg-[rgb(var(--color-neutral-background-3))] text-[rgb(var(--color-neutral-foreground-2))] border border-[rgb(var(--color-neutral-stroke-1))/0.5]">
            #{taskId.slice(-6)}
          </span>
        )}
        <h2 className="text-base font-semibold text-[rgb(var(--color-neutral-foreground-1))]">
          {isEditing ? "Edit Task" : "New Task"}
        </h2>
      </div>

      <ToggleGroup
        type="single"
        value={mode}
        onValueChange={(value) => value && onModeChange(value as "preview" | "edit")}
        variant="contained"
        size="sm"
      >
        <ToggleGroupItem value="preview">
          <Eye className="w-3.5 h-3.5" />
          Preview
        </ToggleGroupItem>
        <ToggleGroupItem value="edit">
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
