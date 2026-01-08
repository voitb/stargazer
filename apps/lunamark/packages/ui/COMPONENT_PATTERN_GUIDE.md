# Component Pattern Guide

> AI-focused documentation for the Lunamark Design System. Use this guide when generating, modifying, or reviewing UI components.

---

## AI System Prompt

When working with the Lunamark UI components, ALWAYS follow these rules:

### Critical Rules (Non-Negotiable)

1. **Token Format**: ALL colors MUST use `rgb(var(--token-name))` wrapper
   - ✅ `className="bg-[rgb(var(--color-brand-background))]"`
   - ❌ `className="bg-[var(--color-brand-background)]"`
   - ❌ `className="bg-blue-600"`

2. **File Structure**: Only create `*.variants.ts` when the component exposes variants; inline Tailwind classes when there are no variants
   - Basic: `[name].tsx`, `[name].variants.ts` (if variants), `index.ts`
   - Compound: `[name].tsx`, `[name].context.ts`, `[name].variants.ts` (if variants), `index.ts`
   - Portal: `[name].tsx`, `use-[name].ts`, `[name].context.ts`, `[name].variants.ts` (if variants), `index.ts`

3. **TypeScript Pattern**: Use `ComponentProps<"element">` for base types (React 19+)
   - ✅ `type Props = ComponentProps<"button"> & VariantProps<typeof variants>`
   - ❌ `type Props = ComponentPropsWithoutRef<"button">` (legacy)

4. **Export Pattern**: Barrel exports MUST include component + types, and include variants only when they exist
   ```ts
   export { Component } from "./component";
   export type { ComponentProps } from "./component";
   export { componentVariants } from "./component.variants"; // only if variants exist
   ```

5. **Testing**: Test BEHAVIOR, not implementation
   - ✅ Test: rendering, state changes, accessibility, API contracts
   - ❌ Test: CSS class names, visual appearance, internal timers

6. **Accessibility**: Interactive elements MUST have proper ARIA attributes
   - Buttons: `aria-busy` for loading states
   - Forms: `htmlFor`, `aria-describedby`, `aria-invalid`
   - Modals: `role="dialog"`, `aria-modal="true"`

7. **Context Stability**: Provider values MUST be memoized with `useMemo`; use `useCallback` only for functions stored in the provider value or used in effects/ref callbacks

8. **data-slot**: Keep `data-slot` attributes on public components for styling and testing hooks

---

## Quick Reference

### Component Type Decision Matrix

| Component Type | Pattern | Example |
|----------------|---------|---------|
| **Basic** | CVA + Props | Button, Badge, Input, Checkbox, Toggle |
| **Compound** | Context + Sub-components | ToggleGroup, Avatar, Card |
| **Portal** | Portal + Animation + Floating UI | Dialog, Dropdown, Popover, Tooltip |
| **Form Field** | Render Props + Accessibility | FormField with auto-wired ARIA |

### File Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Files | kebab-case | `chat-header.tsx`, `use-auth.ts` |
| Component exports | PascalCase | `export function Button` |
| Hook exports | camelCase with `use` prefix | `export function useButton()` |
| Functions | camelCase | `handleSubmit()` |
| Boolean props | prefix: `is`, `has`, `should` | `isLoading`, `hasError` |
| Constants | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |
| Types/Interfaces | PascalCase (no `I` prefix) | `ButtonProps`, `FormFieldOptions` |

### Import Alias Rule

- Use `@ui/*` when the relative path would climb more than one `../`.
- Keep `./` or `../` for same-folder or single-level imports.

### Color Token Quick Reference

| Usage | Token |
|-------|-------|
| Primary backgrounds | `--color-brand-background` |
| Primary text | `--color-brand-foreground-1` |
| Secondary backgrounds | `--color-neutral-background-2` |
| Primary text | `--color-neutral-foreground-1` |
| Borders | `--color-neutral-stroke-1` |
| Error | `--color-status-danger` |
| Success | `--color-status-success` |
| Warning | `--color-status-warning` |

---

## Component Type Templates

### Pattern 1: Basic Component with CVA

**Use for:** Button, Badge, Input, Textarea, Select, Checkbox, Toggle, Label, KeyboardHint

**File Structure:**
```
components/[name]/
├── [name].tsx           # Component implementation
├── [name].variants.ts   # CVA variant definitions (only if variants exist)
└── index.ts             # Barrel exports
```

**Template - `[name].variants.ts`:**
```ts
import { cva } from "class-variance-authority";

export const [name]Variants = cva(
  // Base classes (shared across all variants)
  "base-classes-here",
  {
    variants: {
      variant: {
        default: "default-variant-classes",
        alternate: "alternate-variant-classes",
      },
      size: {
        sm: "size-sm-classes",
        md: "size-md-classes",
        lg: "size-lg-classes",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);
```

