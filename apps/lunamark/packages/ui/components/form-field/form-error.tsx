import type { ComponentProps } from "react";
import { cn } from "../../utils/cn";

type FormErrorProps = ComponentProps<"p">;

function FormError({ className, ref, ...props }: FormErrorProps) {
	return (
		<p
			ref={ref}
			role="alert"
			className={cn(
				"text-xs text-[rgb(var(--color-status-danger))]",
				className
			)}
			{...props}
		/>
	);
}

export { FormError };
export type { FormErrorProps };
