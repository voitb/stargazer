"use client";

import {
	autoUpdate,
	FloatingFocusManager,
	FloatingPortal,
	flip,
	offset,
	shift,
	useClick,
	useDismiss,
	useFloating,
	useInteractions,
	useRole,
} from "@floating-ui/react";
import { cva } from "class-variance-authority";
import { X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useControllableState } from "@/hooks/ui/use-controllable-state";
import { useExitAnimation } from "@/hooks/ui/use-exit-animation";
import { cn } from "@/lib/utils/cn";

// Public types - exported
export interface MultiSelectChipsOption {
	value: string;
	label?: string;
}

export interface MultiSelectChipsProps {
	values?: string[];
	onValuesChange?: (values: string[]) => void;
	onToggle?: (value: string) => void;
	options: MultiSelectChipsOption[];
	maxDisplay?: number;
	size?: "sm" | "md";
	"aria-label"?: string;
	className?: string;
}

// Internal types - not exported
interface SelectedChipProps {
	value: string;
	label: string;
	size: "sm" | "md";
	onRemove: () => void;
}

interface UnselectedChipProps {
	value: string;
	label: string;
	size: "sm" | "md";
	onSelect: () => void;
}

const chipVariants = cva(
	[
		"inline-flex items-center rounded-full font-medium transition-all",
		"focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
		"focus-visible:ring-[rgb(var(--ui-border-focus))]",
	],
	{
		variants: {
			variant: {
				selected: [
					"bg-[rgb(var(--ui-primary)/0.15)] text-[rgb(var(--ui-primary))]",
					"border border-[rgb(var(--ui-primary)/0.3)]",
				],
				unselected: [
					"border border-[rgb(var(--ui-border))] bg-transparent",
					"text-[rgb(var(--ui-fg-muted))]",
					"hover:bg-[rgb(var(--ui-bg-secondary))] hover:text-[rgb(var(--ui-fg))]",
					"cursor-pointer",
				],
			},
			size: {
				sm: "px-2 py-0.5 text-[10px] gap-1",
				md: "px-2.5 py-1 text-xs gap-1.5",
			},
		},
		defaultVariants: { variant: "unselected", size: "sm" },
	},
);

const removeButtonVariants = cva(
	[
		"inline-flex items-center justify-center rounded-full",
		"hover:bg-[rgb(var(--ui-primary)/0.2)]",
		"focus:outline-none focus-visible:ring-1 focus-visible:ring-[rgb(var(--ui-primary))]",
		"transition-colors",
	],
	{
		variants: {
			size: {
				sm: "h-3 w-3 -mr-0.5",
				md: "h-4 w-4 -mr-1",
			},
		},
		defaultVariants: { size: "sm" },
	},
);

// Internal helper - receives all data via props (no Context)
function SelectedChip({ label, size, onRemove }: SelectedChipProps) {
	return (
		<span className={cn(chipVariants({ variant: "selected", size }))}>
			{label}
			<button
				type="button"
				onClick={(e) => {
					e.stopPropagation();
					onRemove();
				}}
				className={cn(removeButtonVariants({ size }))}
				aria-label={`Remove ${label}`}
			>
				<X className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} />
			</button>
		</span>
	);
}

// Internal helper - receives all data via props (no Context)
function UnselectedChip({ label, size, onSelect }: UnselectedChipProps) {
	return (
		<button
			type="button"
			className={chipVariants({ variant: "unselected", size })}
			aria-pressed={false}
			onClick={onSelect}
		>
			{label}
		</button>
	);
}

