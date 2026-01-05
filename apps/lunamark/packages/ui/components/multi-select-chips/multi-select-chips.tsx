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
	useListNavigation,
	useRole,
} from "@floating-ui/react";
import { X } from "lucide-react";
import { useRef, useState } from "react";
import { Badge } from "../badge";
import { useControllableState } from "../../hooks/use-controllable-state";
import { useExitAnimation } from "../../hooks/use-exit-animation";
import { cn } from "../../utils/cn";
import { chipVariants } from "./multi-select-chips.variants";

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
	label: string;
	size: "sm" | "md";
	onRemove: () => void;
}

interface UnselectedChipProps {
	label: string;
	size: "sm" | "md";
	onSelect: () => void;
}

// Internal helper - entire chip is clickable to deselect
function SelectedChip({ label, size, onRemove }: SelectedChipProps) {
	return (
		<button
			type="button"
			onClick={onRemove}
			data-state="selected"
			aria-pressed={true}
			className={cn(chipVariants({ variant: "selected", size }))}
		>
			{label}
			<X
				className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"}
				aria-hidden="true"
			/>
		</button>
	);
}

// Internal helper - toggle button pattern for main row
function UnselectedChip({ label, size, onSelect }: UnselectedChipProps) {
	return (
		<button
			type="button"
			className={chipVariants({ variant: "unselected", size })}
			data-state="unselected"
			aria-pressed={false}
			onClick={onSelect}
		>
			{label}
		</button>
	);
}

function MultiSelectChips({
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
	const [activeIndex, setActiveIndex] = useState<number | null>(null);
	const listRef = useRef<(HTMLButtonElement | null)[]>([]);

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
	const listNavigation = useListNavigation(context, {
		listRef,
		activeIndex,
		onNavigate: setActiveIndex,
		loop: true,
	});

	const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
		[click, dismiss, role, listNavigation],
	);

	// Exit animation - match Dropdown's 150ms
	const shouldRender = useExitAnimation(isOpen, 150);

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
			{/* Selected chips - entire chip clickable */}
			{selectedOptions.map((option) => (
				<SelectedChip
					key={option.value}
					label={option.label ?? option.value}
					size={size}
					onRemove={() => handleToggle(option.value)}
				/>
			))}

			{/* Visible unselected chips */}
			{visibleUnselected.map((option) => (
				<UnselectedChip
					key={option.value}
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
									role="listbox"
									aria-multiselectable="true"
									aria-label="Additional options"
									data-state={isOpen ? "open" : "closed"}
									className={cn(
										"z-50 flex flex-wrap gap-1 max-w-xs p-2 rounded-lg",
										"bg-[rgb(var(--color-neutral-background-1))] border border-[rgb(var(--color-neutral-stroke-1))]",
										"shadow-lg",
										"data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
										"data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
									)}
									{...getFloatingProps()}
								>
									{overflowOptions.map((option, index) => {
										const isSelected = values.includes(option.value);
										const label = option.label ?? option.value;
										return (
											<button
												key={option.value}
												ref={(node) => {
													listRef.current[index] = node;
												}}
												type="button"
												role="option"
												aria-selected={isSelected}
												data-state={isSelected ? "selected" : "unselected"}
												tabIndex={activeIndex === index ? 0 : -1}
												className={cn(
													chipVariants({
														variant: isSelected ? "selected" : "unselected",
														size,
													}),
													activeIndex === index &&
														"ring-2 ring-[rgb(var(--color-neutral-stroke-focus))]",
												)}
												{...getItemProps({
													onClick: () => handleToggle(option.value),
												})}
											>
												{label}
												{isSelected && (
													<X
														className={
															size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"
														}
														aria-hidden="true"
													/>
												)}
											</button>
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
						"text-[rgb(var(--color-neutral-foreground-2))] hover:text-[rgb(var(--color-neutral-foreground-1))]",
						"text-[10px] ml-1 transition-colors",
					)}
				>
					Clear
				</button>
			)}
		</div>
	);
}

export { MultiSelectChips };