**Template - `[name].tsx`:**
```tsx
import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@ui/utils";
import { [name]Variants } from "./[name].variants";

type [Name]Props = ComponentProps<"button"> &
  VariantProps<typeof [name]Variants> & {
    // Custom props here
    isLoading?: boolean;
  };

function [Name]({
  className,
  variant,
  size,
  isLoading,
  children,
  ref,
  ...props
}: [Name]Props) {
  const computedClassName = cn([name]Variants({ variant, size, className }));

  return (
    <button
      ref={ref}
      className={computedClassName}
      disabled={isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {children}
    </button>
  );
}

export { [Name] };
export type { [Name]Props };
```

**Template - `index.ts`:**
```ts
export { [Name] } from "./[name]";
export type { [Name]Props } from "./[name]";
export { [name]Variants } from "./[name].variants"; // only if variants exist
```

---

### Pattern 2: Compound Component with Context

**Use for:** ToggleGroup, Avatar, Card

**File Structure:**
```
components/[name]/
├── [name].tsx           # Main + sub-components
├── [name].context.ts    # Context definition
├── [name].variants.ts   # CVA definitions (only if variants exist)
└── index.ts             # Barrel exports
```

**Template - `[name].context.ts`:**
```ts
import { createContext, useContext } from "react";

export type [Name]ContextValue = {
  // State shared across components
  value: string | null;
  onValueChange: (value: string) => void;
  // Configuration
  size: "sm" | "md" | "lg";
};

export const [Name]Context = createContext<[Name]ContextValue | null>(null);

export function use[Name]Context() {
  const context = useContext([Name]Context);
  if (!context) {
    throw new Error("[Name]Item must be used within a [Name] provider");
  }
  return context;
}
```

**Template - `[name].tsx`:**
```tsx
import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@ui/utils";
import { [name]Variants } from "./[name].variants";
import {
  [Name]Context,
  type [Name]ContextValue,
  use[Name]Context,
} from "./[name].context";

type [Name]Props = ComponentProps<"div"> &
  VariantProps<typeof [name]Variants> & {
    value?: string;
    onValueChange?: (value: string) => void;
    children: ReactNode;
  };

function [Name]({
  children,
  value: controlledValue,
  onValueChange,
  size = "md",
  ref,
  ...props
}: [Name]Props) {
  const [uncontrolledValue, setUncontrolledValue] = useState<string | null>(null);

  const value = controlledValue ?? uncontrolledValue;
  const handleValueChange = (newValue: string) => {
    onValueChange?.(newValue);
    setUncontrolledValue(newValue);
  };

  const contextValue: [Name]ContextValue = {
    value,
    onValueChange: handleValueChange,
    size,
  };

  return (
    <[Name]Context.Provider value={contextValue}>
      <div ref={ref} {...props}>
        {children}
      </div>
    </[Name]Context.Provider>
  );
}

// Sub-component
function [Name]Item({ value, children }: { value: string; children: ReactNode }) {
  const { value: selectedValue, onValueChange, size } = use[Name]Context();
  const isSelected = value === selectedValue;

  return (
    <button
      data-state={isSelected ? "on" : "off"}
      onClick={() => onValueChange(value)}
      className={cn(itemVariants({ size }))}
    >
      {children}
    </button>
  );
}

export { [Name], [Name]Item };
export type { [Name]Props };
```

---

### Pattern 3: Portal Component with Floating UI

**Use for:** Dialog, Dropdown, Popover, Tooltip

**File Structure:**
```
components/[name]/
├── [name].tsx           # Root provider
├── [name]-content.tsx   # Portal content
├── [name]-trigger.tsx   # Trigger button
├── use-[name].ts        # Unified hook with all logic
├── [name].context.ts    # Context definition
├── [name].variants.ts   # CVA definitions (only if variants exist)
└── index.ts             # Barrel exports
```

**Template - `use-[name].ts`:**
```ts
import { useState, useCallback, useEffect, useRef } from "react";

export function use[Name](options: Use[Name]Options): Use[Name]Return {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Exit animation - delays unmount for close animation
  const shouldRender = useExitAnimation(isOpen, 150);

  // Focus trap - keyboard focus stays within [name]
  useFocusTrap(contentRef, isOpen);

  // Escape key handling
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  return {
    isOpen,
    setIsOpen,
    shouldRender,
    contentRef,
  };
}
```

