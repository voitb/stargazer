"use client";

import { useRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "@ui/utils";
import { mergeRefs } from "@ui/utils";
import { ToggleGroupContext } from "./toggle-group.context";
import { toggleGroupVariants } from "./toggle-group.variants";
import { useToggleGroup, type UseToggleGroupOptions } from "./use-toggle-group";

type ToggleGroupBaseProps = Omit<ComponentProps<"div">, "children"> & {
	children: ReactNode;
};

export type ToggleGroupProps = ToggleGroupBaseProps & UseToggleGroupOptions;

function ToggleGroup({
	type,
	size = "md",
	variant = "ring",
	orientation = "horizontal",
	children,
	className,
	ref,
	...props
}: ToggleGroupProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	const hookOptions =
		type === "single"
			? {
				type: "single" as const,
				value: (props as { value: string | null }).value,
				onValueChange: (props as { onValueChange: (v: string | null) => void })
					.onValueChange,
				size,
				variant,
				orientation,
			}
			: {
				type: "multiple" as const,
				values: (props as { values: string[] }).values,
				onValuesChange: (props as { onValuesChange: (v: string[]) => void })
					.onValuesChange,
				size,
				variant,
				orientation,
			};

	const { contextValue, containerProps } = useToggleGroup(hookOptions);

	const combinedRef = mergeRefs(containerRef, ref);

	const {
		value: _value,
		onValueChange: _onValueChange,
		values: _values,
		onValuesChange: _onValuesChange,
		...restProps
	} = props as Record<string, unknown>;

	return (
		<ToggleGroupContext.Provider value={contextValue}>
			<div
				ref={combinedRef}
				{...containerProps}
				className={cn(toggleGroupVariants({ orientation, variant }), className)}
				{...restProps}
			>
				{children}
			</div>
		</ToggleGroupContext.Provider>
	);
}

export { ToggleGroup };
