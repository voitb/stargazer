# @ui - Lunamark Design System

> AI-first documentation for the Fluent 2-inspired design system. Optimized for context persistence.

---

## QUICK START

### Package Import Map

```ts
// Components
import { Button, Badge, Avatar, Card, Dialog, Input, Textarea, Select, Toggle, ToggleGroup, Checkbox, Tooltip } from "@ui/components";

// Compound components
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@ui/components";
import { ToggleGroup, ToggleGroupItem } from "@ui/components";
import { Avatar, AvatarGroup, SelectableAvatar } from "@ui/components";
import { Tooltip, TooltipTrigger, TooltipContent } from "@ui/components";

// Hooks
import { useTheme, useControllableState, useExitAnimation, useFocusTrap } from "@ui/hooks";

// Utilities
import { cn } from "@ui/utils";

// CSS (import in app entry point)
import "@ui/styles/tokens.css";
import "@ui/styles/animations.css";
```

### Critical Pattern: CSS Variable Usage

Colors use RGB space format for opacity control. **Always wrap in `rgb()`**:

```tsx
// CORRECT: wrap in rgb() function
className="bg-[rgb(var(--color-brand-background))]"
className="text-[rgb(var(--color-neutral-foreground-1))]"
className="bg-[rgb(var(--color-neutral-background-2)/0.8)]"  // with opacity

// WRONG: missing rgb() wrapper - will NOT work
className="bg-[var(--color-brand-background)]"
className="bg-blue-600"  // hardcoded - breaks theming
```

---

## ARCHITECTURE

### Two-Layer Token System

```
┌─────────────────────────────────────────────────────────────────┐
│ Layer 1: GLOBAL TOKENS (Never use directly in components)       │
│ Location: tokens/global/                                         │
│ Values: "37 99 235" (RGB space format, no rgb())                │
│ Files: colors.ts, typography.ts, spacing.ts, radius.ts, motion.ts│
└───────────────────────────────────┬─────────────────────────────┘
                                    │ mapped by themes
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│ Layer 2: ALIAS TOKENS (Semantic meaning)                        │
│ Location: tokens/alias/                                          │
│ Names: colorBrandBackground, colorNeutralForeground1, etc.      │
│ Files: colors.ts (ColorAliasTokens type), typography.ts         │
└───────────────────────────────────┬─────────────────────────────┘
                                    │ output to
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│ CSS CUSTOM PROPERTIES                                           │
│ Location: styles/tokens.css                                      │
│ Usage: rgb(var(--color-brand-background))                       │
│ Themes: :root (light), [data-theme="dark"]                      │
└─────────────────────────────────────────────────────────────────┘
```

### File Organization

```
packages/ui/
├── index.ts                  # Main barrel export
├── tokens/
│   ├── global/              # Layer 1: Raw values
│   │   ├── colors.ts        # neutralPalette, brandPalette, statusPalette, accentPalette
│   │   ├── typography.ts    # fontSizes, lineHeights, fontWeights, fontFamilies
│   │   ├── spacing.ts       # spacingScale (4px base)
│   │   ├── radius.ts        # radiusScale
│   │   └── motion.ts        # durations, easings
│   ├── alias/               # Layer 2: Semantic tokens
│   │   ├── colors.ts        # ColorAliasTokens type + CSS variable names
│   │   └── typography.ts    # TypographyAliasTokens
│   └── themes/
│       ├── light.ts         # Light theme token mapping
│       ├── dark.ts          # Dark theme token mapping
│       └── types.ts         # ThemeConfig type
├── styles/
│   ├── tokens.css           # CSS custom properties (90+ variables)
│   └── animations.css       # Keyframe animations + utility classes
├── components/              # 23+ components
│   └── [component]/
│       ├── [component].tsx          # React component
│       ├── [component].variants.ts  # CVA variant definitions
│       └── index.ts                 # Barrel export
├── hooks/
│   ├── use-theme.ts
│   ├── use-controllable-state.ts
│   ├── use-exit-animation.ts
│   └── use-focus-trap.ts
└── utils/
    └── cn.ts                # clsx + tailwind-merge
```

### Component Categories

