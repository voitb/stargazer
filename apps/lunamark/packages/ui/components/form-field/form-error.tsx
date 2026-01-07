"use client";

import { useFormFieldContext } from "./form-field.context";
import { cn } from "../../utils/cn";
import type { ComponentProps } from "react";

type FormErrorProps = ComponentProps<"p">;

function FormError({ className, children, id, ref, ...props }: FormErrorProps) {
	const { errorId, error } = useFormFieldContext();

	if (!error) {
		return null;
	}

	return (
		<p
			ref={ref}
			id={errorId}
			role="alert"
			className={cn(
				"text-xs text-[rgb(var(--color-status-danger))]",
				className,
			)}
			{...props}
		>
			{children || error}
		</p>
	);
}

export { FormError };
export type { FormErrorProps };
