import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PRIORITY_BADGE_VARIANTS } from "@/lib/kanban/constants";
import { cn } from "@/lib/utils/cn";
import type { Task } from "@/schemas/task";

interface TaskCardContentProps {
  task: Task;
  isDragOverlay?: boolean;
  onClick?: () => void;
  className?: string;
}

export function TaskCardContent({
  task,
  isDragOverlay,
  onClick,
  className,
}: TaskCardContentProps) {
  return (
    <Card
      className={cn(
        "relative p-4 rounded-xl group",
        "hover:shadow-md hover:border-[rgb(var(--ui-border))] transition-all duration-200 ease-in-out",
        isDragOverlay
          ? "shadow-2xl rotate-2 scale-105 ring-1 ring-black/5 cursor-grabbing"
          : "cursor-grab active:cursor-grabbing",
        className,
      )}
    >
      {/* Priority and labels */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant={PRIORITY_BADGE_VARIANTS[task.metadata.priority]}
            size="sm"
            className="uppercase text-[10px] font-bold tracking-wide"
          >
            {task.metadata.priority}
          </Badge>
          {task.metadata.labels.slice(0, 2).map((label) => (
            <Badge
              key={label}
              variant="outline"
              size="sm"
              className="text-[10px] font-medium text-[rgb(var(--ui-fg-muted))]"
            >
              {label}
            </Badge>
          ))}
          {task.metadata.labels.length > 2 && (
            <Badge
              variant="outline"
              size="sm"
              className="text-[10px] text-[rgb(var(--ui-fg-muted))]/70"
            >
              +{task.metadata.labels.length - 2}
            </Badge>
          )}
        </div>
      </div>

      {/* Title with stretched link pattern for accessibility */}
      <h3 className="font-semibold text-[rgb(var(--ui-fg))] text-[15px] leading-snug mb-3">
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "text-left w-full",
            "after:absolute after:inset-0 after:pointer-events-none",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[rgb(var(--ui-border-focus))]",
          )}
        >
          {task.metadata.title}
        </button>
      </h3>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[rgb(var(--ui-border))]/20">
        <div className="flex items-center gap-2" title={task.metadata.assignee ?? undefined}>
          <Avatar
            size="sm"
            src={task.metadata.avatarUrl}
            alt={task.metadata.assignee ?? undefined}
            className={!task.metadata.assignee ? "border border-dashed border-[rgb(var(--ui-border))] bg-transparent" : undefined}
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-[rgb(var(--ui-fg-muted))] font-medium">
          <span className="tracking-tighter opacity-70">
            #{task.metadata.id.slice(-4)}
          </span>
          {task.metadata.due && (
            <span
              className={cn(
                "px-1.5 py-0.5 rounded",
                new Date(task.metadata.due) < new Date() &&
                  "text-red-500 bg-red-50",
              )}
            >
              {new Date(task.metadata.due).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
