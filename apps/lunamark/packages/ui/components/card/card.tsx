import type { ComponentProps } from "react";
import { cn } from "../../utils/cn";

type CardProps = ComponentProps<"div">;

function Card({ className, ref, ...props }: CardProps) {
  return (
    <div
      ref={ref}
      data-slot="card"
      className={cn(
        "rounded-lg border bg-[rgb(var(--color-neutral-background-1))] text-[rgb(var(--color-neutral-foreground-1))] shadow-sm",
        "border-[rgb(var(--color-neutral-stroke-1))]",
        className
      )}
      {...props}
    />
  );
}

export { Card };
export type { CardProps };
