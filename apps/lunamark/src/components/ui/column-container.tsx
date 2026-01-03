import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const columnContainerVariants = cva(
  "flex flex-col rounded-xl max-h-full transition-all duration-200 ease-in-out",
  {
    variants: {
      variant: {
        default: "bg-[rgb(var(--ui-bg-secondary))]/50 hover:bg-[rgb(var(--ui-bg-secondary))]",
        active: "bg-blue-50/80 ring-2 ring-blue-500/20",
      },
      size: {
        sm: "w-64 min-w-64",
        md: "w-80 min-w-80",
        lg: "w-96 min-w-96",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

interface ColumnContainerProps
  extends Omit<ComponentProps<"div">, "children">,
    VariantProps<typeof columnContainerVariants> {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export function ColumnContainer({
  className,
  variant,
  size,
  header,
  footer,
  children,
  ref,
  ...props
}: ColumnContainerProps) {
  return (
    <div
      ref={ref}
      className={cn(columnContainerVariants({ variant, size }), className)}
      {...props}
    >
      {header && <div className="p-4 pb-2">{header}</div>}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto overflow-x-hidden min-h-[150px] custom-scrollbar">
        {children}
      </div>
      {footer && <div className="p-3 pt-2">{footer}</div>}
    </div>
  );
}

export { columnContainerVariants };
