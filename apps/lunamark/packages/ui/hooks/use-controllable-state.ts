"use client";

import { useCallback, useRef, useState } from "react";

type UseControllableStateProps<T> = {
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
};

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
