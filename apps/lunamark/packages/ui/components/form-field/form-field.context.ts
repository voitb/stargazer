import { createContext, useContext } from "react";

export type FormFieldContextValue = {
	id: string;
	inputId: string;
	descriptionId: string;
	errorId: string;
	error?: string;
};

export const FormFieldContext = createContext<FormFieldContextValue | null>(
	null,
);

export function useFormFieldContext() {
	const context = useContext(FormFieldContext);
	if (!context) {
		throw new Error(
			"FormField sub-components must be used within a FormField provider",
		);
	}
	return context;
}
