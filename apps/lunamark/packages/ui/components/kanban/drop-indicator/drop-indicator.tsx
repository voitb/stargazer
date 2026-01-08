import type { ComponentProps } from "react";
import { cn } from "@ui/utils";

type DropIndicatorProps = ComponentProps<"div"> & {
  isVisible: boolean;
};

export function DropIndicator({
  isVisible,
  className,
  ref,
  ...props
}: DropIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "h-1 rounded-full mx-1 my-1 transition-all duration-150 animate-pulse bg-[rgb(var(--color-brand-background))]",
        className
      )}
      {...props}
    />
  );
}

export type { DropIndicatorProps };
