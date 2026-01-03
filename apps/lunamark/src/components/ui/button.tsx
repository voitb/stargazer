import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, Ref } from "react";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
	{
		variants: {
			variant: {
				primary:
					"bg-[rgb(var(--ui-primary))] text-[rgb(var(--ui-primary-fg))] hover:opacity-90 focus-visible:ring-[rgb(var(--ui-primary))]",
				secondary:
					"bg-[rgb(var(--ui-bg-tertiary))] text-[rgb(var(--ui-fg))] hover:bg-[rgb(var(--ui-bg-secondary))]",
				outline:
					"border border-[rgb(var(--ui-border))] bg-transparent text-[rgb(var(--ui-fg))] hover:bg-[rgb(var(--ui-bg-secondary))]",
				ghost: "text-[rgb(var(--ui-fg))] hover:bg-[rgb(var(--ui-bg-secondary))]",
				danger:
					"bg-[rgb(var(--ui-danger))] text-[rgb(var(--ui-danger-fg))] hover:opacity-90 focus-visible:ring-[rgb(var(--ui-danger))]",
				link: "text-[rgb(var(--ui-primary))] underline-offset-4 hover:underline",
			},
			size: {
				sm: "h-8 px-3 text-xs",
				md: "h-10 px-4",
				lg: "h-12 px-6 text-base",
				icon: "h-10 w-10",
			},
		},
		defaultVariants: { variant: "primary", size: "md" },
	}
);

type ButtonProps = ComponentPropsWithoutRef<"button"> &
	VariantProps<typeof buttonVariants> & {
		ref?: Ref<HTMLButtonElement>;
		isLoading?: boolean;
	};

function Button({
	className,
	variant,
	size,
	isLoading,
	disabled,
	children,
	ref,
	...props
}: ButtonProps) {
	return (
		<button
			ref={ref}
			className={cn(buttonVariants({ variant, size, className }))}
			disabled={disabled || isLoading}
			{...props}
		>
			{isLoading && (
				<svg
					className="h-4 w-4 animate-spin"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle
						className="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						strokeWidth="4"
					/>
					<path
						className="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					/>
				</svg>
			)}
			{children}
		</button>
	);
}

export { Button, buttonVariants };
