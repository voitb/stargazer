import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../../utils/cn";
import {
  taskCardVariants,
  taskCardHeaderVariants,
  taskCardContentVariants,
  taskCardFooterVariants,
} from "./task-card.variants";

type TaskCardProps = ComponentProps<"div"> &
  VariantProps<typeof taskCardVariants> & {
    onClick?: () => void;
  };

type TaskCardHeaderProps = ComponentProps<"div">;
type TaskCardContentProps = ComponentProps<"div">;
type TaskCardFooterProps = ComponentProps<"div">;

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
    <div
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
    </div>
  );
}

function TaskCardHeader({
  className,
  children,
  ref,
  ...props
}: TaskCardHeaderProps) {
  return (
    <div
      ref={ref}
      data-slot="task-card-header"
      className={cn(taskCardHeaderVariants(), className)}
      {...props}
    >
      {children}
    </div>
  );
}

function TaskCardContent({
  className,
  children,
  ref,
  ...props
}: TaskCardContentProps) {
  return (
    <div
      ref={ref}
      data-slot="task-card-content"
      className={cn(taskCardContentVariants(), className)}
      {...props}
    >
      {children}
    </div>
  );
}

function TaskCardFooter({
  className,
  children,
  ref,
  ...props
}: TaskCardFooterProps) {
  return (
    <div
      ref={ref}
      data-slot="task-card-footer"
      className={cn(taskCardFooterVariants(), className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { TaskCard, TaskCardHeader, TaskCardContent, TaskCardFooter };
export type {
  TaskCardProps,
  TaskCardHeaderProps,
  TaskCardContentProps,
  TaskCardFooterProps,
};
