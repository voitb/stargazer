import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ComponentType } from "react";
import { cn } from "@ui/utils";
import { statPillVariants } from "./stat-pill.variants";

type StatPillSize = NonNullable<VariantProps<typeof statPillVariants>["size"]>;

const iconSizeClasses: Record<StatPillSize, string> = {
  sm: "w-3 h-3",
  md: "w-3.5 h-3.5",
};

type StatPillProps = Omit<ComponentProps<"div">, "children"> &
  VariantProps<typeof statPillVariants> & {
    icon: ComponentType<{ className?: string }>;
    label: string;
    value: number | string;
  };

function StatPill({
  className,
  variant,
  size = "md",
  icon: Icon,
  label,
  value,
  ref,
  ...props
}: StatPillProps) {
  return (
    <div
      data-stat-pill
      ref={ref}
      className={cn(statPillVariants({ variant, size, className }))}
      {...props}
    >
      <Icon
        className={cn(iconSizeClasses[size ?? "md"], "transition-colors duration-200")}
        aria-hidden="true"
      />
      <span className="text-[rgb(var(--color-neutral-foreground-1))] font-semibold tabular-nums">
        {value}
      </span>
      <span>{label}</span>
    </div>
  );
}

export { StatPill };
export type { StatPillProps };
