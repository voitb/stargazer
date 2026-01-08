"use client";

import type { VariantProps } from "class-variance-authority";
import {
	FloatingFocusManager,
	FloatingPortal,
} from "@floating-ui/react";
import { X } from "lucide-react";
import { useExitAnimation } from "@ui/hooks/animation/use-exit-animation";
import { cn } from "@ui/utils";
import { chipVariants } from "./multi-select-chips.variants";
import { SelectedChip } from "./selected-chip";
import { UnselectedChip } from "./unselected-chip";
import {
	useMultiSelectChips,
	type MultiSelectChipsOption,
} from "./use-multi-select-chips";

export type { MultiSelectChipsOption };

export interface MultiSelectChipsProps {
	values?: string[];
	onValuesChange?: (values: string[]) => void;
	onToggle?: (value: string) => void;
	options: MultiSelectChipsOption[];
	maxDisplay?: number;
	size?: VariantProps<typeof chipVariants>["size"];
	"aria-label"?: string;
	className?: string;
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
	const {
		isOpen,
		refs,
		floatingStyles,
		context,
		listRef,
		activeIndex,
		values,
		getReferenceProps,
		getFloatingProps,
		getItemProps,
		handleToggle,
		handleClearAll,
		selectedOptions,
		visibleUnselected,
		overflowOptions,
		hasSelection,
		hasOverflow,
	} = useMultiSelectChips({
		values: controlledValues,
		onValuesChange,
		onToggle,
		options,
		maxDisplay,
	});

	const shouldRender = useExitAnimation(isOpen, 150);

	return (
		<div
			role="group"
			aria-label={ariaLabel}
			className={cn("inline-flex flex-wrap items-center gap-1", className)}
		>
			{selectedOptions.map((option) => (
				<SelectedChip
					key={option.value}
					label={option.label ?? option.value}
					size={size}
					onRemove={() => handleToggle(option.value)}
				/>
			))}

			{visibleUnselected.map((option) => (
				<UnselectedChip
					key={option.value}
					label={option.label ?? option.value}
					size={size}
					onSelect={() => handleToggle(option.value)}
				/>
			))}

			{hasOverflow && (
				<>
					<button
						ref={refs.setReference}
						type="button"
						className={cn(
							"inline-flex items-center justify-center rounded-full font-medium",
							"bg-[rgb(var(--color-neutral-background-3))] text-[rgb(var(--color-neutral-foreground-2))]",
							"hover:bg-[rgb(var(--color-neutral-background-3-hover))]",
							"cursor-pointer transition-colors",
							size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
						)}
						aria-haspopup="listbox"
						aria-expanded={isOpen}
						{...getReferenceProps()}
					>
						+{overflowOptions.length}
					</button>

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
