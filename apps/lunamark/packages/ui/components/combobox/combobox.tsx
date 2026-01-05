"use client";

import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  size as floatingSize,
  useClick,
  useDismiss,
  useRole,
  useListNavigation,
  useInteractions,
  useTypeahead,
  FloatingPortal,
  FloatingFocusManager,
  type Placement,
  type FloatingContext,
} from "@floating-ui/react";
import type { VariantProps } from "class-variance-authority";
import {
  createContext,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type ComponentProps,
} from "react";
import { cn } from "../../utils/cn";
import { useControllableState } from "../../hooks/use-controllable-state";
import { useExitAnimation } from "../../hooks/use-exit-animation";
import { comboboxInputVariants, comboboxOptionVariants } from "./combobox.variants";

type ComboboxContextValue = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  selectedValue: string | null;
  setSelectedValue: (value: string | null) => void;
  activeIndex: number | null;
  selectActiveItem: () => void;
  getItemProps: (options: { active: boolean }) => Record<string, unknown>;
  getReferenceProps: () => Record<string, unknown>;
  getFloatingProps: () => Record<string, unknown>;
  refs: {
    setReference: (node: HTMLElement | null) => void;
    setFloating: (node: HTMLElement | null) => void;
  };
  floatingStyles: React.CSSProperties;
  placement: Placement;
  listboxId: string;
  listRef: React.MutableRefObject<(HTMLElement | null)[]>;
  labelsRef: React.MutableRefObject<(string | null)[]>;
  optionValuesRef: React.MutableRefObject<(string | null)[]>;
  floatingContext: FloatingContext;
  size: "sm" | "md" | "lg";
  variant: "default" | "error";
  disabled: boolean;
};

const ComboboxContext = createContext<ComboboxContextValue | null>(null);

function useComboboxContext() {
  const context = useContext(ComboboxContext);
  if (!context) {
    throw new Error("Combobox components must be used within a Combobox provider");
  }
  return context;
}

type ComboboxProps = {
  value?: string | null;
  onValueChange?: (value: string | null) => void;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  placeholder?: string;
  placement?: Placement;
  sideOffset?: number;
  children: ReactNode;
  disabled?: boolean;
} & VariantProps<typeof comboboxInputVariants>;

