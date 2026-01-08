"use client";

import type { VariantProps } from "class-variance-authority";
import type { ChangeEvent, ComponentProps } from "react";
import { useEffect, useRef } from "react";
import { useControllableState } from "@ui/hooks/state/use-controllable-state";
import { cn } from "@ui/utils";
import { mergeRefs } from "@ui/utils";
import { checkboxVariants } from "./checkbox.variants";

type CheckboxProps = Omit<
  ComponentProps<"input">,
  "type" | "size" | "onChange"
> &
  VariantProps<typeof checkboxVariants> & {
    indeterminate?: boolean;
    onChange?: (checked: boolean) => void;
  };

function Checkbox({
  className,
  size,
  ref,
  indeterminate,
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  ...props
}: CheckboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [isChecked, setIsChecked] = useControllableState({
    value: controlledChecked,
    defaultValue: defaultChecked,
    onChange,
  });

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate ?? false;
    }
  }, [indeterminate]);

  const dataState = indeterminate
    ? "indeterminate"
    : isChecked
      ? "checked"
      : "unchecked";

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setIsChecked(event.target.checked);
  };

  const combinedRef = mergeRefs(inputRef, ref);

  return (
    <input
      ref={combinedRef}
      type="checkbox"
      checked={isChecked}
      data-state={dataState}
      className={cn(checkboxVariants({ size }), className)}
      onChange={handleChange}
      {...props}
    />
  );
}

export { Checkbox };
export type { CheckboxProps };
