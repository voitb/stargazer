import type { ComponentProps } from "react";
import { cn } from "../../utils/cn";

type FormDescriptionProps = ComponentProps<"p">;

function FormDescription({ className, ref, ...props }: FormDescriptionProps) {
	return (
		<p
			ref={ref}
			className={cn(
				"text-xs text-[rgb(var(--color-neutral-foreground-2))]",
				className
			)}
			{...props}
		/>
	);
}

export { FormDescription };
export type { FormDescriptionProps };