function Combobox({
  value,
  onValueChange,
  inputValue: controlledInputValue,
  onInputChange,
  open,
  onOpenChange,
  placement = "bottom-start",
  sideOffset = 4,
  size = "md",
  variant = "default",
  disabled = false,
  children,
}: ComboboxProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeIndexRef = useRef<number | null>(null);
  activeIndexRef.current = activeIndex;

  const [isOpen, setIsOpenBase] = useControllableState({
    value: open,
    defaultValue: false,
    onChange: onOpenChange,
  });

  const [selectedValue, setSelectedValueBase] = useControllableState({
    value: value,
    defaultValue: null,
    onChange: onValueChange,
  });

  const [inputValue, setInputValueBase] = useControllableState({
    value: controlledInputValue,
    defaultValue: "",
    onChange: onInputChange,
  });

  const listboxId = useId();
  const listRef = useRef<(HTMLElement | null)[]>([]);
  const labelsRef = useRef<(string | null)[]>([]);
  const optionValuesRef = useRef<(string | null)[]>([]);

  const setIsOpen = useCallback(
    (nextOpen: boolean) => {
      setIsOpenBase(nextOpen);
      if (nextOpen) {
        // Clear refs when opening to get fresh list from current options
        listRef.current = [];
        labelsRef.current = [];
        optionValuesRef.current = [];
      } else {
        setActiveIndex(null);
      }
    },
    [setIsOpenBase]
  );

  const setSelectedValue = useCallback(
    (nextValue: string | null) => {
      setSelectedValueBase(nextValue);
    },
    [setSelectedValueBase]
  );

  const setInputValue = useCallback(
    (nextValue: string) => {
      setInputValueBase(nextValue);
    },
    [setInputValueBase]
  );

  const { refs, floatingStyles, context, placement: actualPlacement } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    middleware: [
      offset(sideOffset),
      flip({ fallbackAxisSideDirection: "end" }),
      shift({ padding: 8 }),
      floatingSize({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            minWidth: `${rects.reference.width}px`,
          });
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context, {
    keyboardHandlers: false,
  });

  const dismiss = useDismiss(context, {
    ancestorScroll: true,
  });

  const role = useRole(context, { role: "listbox" });

  const listNavigation = useListNavigation(context, {
    listRef,
    activeIndex,
    selectedIndex: null,
    onNavigate: setActiveIndex,
    loop: true,
    virtual: true,
    allowEscape: true,
  });

  const typeahead = useTypeahead(context, {
    listRef: labelsRef,
    activeIndex,
    onMatch: isOpen ? setActiveIndex : undefined,
    resetMs: 500,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    click,
    dismiss,
    role,
    listNavigation,
    typeahead,
  ]);

  const selectActiveItem = useCallback(() => {
    const currentActiveIndex = activeIndexRef.current;
    if (currentActiveIndex === null) return;
    const optionValue = optionValuesRef.current[currentActiveIndex];
    const label = labelsRef.current[currentActiveIndex];
    if (optionValue !== null && optionValue !== undefined) {
      setSelectedValueBase(optionValue);
      setInputValueBase(label ?? "");
      setIsOpen(false);
    }
  }, [setSelectedValueBase, setInputValueBase, setIsOpen]);

  const contextValue = useMemo(
    () => ({
      isOpen,
      setIsOpen,
      inputValue,
      setInputValue,
      selectedValue,
      setSelectedValue,
      activeIndex,
      selectActiveItem,
      getItemProps: (options: { active: boolean }) =>
        getItemProps({
          ...options,
        }),
      getReferenceProps,
      getFloatingProps,
      refs,
      floatingStyles,
      placement: actualPlacement,
      listboxId,
      listRef,
      labelsRef,
      optionValuesRef,
      floatingContext: context,
      size: size ?? "md",
      variant: variant ?? "default",
      disabled,
    }),
    [
      isOpen,
      setIsOpen,
      inputValue,
      setInputValue,
      selectedValue,
      setSelectedValue,
      activeIndex,
      selectActiveItem,
      getItemProps,
      getReferenceProps,
      getFloatingProps,
      refs,
      floatingStyles,
      actualPlacement,
      listboxId,
      context,
      size,
      variant,
      disabled,
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps -- selectActiveItem uses ref for activeIndex
  );

  return (
    <ComboboxContext.Provider value={contextValue}>
      {children}
    </ComboboxContext.Provider>
  );
}

type ComboboxInputProps = Omit<
  ComponentProps<"input">,
  "value" | "onChange" | "size"
>;

function ComboboxInput({ className, placeholder, disabled: disabledProp, ref, ...props }: ComboboxInputProps) {
  const {
    refs,
    getReferenceProps,
    isOpen,
    listboxId,
    inputValue,
    setInputValue,
    setIsOpen,
    activeIndex,
    selectActiveItem,
    size,
    variant,
    disabled: disabledContext,
  } = useComboboxContext();

  const disabled = disabledProp ?? disabledContext;

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      if (!isOpen) {
        setIsOpen(true);
      }
    },
    [setInputValue, isOpen, setIsOpen]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        if (!isOpen) {
          setIsOpen(true);
        }
      } else if (e.key === "Enter" && isOpen && activeIndex !== null) {
        e.preventDefault();
        selectActiveItem();
      }
    },
    [isOpen, setIsOpen, activeIndex, selectActiveItem]
  );

  const referenceProps = getReferenceProps({
    onKeyDown: handleKeyDown,
  });

  return (
    <input
      {...referenceProps}
      {...props}
      ref={(node) => {
        refs.setReference(node);
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      type="text"
      role="combobox"
      aria-autocomplete="list"
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      aria-controls={isOpen ? listboxId : undefined}
      aria-activedescendant={activeIndex != null ? `${listboxId}-option-${activeIndex}` : undefined}
      aria-invalid={variant === "error" || undefined}
      disabled={disabled}
      placeholder={placeholder}
      className={cn(comboboxInputVariants({ size, variant }), className)}
      value={inputValue}
      onChange={handleInputChange}
    />
  );
}

type ComboboxContentProps = {
  children: ReactNode;
  className?: string;
};

function ComboboxContent({ children, className }: ComboboxContentProps) {
  const {
    isOpen,
    refs,
    floatingStyles,
    getFloatingProps,
    placement,
    listboxId,
    floatingContext,
  } = useComboboxContext();

  const shouldRender = useExitAnimation(isOpen, 150);

  const side = placement.split("-")[0] as "top" | "bottom" | "left" | "right";
  const dataState = isOpen ? "open" : "closed";

  if (!shouldRender) return null;

  return (
    <FloatingPortal>
      <FloatingFocusManager context={floatingContext} modal={false} initialFocus={-1}>
        <div
          {...getFloatingProps()}
          id={listboxId}
          ref={refs.setFloating}
          role="listbox"
          data-floating-content
          data-combobox-content
          data-state={dataState}
          data-side={side}
          style={floatingStyles}
          className={cn(
            "z-50 max-h-60 overflow-auto rounded-md border p-1 shadow-lg",
            "bg-[rgb(var(--color-neutral-background-1))] text-[rgb(var(--color-neutral-foreground-1))] border-[rgb(var(--color-neutral-stroke-1))]",
            className
          )}
        >
          {children}
        </div>
      </FloatingFocusManager>
    </FloatingPortal>
  );
}

type ComboboxOptionProps = {
  value: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
};

function ComboboxOption({
  value,
  children,
  disabled = false,
  className,
}: ComboboxOptionProps) {
  const {
    setIsOpen,
    setSelectedValue,
    setInputValue,
    activeIndex,
    selectedValue,
    listRef,
    labelsRef,
    optionValuesRef,
    listboxId,
    getItemProps,
  } = useComboboxContext();
  const optionRef = useRef<HTMLDivElement>(null);

  const index = useRef<number>(-1);

  const refCallback = useCallback(
    (node: HTMLDivElement | null) => {
      optionRef.current = node;
      if (node) {
        const currentIndex = listRef.current.indexOf(node);
        if (currentIndex === -1) {
          index.current = listRef.current.length;
          listRef.current.push(node);
          labelsRef.current.push(node.textContent);
          optionValuesRef.current.push(disabled ? null : value);
        } else {
          index.current = currentIndex;
        }
      }
    },
    [listRef, labelsRef, optionValuesRef, value, disabled]
  );

  const isHighlighted = activeIndex === index.current;
  const isSelected = selectedValue === value;

  const handleSelect = useCallback(() => {
    if (disabled) return;
    setSelectedValue(value);
    setInputValue(optionRef.current?.textContent ?? "");
    setIsOpen(false);
  }, [disabled, value, setSelectedValue, setInputValue, setIsOpen]);

  return (
    <div
      {...getItemProps({ active: isHighlighted })}
      ref={refCallback}
      id={`${listboxId}-option-${index.current}`}
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled}
      data-combobox-option
      data-highlighted={isHighlighted}
      data-selected={isSelected}
      data-disabled={disabled}
      className={cn(
        comboboxOptionVariants({
          highlighted: isHighlighted,
          selected: isSelected,
          disabled,
        }),
        className
      )}
      onClick={handleSelect}
    >
      {children}
      {isSelected && (
        <span className="ml-auto text-[rgb(var(--color-brand-foreground-1))]">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06l2.72 2.72 6.72-6.72a.75.75 0 0 1 1.06 0Z"
              fill="currentColor"
            />
          </svg>
        </span>
      )}
    </div>
  );
}

