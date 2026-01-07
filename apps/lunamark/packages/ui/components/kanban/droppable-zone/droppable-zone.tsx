"use client";

import { CollisionPriority } from "@dnd-kit/abstract";
import { useDroppable } from "@dnd-kit/react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../../utils/cn";
import { mergeRefs } from "../../../utils/merge-refs";

export type DroppableZoneProps = Omit<ComponentProps<"div">, "children"> & {
  id: string;
  type?: string;
  accept?: string[];
  data?: Record<string, unknown>;
  disabled?: boolean;
  activeClassName?: string;
  children: ReactNode | ((isDropTarget: boolean) => ReactNode);
};

export function DroppableZone({
  id,
  type = "column",
  accept = ["item"],
  data,
  disabled,
  className,
  activeClassName,
  children,
  ref,
  ...props
}: DroppableZoneProps) {
  const { ref: droppableRef, isDropTarget } = useDroppable({
    id,
    type,
    collisionPriority: CollisionPriority.Low,
    accept,
    data,
    disabled,
  });

  const combinedRef = mergeRefs(droppableRef, ref);

  return (
    <div
      ref={combinedRef}
      className={cn(className, isDropTarget && activeClassName)}
      {...props}
    >
      {typeof children === "function" ? children(isDropTarget) : children}
    </div>
  );
}
