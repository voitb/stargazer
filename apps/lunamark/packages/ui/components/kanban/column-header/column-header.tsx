import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../../../utils/cn";
import {
  columnHeaderVariants,
  countBadgeVariants,
} from "./column-header.variants";

type ColumnHeaderProps = ComponentProps<"div"> &
  VariantProps<typeof columnHeaderVariants> & {
    title: string;
    count: number;
    dotColor?: string;
  };

function ColumnHeader({
  className,
  size,
  title,
  count,
  dotColor,
  ref,
  ...props
}: ColumnHeaderProps) {
  return (
    <div
      ref={ref}
      className={cn(columnHeaderVariants({ size, className }))}
      {...props}
    >
      {dotColor && (
        <div className="relative">
          <div
            className={cn(
              "w-2.5 h-2.5 rounded-full ring-2 ring-[rgb(var(--color-neutral-background-1))] shadow-sm",
              dotColor
            )}
          />
          <div
            className={cn(
              "absolute inset-0 rounded-full blur-sm opacity-50",
              dotColor
            )}
          />
        </div>
      )}
      <h2 className="font-semibold text-[rgb(var(--color-neutral-foreground-1))] tracking-tight">
        {title}
      </h2>
      <span className={cn(countBadgeVariants({ size }))}>{count}</span>
    </div>
  );
}

export { ColumnHeader };
export type { ColumnHeaderProps };
