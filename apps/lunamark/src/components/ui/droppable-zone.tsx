"use client";

import { CollisionPriority } from "@dnd-kit/abstract";
import { useDroppable } from "@dnd-kit/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface DroppableZoneProps {
  id: string;
  type?: string;
  accept?: string[];
  data?: Record<string, unknown>;
  className?: string;
  activeClassName?: string;
  children: ReactNode | ((isDropTarget: boolean) => ReactNode);
}

export function DroppableZone({
  id,
  type = "column",
  accept = ["item"],
  data,
  className,
  activeClassName,
  children,
}: DroppableZoneProps) {
  const { ref, isDropTarget } = useDroppable({
    id,
    type,
    collisionPriority: CollisionPriority.Low,
    accept,
    data,
  });

  return (
    <div
      ref={ref}
      className={cn(className, isDropTarget && activeClassName)}
    >
      {typeof children === "function" ? children(isDropTarget) : children}
    </div>
  );
}
