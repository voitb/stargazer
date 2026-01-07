"use client";

import { useRef, useState, useTransition } from "react";

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
  const [, startTransition] = useTransition();

  const isControlledRef = useRef(controlledValue !== undefined);
  const isControlled = isControlledRef.current;

  const value = isControlled ? controlledValue! : uncontrolledValue;

  function setValue(nextValue: T) {
    startTransition(() => {
      if (isControlled) {
        onChange?.(nextValue);
      } else {
        setUncontrolledValue(nextValue);
        onChange?.(nextValue);
      }
    });
  }

  return [value, setValue];
}