**Template - `[name]-content.tsx`:**
```tsx
import { createPortal } from "react";
import { use[Name]Context } from "./[name].context";

export function [Name]Content({ children, className }: [Name]ContentProps) {
  const { isOpen, shouldRender, contentRef, setIsOpen } = use[Name]Context();

  if (!shouldRender) return null;

  const dataState = isOpen ? "open" : "closed";

  return createPortal(
    <div data-state={dataState}>
      {/* Overlay */}
      <div
        data-[name]-overlay
        data-state={dataState}
        className="fixed inset-0 bg-[rgb(var(--color-overlay))/0.5)]"
        onClick={() => setIsOpen(false)}
      />

      {/* Content */}
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        data-[name]-content
        data-state={dataState}
        className={cn("...", className)}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
```

---

### Pattern 4: Form Field with Accessibility

**Use for:** FormField with auto-wired ARIA attributes via render props

**File Structure:**
```
components/form-field/
├── form-field.tsx         # Main component + sub-components
├── form-field.context.ts  # Context with ID management
├── form-field.variants.ts # CVA variants
├── form-label.tsx         # Label sub-component
├── form-description.tsx   # Description sub-component
├── form-error.tsx         # Error sub-component
├── form-control.tsx       # Render props wrapper
└── index.ts               # Barrel exports
```

**Key Feature - Render Props for Accessibility:**
```tsx
// Usage with render props (recommended)
<FormField label="Email" error={errors.email} description="We'll never share it">
  {(inputProps) => (
    <Input {...inputProps} value={email} onChange={setEmail} />
  )}
</FormField>

// Render props provided:
type FormFieldRenderProps = {
  id: string;                         // For htmlFor association
  "aria-describedby": string | undefined; // Links to description/error
  "aria-invalid": boolean | undefined;    // Error state
};
```

---

## System Prompts for AI Generation

### Generate Basic Component

```
You are generating a basic UI component for the Lunamark Design System.

REQUIREMENTS:
1. Create [name].tsx, index.ts, and add [name].variants.ts **only if the component exposes variants**
2. Use CVA (class-variance-authority) for variants when applicable
3. ALL colors MUST use rgb(var(--token-name)) format
4. Use ComponentProps<"element"> for base types
5. Export component, types, and variants from index.ts
6. Include accessibility attributes (aria-*) where applicable

COMPONENT SPEC:
- Name: [ComponentName]
- Base element: [button|div|input|etc]
- Variants: [list variants]
- Sizes: [list sizes]
- Default: [default variant and size]

Follow the Button component as the reference implementation.
```

### Review Component

```
You are reviewing a UI component for compliance with the Lunamark Design System patterns.

CHECKLIST:
- [ ] Has separate *.variants.ts file with CVA definitions (only if the component exposes variants)
- [ ] ALL colors use rgb(var(--token-name)) format (no var(--token), no hardcoded colors)
- [ ] Uses ComponentProps<"element"> for base types (React 19+ pattern)
- [ ] Exports component + types, and variants only when they exist
- [ ] Files use kebab-case naming
- [ ] Component exports use PascalCase
- [ ] Has behavior-focused tests (not CSS class tests)
- [ ] Interactive elements have proper ARIA attributes

If any item fails, describe the issue and suggest the fix.
```

---

## Reference Implementations

### Button (Basic CVA Pattern)

**File:** `packages/ui/components/button/button.variants.ts`
```ts
import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-[rgb(var(--color-brand-background))] text-[rgb(var(--color-brand-foreground-on-brand))] hover:bg-[rgb(var(--color-brand-background-hover))] focus-visible:ring-[rgb(var(--color-brand-background))]",
        secondary:
          "bg-[rgb(var(--color-neutral-background-3))] text-[rgb(var(--color-neutral-foreground-1))] hover:bg-[rgb(var(--color-neutral-background-3-hover))]",
        outline:
          "border border-[rgb(var(--color-neutral-stroke-1))] bg-transparent text-[rgb(var(--color-neutral-foreground-1))] hover:bg-[rgb(var(--color-neutral-background-2))]",
        ghost:
          "text-[rgb(var(--color-neutral-foreground-1))] hover:bg-[rgb(var(--color-neutral-background-2))]",
        danger:
          "bg-[rgb(var(--color-status-danger))] text-[rgb(var(--color-neutral-foreground-inverted))] hover:opacity-90 focus-visible:ring-[rgb(var(--color-status-danger))]",
        link: "text-[rgb(var(--color-brand-foreground-1))] underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);
```

