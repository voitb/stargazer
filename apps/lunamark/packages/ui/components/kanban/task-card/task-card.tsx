import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "../../card";
import { cn } from "../../../utils/cn";
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

function TaskCardHeader({
  className,
  children,
  ref,
  ...props
}: TaskCardHeaderProps) {
  return (
    <CardHeader
      ref={ref}
      data-slot="task-card-header"
      className={cn(taskCardHeaderVariants(), className)}
      {...props}
    >
      {children}
    </CardHeader>
  );
}

function TaskCardContent({
  className,
  children,
  ref,
  ...props
}: TaskCardContentProps) {
  return (
    <CardContent
      ref={ref}
      data-slot="task-card-content"
      className={cn(taskCardContentVariants(), className)}
      {...props}
    >
      {children}
    </CardContent>
  );
}

function TaskCardFooter({
  className,
  children,
  ref,
  ...props
}: TaskCardFooterProps) {
  return (
    <CardFooter
      ref={ref}
      data-slot="task-card-footer"
      className={cn(taskCardFooterVariants(), className)}
      {...props}
    >
      {children}
    </CardFooter>
  );
}

export { TaskCard, TaskCardHeader, TaskCardContent, TaskCardFooter };
export type {
  TaskCardProps,
  TaskCardHeaderProps,
  TaskCardContentProps,
  TaskCardFooterProps,
};
