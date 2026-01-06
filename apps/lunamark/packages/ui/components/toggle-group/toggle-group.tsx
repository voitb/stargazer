"use client";

import type { VariantProps } from "class-variance-authority";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "../../utils/cn";
import {
  toggleGroupVariants,
  toggleGroupItemVariants,
  toggleGroupItemSelectedVariants,
} from "./toggle-group.variants";

type ToggleGroupContextValue = {
  type: "single" | "multiple";
  value: string | null;
  values: string[];
  onItemToggle: (itemValue: string) => void;
  size: "sm" | "md" | "lg";
  variant: "ring" | "contained";
  orientation: "horizontal" | "vertical";
  registerItem: (value: string, element: HTMLButtonElement) => void;
  unregisterItem: (value: string) => void;
  isItemSelected: (value: string) => boolean;
};

const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

function useToggleGroupContext() {
  const context = useContext(ToggleGroupContext);
  if (!context) {
    throw new Error(
      "ToggleGroupItem must be used within a ToggleGroup provider"
    );
  }
  return context;
}

type ToggleGroupSingleProps = {
  type: "single";
  value: string | null;
  onValueChange: (value: string | null) => void;
};

type ToggleGroupMultipleProps = {
  type: "multiple";
  values: string[];
  onValuesChange: (values: string[]) => void;
};

type ToggleGroupBaseProps = ComponentProps<"div"> &
  VariantProps<typeof toggleGroupVariants> & {
    size?: "sm" | "md" | "lg";
    variant?: "ring" | "contained";
    orientation?: "horizontal" | "vertical";
    children: ReactNode;
  };

type ToggleGroupProps = ToggleGroupBaseProps &
  (ToggleGroupSingleProps | ToggleGroupMultipleProps);

function ToggleGroup({
  type,
  size = "md",
  variant = "ring",
  orientation = "horizontal",
  children,
  className,
  ref,
  ...props
}: ToggleGroupProps) {
  const itemsRef = useRef<Map<string, HTMLButtonElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  const isSingle = type === "single";
  const value = isSingle ? (props as ToggleGroupSingleProps).value : null;
  const values = !isSingle ? (props as ToggleGroupMultipleProps).values : [];
  const onValueChange = isSingle
    ? (props as ToggleGroupSingleProps).onValueChange
    : undefined;
  const onValuesChange = !isSingle
    ? (props as ToggleGroupMultipleProps).onValuesChange
    : undefined;

  const registerItem = useCallback(
    (itemValue: string, element: HTMLButtonElement) => {
      itemsRef.current.set(itemValue, element);
    },
    []
  );

  const unregisterItem = useCallback((itemValue: string) => {
    itemsRef.current.delete(itemValue);
  }, []);

  const isItemSelected = useCallback(
    (itemValue: string) => {
      if (isSingle) {
        return value === itemValue;
      }
      return values.includes(itemValue);
    },
    [isSingle, value, values]
  );

  const onItemToggle = useCallback(
    (itemValue: string) => {
      if (isSingle && onValueChange) {
        onValueChange(value === itemValue ? null : itemValue);
      } else if (!isSingle && onValuesChange) {
        const newValues = values.includes(itemValue)
          ? values.filter((v) => v !== itemValue)
          : [...values, itemValue];
        onValuesChange(newValues);
      }
    },
    [isSingle, value, values, onValueChange, onValuesChange]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const items = Array.from(itemsRef.current.values());
      const currentIndex = items.findIndex(
        (el) => el === document.activeElement
      );

      if (currentIndex === -1) return;

      const isHorizontal = orientation === "horizontal";
      let nextIndex: number | null = null;

      switch (event.key) {
        case "ArrowRight":
          if (isHorizontal) {
            nextIndex = (currentIndex + 1) % items.length;
          }
          break;
        case "ArrowLeft":
          if (isHorizontal) {
            nextIndex =
              currentIndex === 0 ? items.length - 1 : currentIndex - 1;
          }
          break;
        case "ArrowDown":
          if (!isHorizontal) {
            nextIndex = (currentIndex + 1) % items.length;
          }
          break;
        case "ArrowUp":
          if (!isHorizontal) {
            nextIndex =
              currentIndex === 0 ? items.length - 1 : currentIndex - 1;
          }
          break;
        case "Home":
          nextIndex = 0;
          break;
        case "End":
          nextIndex = items.length - 1;
          break;
      }

      if (nextIndex !== null) {
        event.preventDefault();
        items[nextIndex]?.focus();
      }
    },
    [orientation]
  );

  const combinedRef = (node: HTMLDivElement | null) => {
    containerRef.current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      (ref as React.RefObject<HTMLDivElement | null>).current = node;
    }
  };

  return (
    <ToggleGroupContext.Provider
      value={{
        type,
        value,
        values,
        onItemToggle,
        size,
        variant,
        orientation,
        registerItem,
        unregisterItem,
        isItemSelected,
      }}
    >
      <div
        ref={combinedRef}
        role={type === "single" ? "radiogroup" : "toolbar"}
        className={cn(toggleGroupVariants({ orientation, variant }), className)}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    </ToggleGroupContext.Provider>
  );
}

type ToggleGroupItemProps = Omit<ComponentProps<"button">, "value"> & {
  value: string;
  children: ReactNode;
};

function ToggleGroupItem({
  value,
  children,
  className,
  ref,
  ...props
}: ToggleGroupItemProps) {
  const {
    size,
    variant,
    registerItem,
    unregisterItem,
    isItemSelected,
    onItemToggle,
    value: groupValue,
    values: groupValues,
    type,
  } = useToggleGroupContext();

  const buttonRef = useRef<HTMLButtonElement>(null);
  const isSelected = isItemSelected(value);

  useEffect(() => {
    const element = buttonRef.current;
    if (element) {
      registerItem(value, element);
    }
    return () => unregisterItem(value);
  }, [value, registerItem, unregisterItem]);

  const combinedRef = (node: HTMLButtonElement | null) => {
    buttonRef.current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      (ref as React.RefObject<HTMLButtonElement | null>).current = node;
    }
  };

  const isFirstFocusable =
    type === "single"
      ? groupValue === null || groupValue === value
      : groupValues.length === 0 || groupValues[0] === value;

  const tabIndex = isSelected || isFirstFocusable ? 0 : -1;

  const ariaProps =
    type === "single"
      ? { role: "radio" as const, "aria-checked": isSelected }
      : { "aria-pressed": isSelected };

  return (
    <button
      ref={combinedRef}
      type="button"
      {...ariaProps}
      data-state={isSelected ? "on" : "off"}
      tabIndex={tabIndex}
      onClick={() => onItemToggle(value)}
      className={cn(
        toggleGroupItemVariants({ size, variant }),
        isSelected && toggleGroupItemSelectedVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export { ToggleGroup, ToggleGroupItem };
export type { ToggleGroupProps, ToggleGroupItemProps };
