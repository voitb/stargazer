import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode, Ref } from "react";
import { cn } from "../../../utils/cn";
import {
  columnVariants,
  columnHeaderVariants,
  countBadgeVariants,
} from "./column.variants";

type ColumnProps = Omit<ComponentProps<"div">, "children"> &
  VariantProps<typeof columnVariants> & {
    ref?: Ref<HTMLDivElement>;
    header?: ReactNode;
    footer?: ReactNode;
    children: ReactNode;
  };

function Column({
  className,
  variant,
  size,
  header,
  footer,
  children,
  ref,
  ...props
}: ColumnProps) {
  return (
    <div
      ref={ref}
      role="region"
      className={cn(columnVariants({ variant, size }), className)}
      {...props}
    >
      {header && <div className="p-4 pb-2">{header}</div>}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto overflow-x-hidden min-h-37.5 scrollbar-thin">
        {children}
      </div>
      {footer && <div className="p-3 pt-2">{footer}</div>}
    </div>
  );
}

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
              dotColor,
            )}
          />
          <div
            className={cn(
              "absolute inset-0 rounded-full blur-sm opacity-50",
              dotColor,
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

export { Column, ColumnHeader };
export type { ColumnProps, ColumnHeaderProps };