| Category | Components | Pattern |
|----------|-----------|---------|
| **Basic** | Button, Badge, Input, Textarea, Select, Checkbox, Toggle, Label, KeyboardHint | Single CVA + props |
| **Compound** | Dialog, ToggleGroup, Avatar (Group/Selectable), Card, Dropdown, Popover | Context + sub-components |
| **Overlay** | Dialog, Tooltip, Dropdown, Popover | Portal + exit animation + Floating UI |
| **Filter** | FilterBar, FilterGroup, MultiSelectChips | Composition pattern |
| **Kanban** | ColumnContainer, DroppableZone, DropIndicator, EmptyState | DnD-kit integration |

---

## TOKEN QUICK REFERENCE

### Color Tokens

#### Backgrounds (Progressive Layering)

| Token | CSS Variable | Use Case |
|-------|-------------|----------|
| colorNeutralBackground1 | `--color-neutral-background-1` | Page background |
| colorNeutralBackground1Hover | `--color-neutral-background-1-hover` | Page hover state |
| colorNeutralBackground2 | `--color-neutral-background-2` | Cards, elevated surfaces |
| colorNeutralBackground2Hover | `--color-neutral-background-2-hover` | Card hover |
| colorNeutralBackground3 | `--color-neutral-background-3` | Input controls, subtle areas |
| colorNeutralBackground3Hover | `--color-neutral-background-3-hover` | Input hover |
| colorNeutralBackgroundDisabled | `--color-neutral-background-disabled` | Disabled state |
| colorNeutralBackgroundInverted | `--color-neutral-background-inverted` | Dark surface in light mode |

#### Foregrounds (Text)

| Token | CSS Variable | Use Case |
|-------|-------------|----------|
| colorNeutralForeground1 | `--color-neutral-foreground-1` | Primary text |
| colorNeutralForeground2 | `--color-neutral-foreground-2` | Secondary/muted text |
| colorNeutralForeground3 | `--color-neutral-foreground-3` | Tertiary/placeholder |
| colorNeutralForegroundDisabled | `--color-neutral-foreground-disabled` | Disabled text |
| colorNeutralForegroundInverted | `--color-neutral-foreground-inverted` | Text on inverted bg |

#### Brand (Primary Actions)

| Token | CSS Variable | Use Case |
|-------|-------------|----------|
| colorBrandBackground | `--color-brand-background` | Primary buttons |
| colorBrandBackgroundHover | `--color-brand-background-hover` | Button hover |
| colorBrandBackgroundPressed | `--color-brand-background-pressed` | Button active |
| colorBrandBackgroundSelected | `--color-brand-background-selected` | Selected state bg |
| colorBrandForeground1 | `--color-brand-foreground-1` | Brand text/links |
| colorBrandForeground2 | `--color-brand-foreground-2` | Lighter brand text |
| colorBrandForegroundOnBrand | `--color-brand-foreground-on-brand` | Text on brand bg |

#### Status Colors

| Status | Background | Foreground | Use Case |
|--------|-----------|------------|----------|
| Success | `--color-status-success-background` | `--color-status-success-foreground` | Positive feedback |
| Warning | `--color-status-warning-background` | `--color-status-warning-foreground` | Caution states |
| Danger | `--color-status-danger-background` | `--color-status-danger-foreground` | Errors, destructive |

**Raw status colors** (for badges, icons):
- `--color-status-success`
- `--color-status-warning`
- `--color-status-danger`

#### Strokes (Borders)

| Token | CSS Variable | Use Case |
|-------|-------------|----------|
| colorNeutralStroke1 | `--color-neutral-stroke-1` | Default borders |
| colorNeutralStroke1Hover | `--color-neutral-stroke-1-hover` | Border hover |
| colorNeutralStroke2 | `--color-neutral-stroke-2` | Subtle borders |
| colorNeutralStrokeDisabled | `--color-neutral-stroke-disabled` | Disabled border |
| colorNeutralStrokeFocus | `--color-neutral-stroke-focus` | Focus rings |
| colorBrandStroke1 | `--color-brand-stroke-1` | Brand accent borders |
| colorBrandStroke2 | `--color-brand-stroke-2` | Lighter brand border |

#### Glass Effects (Lunamark Signature)

