import { useCallback, useState } from "react";

type UseControllableStateProps<T> = {
	value?: T;
	defaultValue: T;
	onChange?: (value: T) => void;
};

/**
 * Manages state that can be either controlled (value passed from props)
 * or uncontrolled (managed internally). Follows React's controlled component pattern.
 *
 * @example
 * // Uncontrolled usage
 * const [isOpen, setIsOpen] = useControllableState({ defaultValue: false });
 *
 * @example
 * // Controlled usage
 * const [isOpen, setIsOpen] = useControllableState({
 *   value: props.open,
 *   defaultValue: false,
 *   onChange: props.onOpenChange,
 * });
 */
export function useControllableState<T>({
	value: controlledValue,
	defaultValue,
	onChange,
}: UseControllableStateProps<T>): [T, (value: T) => void] {
	const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);

	const isControlled = controlledValue !== undefined;
	const value = isControlled ? controlledValue : uncontrolledValue;

	const setValue = useCallback(
		(nextValue: T) => {
			if (isControlled) {
				onChange?.(nextValue);
			} else {
				setUncontrolledValue(nextValue);
			}
		},
		[isControlled, onChange]
	);

	return [value, setValue];
}