export function MultiSelectChips({
	values: controlledValues,
	onValuesChange,
	onToggle,
	options,
	maxDisplay = 6,
	size = "sm",
	className,
	"aria-label": ariaLabel,
}: MultiSelectChipsProps) {
	// Controlled/uncontrolled state
	const [values, setValues] = useControllableState({
		value: controlledValues,
		defaultValue: [],
		onChange: onValuesChange,
	});

	// Floating UI setup
	const [isOpen, setIsOpen] = useState(false);

	const { refs, floatingStyles, context } = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
		placement: "bottom-start",
		middleware: [offset(4), flip(), shift({ padding: 8 })],
		whileElementsMounted: autoUpdate,
	});

	// Interaction hooks
	const click = useClick(context);
	const dismiss = useDismiss(context);
	const role = useRole(context, { role: "listbox" });

	const { getReferenceProps, getFloatingProps } = useInteractions([
		click,
		dismiss,
		role,
	]);

	// Exit animation
	const shouldRender = useExitAnimation(isOpen);

	// Compute visible vs overflow options
	const selectedOptions = options.filter((o) => values.includes(o.value));
	const unselectedOptions = options.filter((o) => !values.includes(o.value));
	const remainingSlots = Math.max(0, maxDisplay - selectedOptions.length);
	const visibleUnselected = unselectedOptions.slice(0, remainingSlots);
	const overflowOptions = unselectedOptions.slice(remainingSlots);

	const hasSelection = values.length > 0;
	const hasOverflow = overflowOptions.length > 0;

	// Handlers
	const handleToggle = (value: string) => {
		const newValues = values.includes(value)
			? values.filter((v) => v !== value)
			: [...values, value];
		setValues(newValues);
		onToggle?.(value);
	};

	const handleClearAll = () => setValues([]);

	return (
		<div
			role="group"
			aria-label={ariaLabel}
			className={cn("inline-flex flex-wrap items-center gap-1", className)}
		>
			{/* Selected chips with X buttons */}
			{selectedOptions.map((option) => (
				<SelectedChip
					key={option.value}
					value={option.value}
					label={option.label ?? option.value}
					size={size}
					onRemove={() => handleToggle(option.value)}
				/>
			))}

			{/* Visible unselected chips */}
			{visibleUnselected.map((option) => (
				<UnselectedChip
					key={option.value}
					value={option.value}
					label={option.label ?? option.value}
					size={size}
					onSelect={() => handleToggle(option.value)}
				/>
			))}

			{/* Overflow trigger */}
			{hasOverflow && (
				<>
					<Badge
						ref={refs.setReference}
						variant="secondary"
						size={size}
						className="cursor-pointer"
						aria-haspopup="listbox"
						aria-expanded={isOpen}
						{...getReferenceProps()}
					>
						+{overflowOptions.length}
					</Badge>

					{shouldRender && (
						<FloatingPortal>
							<FloatingFocusManager context={context} modal={false}>
								<div
									ref={refs.setFloating}
									style={floatingStyles}
									data-state={isOpen ? "open" : "closed"}
									className={cn(
										"z-50 flex flex-wrap gap-1 max-w-xs p-2 rounded-lg",
										"bg-[rgb(var(--ui-bg))] border border-[rgb(var(--ui-border))]",
										"shadow-lg",
										"data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
										"data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
									)}
									{...getFloatingProps()}
								>
									{overflowOptions.map((option) => {
										const isSelected = values.includes(option.value);
										const label = option.label ?? option.value;
										return isSelected ? (
											<SelectedChip
												key={option.value}
												value={option.value}
												label={label}
												size={size}
												onRemove={() => handleToggle(option.value)}
											/>
										) : (
											<UnselectedChip
												key={option.value}
												value={option.value}
												label={label}
												size={size}
												onSelect={() => handleToggle(option.value)}
											/>
										);
									})}
								</div>
							</FloatingFocusManager>
						</FloatingPortal>
					)}
				</>
			)}

			{/* Clear all button */}
			{hasSelection && (
				<button
					type="button"
					onClick={handleClearAll}
					className={cn(
						"text-[rgb(var(--ui-fg-muted))] hover:text-[rgb(var(--ui-fg))]",
						"text-[10px] ml-1 transition-colors",
					)}
				>
					Clear
				</button>
			)}
		</div>
	);
}
