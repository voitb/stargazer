"use client";

import { type ComponentProps } from "react";
import { cn } from "../../utils/cn";
import { Label } from "../label";
import { useFormFieldContext } from "./form-field.context";

type FormLabelProps = ComponentProps<typeof Label>;

function FormLabel({ className, children, ref, ...props }: FormLabelProps) {
    const { inputId, error } = useFormFieldContext();

    return (
        <Label
            ref={ref}
            htmlFor={inputId}
            className={cn(
                "text-xs font-medium uppercase tracking-wide",
                error
                    ? "text-[rgb(var(--color-status-danger))]"
                    : "text-[rgb(var(--color-neutral-foreground-2))]",
                className,
            )}
            {...props}
        >
            {children}
        </Label>
    );
}

export { FormLabel };
export type { FormLabelProps };