| Token | CSS Variable | Description |
|-------|-------------|-------------|
| colorGlassBackground | `--color-glass-background` | Glass surface color |
| colorGlassBackgroundHover | `--color-glass-background-hover` | Glass hover |
| colorGlassBorder | `--color-glass-border` | Glass border |
| (config) | `--glass-blur` | Backdrop blur (16px) |
| (config) | `--glass-saturation` | Saturation (180%) |
| (config) | `--glass-bg-opacity` | Background opacity (0.85 light, 0.75 dark) |

#### Glow Effects

| Token | CSS Variable | Description |
|-------|-------------|-------------|
| colorGlowPrimary | `--color-glow-primary` | Primary glow color |
| colorGlowAccent | `--color-glow-accent` | Accent glow (violet) |
| (config) | `--glow-primary-opacity` | Primary glow opacity |
| (config) | `--glow-accent-opacity` | Accent glow opacity |

#### Overlay & Shadow

| Token | CSS Variable | Use Case |
|-------|-------------|----------|
| colorOverlay | `--color-overlay` | Modal backdrop (use with /50 opacity) |
| colorShadowAmbient | `--color-shadow-ambient` | Soft shadows |
| colorShadowKey | `--color-shadow-key` | Sharp shadows |

### Spacing Scale (4px base)

| Token | Value | CSS Variable |
|-------|-------|-------------|
| none | 0 | `--spacing-none` |
| xxs | 2px | `--spacing-xxs` |
| xs | 4px | `--spacing-xs` |
| sm | 8px | `--spacing-sm` |
| md | 12px | `--spacing-md` |
| lg | 16px | `--spacing-lg` |
| xl | 20px | `--spacing-xl` |
| xxl | 24px | `--spacing-xxl` |
| xxxl | 32px | `--spacing-xxxl` |
| xxxxl | 40px | `--spacing-xxxxl` |
| xxxxxl | 48px | `--spacing-xxxxxl` |

### Radius Scale

| Token | Value | CSS Variable |
|-------|-------|-------------|
| none | 0 | `--radius-none` |
| xs | 2px | `--radius-xs` |
| sm | 4px | `--radius-sm` |
| md | 6px | `--radius-md` |
| lg | 8px | `--radius-lg` |
| xl | 12px | `--radius-xl` |
| xxl | 16px | `--radius-xxl` |
| xxxl | 24px | `--radius-xxxl` |
| full | 9999px | `--radius-full` |

### Motion Tokens

#### Durations

| Token | Value | CSS Variable |
|-------|-------|-------------|
| ultraFast | 50ms | `--duration-ultra-fast` |
| faster | 100ms | `--duration-faster` |
| fast | 150ms | `--duration-fast` |
| normal | 200ms | `--duration-normal` |
| slow | 300ms | `--duration-slow` |
| slower | 400ms | `--duration-slower` |
| ultraSlow | 500ms | `--duration-ultra-slow` |

#### Easings

| Token | Value | CSS Variable |
|-------|-------|-------------|
| default | cubic-bezier(0.4, 0, 0.2, 1) | `--easing-default` |
| easeOut | cubic-bezier(0, 0, 0.2, 1) | `--easing-ease-out` |
| easeIn | cubic-bezier(0.4, 0, 1, 1) | `--easing-ease-in` |
| spring | cubic-bezier(0.175, 0.885, 0.32, 1.275) | `--easing-spring` |

---

## COMPONENT PATTERNS

### Pattern 1: Basic Component with CVA

**File structure:**
```
components/button/
├── button.tsx           # Component
├── button.variants.ts   # CVA definitions
└── index.ts             # Re-exports
```

**Variants file (`button.variants.ts`):**
```ts
import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  // Base classes (shared across all variants)
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
          "bg-[rgb(var(--color-status-danger))] text-white hover:opacity-90 focus-visible:ring-[rgb(var(--color-status-danger))]",
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

**Component file (`button.tsx`):**
```tsx
import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../../utils/cn";
import { buttonVariants } from "./button.variants";

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    isLoading?: boolean;
  };

function Button({
  className,
  variant,
  size,
  isLoading,
  disabled,
  children,
  ref,
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || isLoading}
      {...props}
    >
      {children}
    </button>
  );
}

