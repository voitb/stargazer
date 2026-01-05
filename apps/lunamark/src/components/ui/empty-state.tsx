import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const emptyStateVariants = cva(
	"flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-colors duration-200",
	{
		variants: {
			variant: {
				default:
					"border-[rgb(var(--color-neutral-stroke-1))]/60 bg-[rgb(var(--color-neutral-background-2))]/30 text-[rgb(var(--color-neutral-foreground-2))]",
				active: "border-[rgb(var(--color-brand-stroke-2))] bg-[rgb(var(--color-brand-background-selected)/0.5)] text-[rgb(var(--color-brand-foreground-1))]",
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
