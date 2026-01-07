"use client";

import { useId, type ComponentProps } from "react";
import { cn } from "../../utils/cn";
import { FormFieldContext } from "./form-field.context";

type FormFieldProps = ComponentProps<"div"> & {
	error?: string;
};

function FormField({
	className,
	error,
	children,
	ref,
	...props
}: FormFieldProps) {
	const id = useId();
	const inputId = `${id}-input`;
	const descriptionId = `${id}-description`;
	const errorId = `${id}-error`;

	return (
		<FormFieldContext.Provider
			value={{
				id,
				inputId,
				descriptionId,
				errorId,
				error,
			}}
		>
			<div ref={ref} className={cn("space-y-1.5", className)} {...props}>
				{children}
			</div>
		</FormFieldContext.Provider>
	);
}

export { FormField };
export type { FormFieldProps };
