import { useId, type ComponentProps, type ReactNode, type Ref } from "react";
import { cn } from "../../utils/cn";
import { Label } from "../label";

type FormFieldRenderProps = {
	id: string;
	"aria-describedby": string | undefined;
	"aria-invalid": boolean | undefined;
};

type FormFieldProps = ComponentProps<"div"> & {
	ref?: Ref<HTMLDivElement>;
	label: string;
	required?: boolean;
	description?: string;
	error?: string;
	children: ReactNode | ((props: FormFieldRenderProps) => ReactNode);
};

function FormField({
	className,
	label,
	required,
	description,
	error,
	children,
	ref,
	...props
}: FormFieldProps) {
	const id = useId();
	const inputId = `${id}-input`;
	const descriptionId = description ? `${id}-description` : undefined;
	const errorId = error ? `${id}-error` : undefined;

	const describedBy =
		[descriptionId, errorId].filter(Boolean).join(" ") || undefined;

	const renderProps: FormFieldRenderProps = {
		id: inputId,
		"aria-describedby": describedBy,
		"aria-invalid": error ? true : undefined,
	};

	return (
		<div ref={ref} className={cn("space-y-1.5", className)} {...props}>
			<Label
				htmlFor={inputId}
				required={required}
				className="text-xs font-medium text-[rgb(var(--color-neutral-foreground-2))] uppercase tracking-wide"
			>
				{label}
			</Label>

			{typeof children === "function" ? children(renderProps) : children}

			{description && !error && (
				<p
					id={descriptionId}
					className="text-xs text-[rgb(var(--color-neutral-foreground-2))]"
				>
					{description}
				</p>
			)}

			{error && (
				<p
					id={errorId}
					className="text-xs text-[rgb(var(--color-status-danger))]"
					role="alert"
				>
					{error}
				</p>
			)}
		</div>
	);
}

export { FormField };
export type { FormFieldProps, FormFieldRenderProps };