type ComboboxEmptyProps = {
  children?: ReactNode;
  className?: string;
};

function ComboboxEmpty({ children, className }: ComboboxEmptyProps) {
  return (
    <div
      className={cn(
        "py-6 text-center text-sm text-[rgb(var(--color-neutral-foreground-2))]",
        className
      )}
    >
      {children ?? "No results found."}
    </div>
  );
}

type ComboboxGroupProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

function ComboboxGroup({ label, children, className }: ComboboxGroupProps) {
  return (
    <div role="group" aria-label={label} className={className}>
      <div className="px-2 py-1.5 text-xs font-semibold text-[rgb(var(--color-neutral-foreground-2))]">
        {label}
      </div>
      {children}
    </div>
  );
}

type ComboboxSeparatorProps = {
  className?: string;
};

function ComboboxSeparator({ className }: ComboboxSeparatorProps) {
  return (
    <div
      role="separator"
      className={cn("-mx-1 my-1 h-px bg-[rgb(var(--color-neutral-stroke-1))]", className)}
    />
  );
}

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxOption,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxSeparator,
};

export type {
  ComboboxProps,
  ComboboxInputProps,
  ComboboxContentProps,
  ComboboxOptionProps,
  ComboboxEmptyProps,
  ComboboxGroupProps,
  ComboboxSeparatorProps,
};