export { Button };
export type { ButtonProps };
```

**Index file (`index.ts`):**
```ts
export { Button } from "./button";
export type { ButtonProps } from "./button";
export { buttonVariants } from "./button.variants";
```

### Pattern 1b: Form Field with Render Props (Accessibility)

The FormField component uses render props to provide accessibility attributes to child inputs.

**Usage:**
```tsx
// With render props (recommended for accessibility)
<FormField label="Email" error={errors.email} description="We'll never share it">
  {(inputProps) => (
    <Input {...inputProps} value={email} onChange={setEmail} />
  )}
</FormField>

// Without render props (backwards compatible, no a11y wiring)
<FormField label="Email">
  <Input value={email} onChange={setEmail} />
</FormField>
```

**Render props provided:**
```ts
type FormFieldRenderProps = {
  id: string;                         // For htmlFor association
  "aria-describedby": string | undefined; // Links to description/error
  "aria-invalid": boolean | undefined;    // Error state
};
```

**Key features:**
- Auto-generates unique IDs with `useId()`
- Wires `htmlFor` on label to input `id` (WCAG 3.3.2)
- Links description/error via `aria-describedby` (WCAG 4.1.3)
- Adds `role="alert"` on error for live announcements
- Type-safe render props (per DESIGN_DECISIONS.md)

### Pattern 2: Compound Component with Context

**File structure:**
```
components/toggle-group/
├── toggle-group.tsx         # Main + sub-components
├── toggle-group.context.ts  # Context definition
├── toggle-group.variants.ts # CVA definitions
└── index.ts
```

**Context file (`toggle-group.context.ts`):**
```ts
import { createContext, useContext } from "react";

export type ToggleGroupContextValue = {
  type: "single" | "multiple";
  value: string | null;
  values: string[];
  onItemToggle: (itemValue: string) => void;
  size: "sm" | "md" | "lg";
  orientation: "horizontal" | "vertical";
  registerItem: (value: string, element: HTMLButtonElement) => void;
  unregisterItem: (value: string) => void;
  isItemSelected: (value: string) => boolean;
};

export const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

export function useToggleGroupContext() {
  const context = useContext(ToggleGroupContext);
  if (!context) {
    throw new Error("ToggleGroupItem must be used within a ToggleGroup provider");
  }
  return context;
}
```

**Usage pattern:**
```tsx
// Parent provides context
<ToggleGroupContext.Provider value={{ type, value, size, onItemToggle, ... }}>
  {children}
</ToggleGroupContext.Provider>

