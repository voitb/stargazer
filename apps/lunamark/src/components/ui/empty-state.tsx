import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const emptyStateVariants = cva(
	"flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-colors duration-200",
	{
		variants: {
			variant: {
				default:
					"border-[rgb(var(--ui-border))]/60 bg-[rgb(var(--ui-bg-secondary))]/30 text-[rgb(var(--ui-fg-muted))]",
				active: "border-blue-300 bg-blue-50/50 text-blue-500",
			},
			size: {
				sm: "h-20 m-1",
				md: "h-32 m-1",
				lg: "h-48 m-2",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "md",
		},
	},
);

interface EmptyStateProps
	extends Omit<ComponentProps<"div">, "children">,
		VariantProps<typeof emptyStateVariants> {
	ref?: React.Ref<HTMLDivElement>;
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

export { emptyStateVariants };
