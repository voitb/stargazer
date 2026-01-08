"use client";

import type { VariantProps } from "class-variance-authority";
import { useId, useMemo, type ComponentProps } from "react";
import { cn } from "@ui/utils";
import { formFieldVariants } from "./form-field.variants";
import { FormFieldContext } from "./form-field.context";

type FormFieldProps = ComponentProps<"div"> &
	VariantProps<typeof formFieldVariants> & {
		error?: string;
	};

function FormField({
	className,
	error,
	layout,
	size,
	children,
	ref,
	...props
}: FormFieldProps) {
	const id = useId();
	const inputId = `${id}-input`;
	const descriptionId = `${id}-description`;
	const errorId = `${id}-error`;

	const contextValue = useMemo(
		() => ({
			id,
			inputId,
			descriptionId,
			errorId,
			error,
		}),
		[id, inputId, descriptionId, errorId, error]
	);

	return (
		<FormFieldContext.Provider value={contextValue}>
			<div
				ref={ref}
				className={cn(formFieldVariants({ layout, size }), className)}
				{...props}
			>
				{children}
			</div>
		</FormFieldContext.Provider>
	);
}

export { FormField };
export type { FormFieldProps };