// Children consume context
function ToggleGroupItem({ value, children }) {
  const { size, isItemSelected, onItemToggle } = useToggleGroupContext();
  const selected = isItemSelected(value);

  return (
    <button
      data-state={selected ? "on" : "off"}
      onClick={() => onItemToggle(value)}
      className={cn(toggleItemVariants({ size }))}
    >
      {children}
    </button>
  );
}
```

### Pattern 3: Portal + Exit Animation (Dialog)

**Critical hooks:**
```tsx
function DialogContent({ children, className }) {
  const { isOpen, onOpenChange } = useDialogContext();
  const contentRef = useRef<HTMLDivElement>(null);

  // Exit animation - delays unmount for close animation
  const shouldRender = useExitAnimation(isOpen, 150);

  // Focus trap - keyboard focus stays within dialog
  useFocusTrap(contentRef, isOpen);

  // Escape key handling
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onOpenChange]);

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, [isOpen]);

  if (!shouldRender) return null;

  const dataState = isOpen ? "open" : "closed";

  return createPortal(
    <div data-state={dataState}>
      {/* Overlay */}
      <div data-dialog-overlay data-state={dataState} className="fixed inset-0 bg-black/50" />

      {/* Content */}
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        data-dialog-content
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

**CSS animation setup (in animations.css):**
```css
[data-dialog-overlay][data-state="open"] {
  animation: ui-fade-in var(--duration-fast) var(--easing-ease-out);
}
[data-dialog-overlay][data-state="closed"] {
  animation: ui-fade-out var(--duration-fast) var(--easing-ease-in);
}

[data-dialog-content][data-state="open"] {
  animation: ui-zoom-in var(--duration-fast) var(--easing-ease-out);
}
[data-dialog-content][data-state="closed"] {
  animation: ui-zoom-out var(--duration-fast) var(--easing-ease-in);
}
```

### Glass Effect Utility

```tsx
// Glass morphism styling pattern
className={cn(
  "backdrop-blur-[var(--glass-blur)] backdrop-saturate-[var(--glass-saturation)]",
  "bg-[rgb(var(--color-glass-background)/var(--glass-bg-opacity))]",
  "border border-[rgb(var(--color-glass-border)/0.5)]"
)}
```

### Interactive State Pattern

```tsx
// Hover, active, focus, disabled states
className={cn(
  "transition-colors",
  // Default
  "bg-[rgb(var(--color-neutral-background-2))]",
  "text-[rgb(var(--color-neutral-foreground-1))]",
  // Hover
  "hover:bg-[rgb(var(--color-neutral-background-2-hover))]",
  // Focus
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-neutral-stroke-focus))]",
  // Disabled
  "disabled:opacity-50 disabled:pointer-events-none"
)}
```

### Floating UI Integration Pattern

Used by Dropdown, Popover, Tooltip, MultiSelectChips:

```tsx
import {
  useFloating, autoUpdate, offset, flip, shift,
  useClick, useDismiss, useRole, useInteractions,
  FloatingPortal, FloatingFocusManager,
} from "@floating-ui/react";

function FloatingComponent({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "bottom-start",
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "menu" }); // or "listbox", "dialog"

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click, dismiss, role
  ]);

  const shouldRender = useExitAnimation(isOpen, 150);

  return (
    <>
      <button ref={refs.setReference} {...getReferenceProps()}>
        Trigger
      </button>
      {shouldRender && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              data-state={isOpen ? "open" : "closed"}
              className="bg-[rgb(var(--color-neutral-background-1))] border-[rgb(var(--color-neutral-stroke-1))]"
              {...getFloatingProps()}
            >
              {children}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
}
```

### DnD-kit Integration Pattern

Used by DroppableZone, Kanban components:

```tsx
import { useDroppable } from "@dnd-kit/react";
import { CollisionPriority } from "@dnd-kit/abstract";

function DroppableZone({ id, children }) {
  const { ref, isDropTarget } = useDroppable({
    id,
    type: "column",
    collisionPriority: CollisionPriority.Low,
    accept: ["item"],
  });

  return (
    <div ref={ref} className={cn(isDropTarget && "ring-2 ring-[rgb(var(--color-brand-background))]")}>
      {children}
    </div>
  );
}
```

---

## HOOKS REFERENCE

### useTheme

```ts
const { theme, resolvedTheme, setTheme } = useTheme();

// theme: "light" | "dark" | "system" (user's selection)
// resolvedTheme: "light" | "dark" (actual applied theme)
// setTheme: (theme: "light" | "dark" | "system") => void
```

**Features:**
- localStorage persistence (key: `ui-theme`)
- System preference detection via `prefers-color-scheme`
- Auto-updates when system preference changes (when theme="system")
- Uses `useSyncExternalStore` for sync state

### useControllableState

```ts
// Supports both controlled and uncontrolled patterns
const [value, setValue] = useControllableState({
  value: props.value,        // undefined = uncontrolled mode
  defaultValue: false,       // initial value for uncontrolled
  onChange: props.onChange,  // callback when value changes
});
```

### useExitAnimation

```ts
// Delays unmount to allow exit animation to complete
const shouldRender = useExitAnimation(isOpen, 150);

// isOpen: boolean - current open state
// 150: duration in ms - how long to keep mounted after close
// Returns: boolean - whether to render the component

if (!shouldRender) return null;
return <div data-state={isOpen ? "open" : "closed"}>...</div>;
```

### useFocusTrap

```ts
// Traps keyboard focus within container element
useFocusTrap(containerRef, isActive);

// containerRef: RefObject<HTMLElement> - element to trap focus in
// isActive: boolean - whether trap is active
```

---

## EXTENSION GUIDE

### Adding a New Token

**Step 1: Global token** (if new raw value needed)
```ts
// tokens/global/colors.ts
export const brandPalette = {
  // ... existing
  brand110: "20 50 150",  // New darker shade
};
```

**Step 2: Alias token** (semantic meaning)
```ts
// tokens/alias/colors.ts
export type ColorAliasTokens = {
  // ... existing
  colorBrandBackgroundActive: string;  // Add to type
};

export const colorTokenNames = {
  // ... existing
  colorBrandBackgroundActive: "--color-brand-background-active",
};
```

**Step 3: Theme mapping**
```ts
// tokens/themes/light.ts
export const lightColorTokens: ColorAliasTokens = {
  // ... existing
  colorBrandBackgroundActive: brandPalette.brand90,
};

// tokens/themes/dark.ts
export const darkColorTokens: ColorAliasTokens = {
  // ... existing
  colorBrandBackgroundActive: brandPalette.brand70,
};
```

**Step 4: CSS output**
```css
/* styles/tokens.css - add to both :root and [data-theme="dark"] */
:root {
  --color-brand-background-active: 30 64 175;
}
[data-theme="dark"] {
  --color-brand-background-active: 37 99 235;
}
```

### Adding a New Theme

**Step 1: Create theme file**
```ts
// tokens/themes/ocean.ts
import type { ColorAliasTokens } from "../alias/colors";
import { neutralPalette } from "../global/colors";

export const oceanColorTokens: ColorAliasTokens = {
  colorNeutralBackground1: "240 253 250",  // teal tint
  colorBrandBackground: "20 184 166",       // teal
  // ... map ALL tokens
};
```

**Step 2: Export from themes index**
```ts
// tokens/themes/index.ts
export { oceanColorTokens } from "./ocean";
```

**Step 3: Add CSS block**
```css
/* styles/tokens.css */
[data-theme="ocean"] {
  --color-neutral-background-1: 240 253 250;
  --color-brand-background: 20 184 166;
  /* ... all tokens */
}
```

### Adding a New Component

**Checklist:**
- [ ] Create folder: `components/[name]/`
- [ ] Create `[name].variants.ts` with CVA definitions
- [ ] Create `[name].tsx` with component
- [ ] Create `index.ts` barrel export
- [ ] Use `cn()` for className merging
- [ ] Use semantic tokens: `rgb(var(--token-name))`
- [ ] Add proper TypeScript types
- [ ] Export from `components/index.ts`

**Template:**
```tsx
// components/[name]/[name].variants.ts
import { cva } from "class-variance-authority";

export const [name]Variants = cva(
  "base-classes-here",
  {
    variants: {
      variant: { default: "...", alternate: "..." },
      size: { sm: "...", md: "...", lg: "..." },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

// components/[name]/[name].tsx
import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../../utils/cn";
import { [name]Variants } from "./[name].variants";

type [Name]Props = ComponentProps<"div"> &
  VariantProps<typeof [name]Variants>;

function [Name]({ className, variant, size, ref, ...props }: [Name]Props) {
  return (
    <div
      ref={ref}
      className={cn([name]Variants({ variant, size, className }))}
      {...props}
    />
  );
}

export { [Name] };
export type { [Name]Props };

// components/[name]/index.ts
export { [Name] } from "./[name]";
export type { [Name]Props } from "./[name]";
export { [name]Variants } from "./[name].variants";
```

---

## DECISION LOG

### Why RGB Space Format?

Colors stored as `"37 99 235"` (not `rgb(37, 99, 235)`) because:
- **Opacity modifiers**: `rgb(var(--color) / 0.5)` works natively
- **Smaller CSS**: No repeated `rgb()` wrappers in token definitions
- **Tailwind v4 compatible**: Works with arbitrary value syntax

### Why Two Layers (No Control Layer)?

Microsoft Fluent 2 has three layers (Global → Alias → Control). We use two because:
- **Simplicity**: Control layer adds complexity without proportional benefit for small systems
- **CVA handles it**: Component variants define control-level mappings
- **Extensible**: Can add Control layer later if system grows significantly

### Why CVA over styled-components/Emotion?

- **Zero runtime**: No CSS-in-JS overhead
- **Tailwind native**: Perfect integration with utility classes
- **Type-safe**: Variant props are fully typed via `VariantProps<typeof>`
- **Readable**: Class strings are scannable and debuggable
- **No hydration issues**: Works perfectly with SSR/RSC

### Why `data-state` for Animations?

- **CSS-only**: No JavaScript animation library needed
- **Clear states**: `open` and `closed` are unambiguous
- **Exit animations**: Works with `useExitAnimation` hook pattern
- **No ARIA conflicts**: Doesn't interfere with accessibility attributes
- **Debuggable**: Visible in DevTools for debugging

### Why No forwardRef?

React 19+ supports `ref` as a regular prop. Our pattern:
```tsx
type Props = ComponentProps<"button">;
// ref is automatically included in ComponentProps
```
This is simpler, more readable, and future-proof. See DESIGN_DECISIONS.md for details.

### Why Glass Morphism as Signature?

- **Unique identity**: Differentiates from standard Fluent 2
- **Modern aesthetic**: Premium, contemporary look
- **Dark mode friendly**: Enhanced glow effects in dark theme
- **Configurable**: `--glass-blur`, `--glass-bg-opacity` allow tuning

---

## COMMON MISTAKES

### Wrong: Raw CSS Variable

```tsx
// WRONG - missing rgb() wrapper
className="bg-[var(--color-brand-background)]"
```

### Correct: RGB Wrapper

```tsx
// CORRECT - always wrap in rgb()
className="bg-[rgb(var(--color-brand-background))]"
```

### Wrong: Hardcoded Colors

```tsx
// WRONG - breaks theming
className="bg-blue-600 text-white"
```

### Correct: Semantic Tokens

```tsx
// CORRECT - theme-aware
className="bg-[rgb(var(--color-brand-background))] text-[rgb(var(--color-brand-foreground-on-brand))]"
```

### Wrong: Missing Exit Animation

```tsx
// WRONG - no exit animation
function Modal({ isOpen }) {
  if (!isOpen) return null;
  return <div>...</div>;
}
```

### Correct: Exit Animation Pattern

```tsx
// CORRECT - exit animation works
function Modal({ isOpen }) {
  const shouldRender = useExitAnimation(isOpen, 150);
  if (!shouldRender) return null;
  return <div data-state={isOpen ? "open" : "closed"}>...</div>;
}
```

### Wrong: Compound Component Without Context

```tsx
// WRONG - child can't access parent state
function ToggleGroupItem({ value }) {
  // How does this know if it's selected?
}
```

### Correct: Context Pattern

```tsx
// CORRECT - child consumes context
function ToggleGroupItem({ value }) {
  const { isItemSelected, onItemToggle } = useToggleGroupContext();
  const selected = isItemSelected(value);
  // ...
}
```

---

## COMPONENT LIST

### Basic Components

| Component | Variants | Sizes | Notes |
|-----------|----------|-------|-------|
| Button | primary, secondary, outline, ghost, danger, link | sm, md, lg, icon | Loading state |
| Badge | default, secondary, success, warning, danger, outline | sm, md | - |
| Input | default | sm, md, lg | - |
| Textarea | default | sm, md, lg | Auto-resize option |
| Select | default, error | sm, md, lg | Native select |
| Checkbox | default | sm, md, lg | - |
| Toggle | default | sm, md, lg | - |
| Label | - | - | Form label |
| FormField | - | - | Form field wrapper with accessibility (render props) |
| KeyboardHint | default, inverted | - | Keyboard shortcut display |

### Compound Components

| Component | Sub-components | Sizes | Notes |
|-----------|---------------|-------|-------|
| ToggleGroup | ToggleGroupItem | sm, md, lg | Single/multiple selection |
| Avatar | AvatarGroup, SelectableAvatar | sm, md, lg | User avatars |
| Card | CardHeader, CardTitle, CardDescription, CardContent, CardFooter | - | Container |
| Dialog | DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter | - | Modal overlay |
| Dropdown | DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator | - | Floating UI menu |
| Popover | PopoverTrigger, PopoverContent, PopoverClose | - | Floating UI popover |
| Tooltip | TooltipTrigger, TooltipContent | - | Floating UI tooltip |

### Filter Components

| Component | Variants | Sizes | Notes |
|-----------|----------|-------|-------|
| FilterBar | - | - | Filter controls container |
| FilterGroup | - | - | Grouped filters |
| MultiSelectChips | selected, unselected | sm, md | Chip-based multi-select |

### Kanban Components

| Component | Variants | Notes |
|-----------|----------|-------|
| ColumnContainer | default, active | sm, md, lg sizes |
| DroppableZone | - | DnD-kit integration |
| DropIndicator | - | Drag feedback |
| EmptyState | default, active | sm, md, lg sizes |

