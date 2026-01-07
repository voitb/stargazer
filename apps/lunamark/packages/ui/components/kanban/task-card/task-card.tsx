import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { Card } from "../../card";
import { cn } from "../../../utils/cn";
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
      data-slot="task-card"
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
