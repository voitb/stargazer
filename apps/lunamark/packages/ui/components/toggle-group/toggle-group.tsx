"use client";

import { useRef, type ComponentProps, type ReactNode } from "react";
import { cn, mergeRefs } from "@ui/utils";
import { ToggleGroupContext } from "./toggle-group.context";
import { toggleGroupVariants } from "./toggle-group.variants";
import { useToggleGroup, type UseToggleGroupOptions } from "./use-toggle-group";

type ToggleGroupBaseProps = Omit<ComponentProps<"div">, "children"> & {
	children: ReactNode;
};

export type ToggleGroupProps = ToggleGroupBaseProps & UseToggleGroupOptions;

function ToggleGroup({
	size = "md",
	variant = "ring",
	orientation = "horizontal",
	children,
	className,
	ref,
	...props
}: ToggleGroupProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	let hookOptions: UseToggleGroupOptions;
	if (props.type === "single") {
		hookOptions = {
			type: "single",
			value: props.value,
			onValueChange: props.onValueChange,
			size,
			variant,
			orientation,
		};
	} else {
		hookOptions = {
			type: "multiple",
			values: props.values,
			onValuesChange: props.onValuesChange,
			size,
			variant,
			orientation,
		};
	}

	const { contextValue, containerProps } = useToggleGroup(hookOptions);

	const combinedRef = mergeRefs(containerRef, ref);

	const {
		type: _type,
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
