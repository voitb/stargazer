"use client";

import { useFormFieldContext } from "./form-field.context";
import { cn } from "../../utils/cn";
import type { ComponentProps } from "react";

type FormDescriptionProps = ComponentProps<"p">;

function FormDescription({ className, id, ref, ...props }: FormDescriptionProps) {
	const { descriptionId } = useFormFieldContext();

	return (
		<p
			ref={ref}
			id={descriptionId}
			className={cn(
				"text-xs text-[rgb(var(--color-neutral-foreground-2))]",
				className,
			)}
			{...props}
		/>
	);
}

export { FormDescription };
export type { FormDescriptionProps };