**File:** `packages/ui/components/button/button.tsx`
```tsx
import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@ui/utils";
import { buttonVariants } from "./button.variants";
import { Spinner } from "../icons";

type ButtonRenderProps = {
  className: string;
  disabled: boolean;
  isLoading: boolean;
} & Omit<ComponentProps<"button">, "className" | "disabled" | "children">;

type ButtonProps = Omit<ComponentProps<"button">, "children"> &
  VariantProps<typeof buttonVariants> & {
    isLoading?: boolean;
    children?: ReactNode | ((props: ButtonRenderProps) => ReactNode);
  };

function Button({
  className,
  variant,
  size,
  isLoading = false,
  disabled = false,
  children,
  ref,
  ...props
}: ButtonProps) {
  const computedClassName = cn(buttonVariants({ variant, size, className }));
  const computedDisabled = disabled || isLoading;

  if (typeof children === "function") {
    return children({
      className: computedClassName,
      disabled: computedDisabled,
      isLoading,
      ref,
      ...props,
    });
  }

  return (
    <button
      ref={ref}
      type="button"
      className={computedClassName}
      disabled={computedDisabled}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading && <Spinner size="sm" />}
      {children}
    </button>
  );
}

export { Button };
export type { ButtonProps, ButtonRenderProps };
```

**File:** `packages/ui/components/button/index.ts`
```ts
export { Button } from "./button";
export type { ButtonProps, ButtonRenderProps } from "./button";
export { buttonVariants } from "./button.variants";
```

---

## Anti-Patterns Detection

### Common Mistakes to Avoid

| Issue | Wrong | Correct |
|-------|-------|---------|
| **Missing rgb() wrapper** | `bg-[var(--color-brand-background)]` | `bg-[rgb(var(--color-brand-background))]` |
| **Hardcoded colors** | `className="bg-blue-600"` | `className="bg-[rgb(var(--color-brand-background))]"` |
| **Missing variants.ts (when variants exist)** | CVA in component file | Separate `[name].variants.ts` file |
| **Variants file without variants** | Base-only CVA file | Inline classes in the component |
| **Incomplete exports** | Only export component | Export component + types, and variants only when they exist |
| **Testing CSS classes** | `expect(element).toHaveClass("bg-blue-600")` | `expect(element).toHaveAttribute("aria-busy", "true")` |
| **Legacy TypeScript** | `ComponentPropsWithoutRef<"button">` | `ComponentProps<"button">` (React 19+) |
| **No accessibility** | `<button>Click</button>` | `<button aria-busy={isLoading}>Click</button>` |

### Detection Checklist

Before committing, check for:
- [ ] No `var(--token)` without `rgb()` wrapper
- [ ] No hardcoded Tailwind colors (`bg-blue-600`, `text-red-500`)
- [ ] Components with variants have `*.variants.ts` files; components without variants inline classes
- [ ] `index.ts` exports variants only when they exist
- [ ] Tests don't assert on CSS class names
- [ ] Interactive elements have proper ARIA attributes

---

## Validation Checklist

### Pre-Commit Verification

**File Structure:**
- [ ] Files use kebab-case naming (`my-component.tsx`)
- [ ] Variants in separate `*.variants.ts` file when the component exposes variants
- [ ] Context in separate `*.context.ts` file (if compound)
- [ ] Tests in `*.test.tsx` file

**Code Quality:**
- [ ] All colors use `rgb(var(--token-name))` format
- [ ] No hardcoded Tailwind colors
- [ ] Uses semantic tokens (not `--color-blue-600`)
- [ ] Uses `cn()` for className merging

**TypeScript:**
- [ ] Uses `ComponentProps<"element">` for base types
- [ ] Properly extends variant props with `VariantProps<typeof>`
- [ ] Exports all types from index.ts
- [ ] No `as any` casts

**Exports:**
- [ ] Exports component: `export { Component }`
- [ ] Exports types: `export type { ComponentProps }`
- [ ] Exports variants when they exist: `export { componentVariants }`
- [ ] Exports context (if applicable)

**Testing:**
- [ ] Tests behavior (rendering, state, events)
- [ ] Tests accessibility (ARIA attributes)
- [ ] Tests API contracts (props, ref, events)
- [ ] Does NOT test CSS class names

**Accessibility:**
- [ ] Buttons have `aria-busy` for loading
- [ ] Forms have `htmlFor`, `aria-describedby`, `aria-invalid`
- [ ] Modals have `role="dialog"`, `aria-modal="true"`
- [ ] Focus management for overlays

---

## Additional Resources

### Related Documentation
- `CLAUDE.md` - Full component catalog and token reference
- `COMPONENT_ARCHITECTURE.md` - Architecture decisions
- `DESIGN_DECISIONS.md` - Design rationale
- `IMPLEMENTATION.md` - Implementation details
- `AI_COMPONENT_UNIFICATION.md` - Unified AI component and hook rules

### Reference Components
- `components/button/` - Basic CVA pattern
- `components/toggle-group/` - Context-based compound
- `components/dialog/` - Portal + animation + accessibility
- `components/form-field/` - Render props + ARIA wiring
