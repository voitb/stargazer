import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, Ref } from "react";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
	"inline-flex items-center rounded-full font-medium transition-colors",
	{
		variants: {
			variant: {
				default:
					"bg-[rgb(var(--ui-bg-tertiary))] text-[rgb(var(--ui-fg))]",
				secondary:
					"bg-[rgb(var(--ui-bg-secondary))] text-[rgb(var(--ui-fg-muted))]",
				success:
					"bg-[rgb(var(--ui-success)/0.15)] text-[rgb(var(--ui-success))]",
				warning:
					"bg-[rgb(var(--ui-warning)/0.15)] text-[rgb(var(--ui-warning))]",
				danger:
					"bg-[rgb(var(--ui-danger)/0.15)] text-[rgb(var(--ui-danger))]",
				outline:
					"border border-[rgb(var(--ui-border))] bg-transparent text-[rgb(var(--ui-fg))]",
			},
			size: {
				sm: "px-2 py-0.5 text-xs",
				md: "px-2.5 py-0.5 text-sm",
			},
		},
		defaultVariants: { variant: "default", size: "md" },
	}
);

type BadgeProps = ComponentPropsWithoutRef<"span"> &
	VariantProps<typeof badgeVariants> & {
		ref?: Ref<HTMLSpanElement>;
	};

function Badge({ className, variant, size, ref, ...props }: BadgeProps) {
	return (
		<span
			ref={ref}
			className={cn(badgeVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Badge, badgeVariants };
