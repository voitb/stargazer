"use client";

import { type ReactNode } from "react";
import { useFormFieldContext } from "./form-field.context";

export type FormControlRenderProps = {
    id: string;
    "aria-describedby": string | undefined;
    "aria-invalid": boolean | undefined;
};

type FormControlProps = {
    children: (props: FormControlRenderProps) => ReactNode;
};

function FormControl({ children }: FormControlProps) {
    const { inputId, descriptionId, errorId, error } =
        useFormFieldContext("FormControl");

    const describedBy = `${descriptionId} ${errorId}`;

    const renderProps: FormControlRenderProps = {
        id: inputId,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
    };

    return <>{children(renderProps)}</>;
}

export { FormControl };
