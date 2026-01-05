import { useCallback, useRef, useState } from "react";

type UseControllableStateProps<T> = {
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
};

/**
 * Manages state that can be either controlled (value passed from props)
 * or uncontrolled (managed internally). Follows React's controlled component pattern.
 *
 * The controlled mode is determined once at component mount and remains stable
 * for the component's lifetime (matching Radix UI behavior).
 *
 * @example
 * // Uncontrolled usage - onChange is still called!
 * const [isOpen, setIsOpen] = useControllableState({
 *   defaultValue: false,
 *   onChange: (value) => console.log('Changed to:', value),
 * });
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

  // Stable reference to initial controlled mode - prevents mode switching bugs
  const isControlledRef = useRef(controlledValue !== undefined);
  const isControlled = isControlledRef.current;

  const value = isControlled ? controlledValue! : uncontrolledValue;

  const setValue = useCallback(
    (nextValue: T) => {
      if (isControlled) {
        onChange?.(nextValue);
      } else {
        setUncontrolledValue(nextValue);
        onChange?.(nextValue);
      }
    },
    [isControlled, onChange]
  );

  return [value, setValue];
}
