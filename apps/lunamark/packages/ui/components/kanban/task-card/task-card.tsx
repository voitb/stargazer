import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { Card } from "@ui/components/card";
import { cn } from "@ui/utils";
import { taskCardVariants } from "./task-card.variants";

type TaskCardProps = ComponentProps<"div"> &
  VariantProps<typeof taskCardVariants> & {
    onClick?: () => void;
  };

function TaskCard({
  className,
  isDragging,
  isDragOverlay,
  onClick,
  children,
  ref,
  ...props
}: TaskCardProps) {
  return (
    <Card
      ref={ref}
      data-task-card
      onClick={onClick}
      className={cn(
        taskCardVariants({ isDragging, isDragOverlay }),
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
}

export { TaskCard };
export type { TaskCardProps };
