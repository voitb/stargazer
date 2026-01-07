# Component Architecture Guide

> Rules and patterns for building components in the @ui design system.

---

## Component Types

### 1. Simple Components
Single-element components with CVA variants.

**Examples:** Button, Badge, Input, Checkbox, Toggle

**File Structure:**
```
components/button/
├── button.tsx           # Component
├── button.variants.ts   # CVA definitions
└── index.ts             # Exports
```

### 2. Compound Components
Multiple sub-components sharing state via Context.

**Examples:** Card, ToggleGroup, Avatar (with AvatarGroup)

**File Structure:**
```
components/toggle-group/
├── toggle-group.tsx         # Main + sub-components
├── toggle-group.context.ts  # Context (optional, can be inline)
├── toggle-group.variants.ts # CVA definitions
└── index.ts
```

### 3. Portal-Based Components
Overlay components rendered via portal with behavior hooks.

**Examples:** Dialog, Popover, Dropdown, Tooltip

**File Structure:**
```
components/dialog/
├── dialog.tsx              # Root provider
├── dialog-content.tsx      # Portal + overlay + panel
├── dialog-header.tsx       # Sub-components
├── dialog-footer.tsx
├── dialog-close.tsx
├── dialog.context.ts       # Context definition
├── dialog.variants.ts      # CVA definitions
├── use-dialog.ts           # Unified hook (state + behavior)
└── index.ts
```

---

## Hook Architecture

### The Golden Rule

> **Only extract hooks to `hooks/` folder if they are reusable across many components.**

### Generic Hooks (in `hooks/` folder)

These are reusable across Dialog, Popover, Dropdown, Sheet, etc:

| Hook | Purpose |
|------|---------|
| `useBodyScrollLock` | Lock body scroll when overlay is open |
| `useKeyboardShortcut` | Handle keyboard shortcuts |
| `useControllableState` | Controlled/uncontrolled state pattern |
| `useExitAnimation` | Delay unmount for exit animations |
| `useFocusTrap` | Trap focus within a container |

### Component-Specific Hooks (in component folder)

All component-specific logic goes in **ONE** hook file:

```
components/dialog/
└── use-dialog.ts    # ALL dialog logic in ONE file
```

**NOT split like this:**
```
components/dialog/
├── use-dialog.ts           # ❌ DON'T split
└── use-dialog-behavior.ts  # ❌ into multiple files
```

### Decision Tree: Should I Extract This Hook?

```
Is this logic used by 3+ different components?
  └── YES → Extract to hooks/ folder
  └── NO  → Keep in component folder as single use-[component].ts
```

---

## Hook Pattern: Unified Component Hook

For portal-based components, create a single hook that handles both state AND behavior:

```typescript
// use-dialog.ts - EVERYTHING in one file
export function useDialog(options: UseDialogOptions): UseDialogReturn {
  const {
    // State options
    defaultOpen = false,
    open: controlledOpen,
    onOpenChange,
    // Behavior options
    closeOnBackdropClick = true,
    closeOnEscape = true,
    preventScroll = true,
  } = options;

  // State management (using generic hook)
  const [isOpen, setOpen] = useControllableState({
    value: controlledOpen,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  // Ref for focus trap
  const contentRef = useRef<HTMLDivElement>(null);

  // Behavior: compose generic hooks
  useBodyScrollLock(isOpen && preventScroll);
  useFocusTrap(contentRef, isOpen);
  useKeyboardShortcut({
    key: "Escape",
    handler: () => setOpen(false),
    enabled: isOpen && closeOnEscape,
    ignoreInputFields: false,
  });

  const shouldRender = useExitAnimation(isOpen, 150);

  const handleBackdropClick = useCallback(/* ... */);

  return {
    // State
    open: isOpen,
    setOpen,
    // Behavior
    contentRef,
    shouldRender,
    handleBackdropClick,
    dataState: isOpen ? "open" : "closed",
    // Prop getters (for headless usage)
    getTriggerProps: () => ({ /* ... */ }),
    getContentProps: () => ({ /* ... */ }),
    // ...
  };
}
```

---

## Context Patterns

### When to Separate Context

For portal-based components, separate context into `*.context.ts`:

```typescript
// dialog.context.ts
export type DialogContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  closeOnBackdropClick: boolean;
  titleId: string;
  descriptionId: string;
};

export const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialogContext(componentName: string): DialogContextValue {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error(
      `<${componentName}> must be used within a <Dialog> provider`
    );
  }
  return context;
}
```

**Key pattern:** Include the component name in the error message for better debugging.

### For Simpler Components

Context can be inline in the main component file:

```typescript
// toggle-group.tsx
const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

function useToggleGroupContext(componentName: string) {
  const context = useContext(ToggleGroupContext);
  if (!context) {
    throw new Error(
      `<${componentName}> must be used within a <ToggleGroup> provider`
    );
  }
  return context;
}
```

---

## Styling Patterns

### CVA Variants File

Always separate CVA definitions into `*.variants.ts`:

```typescript
// dialog.variants.ts
import { cva } from "class-variance-authority";

export const dialogContentVariants = cva(
  [
    "relative z-50 w-full gap-4 border p-6 shadow-lg",
    "bg-[rgb(var(--color-neutral-background-1))]",
    "text-[rgb(var(--color-neutral-foreground-1))]",
    "border-[rgb(var(--color-neutral-stroke-1))]",
    "rounded-lg",
  ],
  {
    variants: {
      size: {
        sm: "max-w-sm",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        full: "max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]",
      },
    },
    defaultVariants: { size: "md" },
  }
);
```

