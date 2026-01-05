import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode, Ref } from "react";
import { cn } from "../../../utils/cn";
import { columnContainerVariants } from "./column-container.variants";

/**
 * Layout container for a Kanban column with header, scrollable content, and footer slots.
 *
 * @note Requires `custom-scrollbar` CSS class to be defined in your stylesheet for styled scrollbars.
 */
export interface ColumnContainerProps
  extends Omit<ComponentProps<"div">, "children">,
    VariantProps<typeof columnContainerVariants> {
  ref?: Ref<HTMLDivElement>;
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
      role="region"
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
