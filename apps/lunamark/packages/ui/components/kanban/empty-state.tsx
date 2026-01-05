import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode, Ref } from "react";
import { cn } from "../../utils/cn";
import { emptyStateVariants } from "./empty-state.variants";

export interface EmptyStateProps
  extends Omit<ComponentProps<"div">, "children">,
    VariantProps<typeof emptyStateVariants> {
  ref?: Ref<HTMLDivElement>;
  icon?: ReactNode;
  message?: string;
}

export function EmptyState({
  className,
  variant,
  size,
  icon,
  message = "No items",
  ref,
  ...props
}: EmptyStateProps) {
  return (
    <div
      ref={ref}
      className={cn(emptyStateVariants({ variant, size }), className)}
      {...props}
    >
      {icon}
      <span className="text-xs font-medium">{message}</span>
    </div>
  );
}