### Token Usage Rule

**ALWAYS wrap CSS variables in `rgb()`:**

```tsx
// ✅ CORRECT
className="bg-[rgb(var(--color-brand-background))]"
className="text-[rgb(var(--color-neutral-foreground-1))]"
className="bg-[rgb(var(--color-brand-background)/0.8)]"  // with opacity

// ❌ WRONG
className="bg-[var(--color-brand-background)]"  // missing rgb()
className="bg-blue-600"  // hardcoded - breaks theming
```

### Animation with data-state

Use `data-state` attribute for CSS animations:

```tsx
<div data-state={isOpen ? "open" : "closed"}>
  {/* Content */}
</div>
```

```css
/* animations.css */
[data-dialog-content][data-state="open"] {
  animation: ui-zoom-in var(--duration-fast) var(--easing-ease-out);
}
[data-dialog-content][data-state="closed"] {
  animation: ui-zoom-out var(--duration-fast) var(--easing-ease-in);
}
```

---

## Ref Management

### Ref Merging for Portals

Portal components need to merge internal refs (for behavior) with forwarded refs (for consumers):

```typescript
// import { mergeRefs } from "@ui/utils";
function DialogContent({ ref, ...props }: DialogContentProps) {
  const { contentRef } = useDialog({ /* ... */ });

  // Combine internal ref with forwarded ref
  const combinedRef = mergeRefs(contentRef, ref);

  return <div ref={combinedRef}>...</div>;
}
```

---

## File Organization Checklist

### For Simple Components
- [ ] `[name].tsx` - Component
- [ ] `[name].variants.ts` - CVA definitions
- [ ] `index.ts` - Exports

### For Compound Components
- [ ] `[name].tsx` - Main component + sub-components
- [ ] `[name].variants.ts` - CVA definitions
- [ ] `[name].context.ts` - Context (optional)
- [ ] `index.ts` - Exports

### For Portal-Based Components
- [ ] `[name].tsx` - Root provider
- [ ] `[name]-content.tsx` - Portal content
- [ ] `[name]-*.tsx` - Other sub-components
- [ ] `[name].context.ts` - Context definition
- [ ] `[name].variants.ts` - CVA definitions
- [ ] `use-[name].ts` - **Single** hook with all logic
- [ ] `index.ts` - Exports

---

## Export Patterns

### Component Index

```typescript
// index.ts
// Compound components
export { Dialog } from "./dialog";
export { DialogContent } from "./dialog-content";
export { DialogHeader, DialogTitle, DialogDescription } from "./dialog-header";
export { DialogFooter } from "./dialog-footer";
export { DialogClose } from "./dialog-close";

// Headless hook
export { useDialog } from "./use-dialog";

// Context (for advanced customization)
export { useDialogContext, DialogContext } from "./dialog.context";

// Types
export type { DialogProps } from "./dialog";
export type { DialogContentProps } from "./dialog-content";
export type { UseDialogOptions, UseDialogReturn } from "./use-dialog";

// Variants (for styling customization)
export { dialogContentVariants, dialogOverlayVariants } from "./dialog.variants";
```

---

## Testing Patterns

### What to Test

| Component Type | Test Focus |
|----------------|------------|
| Simple | Renders, variants apply, events fire, ref forwarding |
| Compound | Context works, sub-components interact correctly |
| Portal | Open/close, exit animation, focus trap, escape key, backdrop click |

### Testing Behaviors

```typescript
// Exit animation
it("uses data-state for exit animation", async () => {
  vi.useFakeTimers();
  const { rerender } = render(<Dialog open={true}><DialogContent>...</DialogContent></Dialog>);

  rerender(<Dialog open={false}><DialogContent>...</DialogContent></Dialog>);
  expect(screen.getByRole("dialog")).toHaveAttribute("data-state", "closed");

  await act(() => vi.advanceTimersByTime(150));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  vi.useRealTimers();
});

// Escape key
it("closes on Escape key", () => {
  const onOpenChange = vi.fn();
  render(<Dialog open={true} onOpenChange={onOpenChange}>...</Dialog>);
  fireEvent.keyDown(document, { key: "Escape" });
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

// Backdrop click
it("closes on backdrop click when enabled", () => {
  const onOpenChange = vi.fn();
  render(<Dialog open={true} onOpenChange={onOpenChange}><DialogContent data-testid="content">...</DialogContent></Dialog>);
  fireEvent.click(screen.getByTestId("content").parentElement!);
  expect(onOpenChange).toHaveBeenCalledWith(false);
});
```

---

## Summary: Key Rules

1. **Hook separation**: Only extract to `hooks/` if reusable across 3+ components
2. **Single hook per component**: All component-specific logic in ONE `use-[name].ts` file
3. **CVA in separate file**: Always use `*.variants.ts` for styling
4. **Token wrapper**: Always use `rgb(var(--token-name))` for colors
5. **Context errors**: Include component name in error messages
6. **Ref merging**: Combine internal + forwarded refs in portal components
7. **data-state**: Use for animation states, not inline styles
