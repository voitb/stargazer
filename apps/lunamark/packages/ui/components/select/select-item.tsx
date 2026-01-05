import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../utils/cn";

type SelectItemProps = Omit<ComponentProps<"div">, "children"> & {
	children: ReactNode;
	value: string;
	disabled?: boolean;
	isSelected?: boolean;
	isHighlighted?: boolean;
	onSelect?: (value: string) => void;
};

function SelectItem({
	children,
	value,
	disabled = false,
	isSelected = false,
	isHighlighted = false,
	onSelect,
	className,
	onClick,
	ref,
	...props
}: SelectItemProps) {
	const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (disabled) return;
		onSelect?.(value);
		onClick?.(e);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (disabled) return;
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			onSelect?.(value);
		}
	};

	return (
		<div
			ref={ref}
			role="option"
			aria-selected={isSelected}
			aria-disabled={disabled}
			tabIndex={disabled ? -1 : 0}
			data-select-item
			data-value={value}
			data-selected={isSelected}
			data-highlighted={isHighlighted}
			data-disabled={disabled}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			className={cn(
				"relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
				"transition-colors",
				"focus:bg-[rgb(var(--color-neutral-background-3))]",
				"hover:bg-[rgb(var(--color-neutral-background-3))]",
				isHighlighted && "bg-[rgb(var(--color-neutral-background-3))]",
				isSelected &&
					"bg-[rgb(var(--color-brand-background-selected))] text-[rgb(var(--color-brand-foreground-on-brand))]",
				disabled && "opacity-50 pointer-events-none",
				className
			)}
			{...props}
		>
			{children}
		</div>
	);
}

export { SelectItem };
export type { SelectItemProps };
