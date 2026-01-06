# @ui Implementation Context for AI Agents

> Quick reference for AI developers working on the Lunamark design system.
> For comprehensive documentation, see [CLAUDE.md](./CLAUDE.md).

---

## Current State

| Metric | Value |
|--------|-------|
| Total Components | 23+ |
| Token Migration | ✅ Complete |
| Color Format | RGB space (`37 99 235`) with `rgb(var())` wrapper |
| Accessibility | ✅ focus-visible, ARIA attributes |
| Theming | Light/Dark via `[data-theme]` |

---

## Quick Patterns

### Token Usage (Critical)

```tsx
// ALWAYS wrap color tokens in rgb()
className="bg-[rgb(var(--color-brand-background))]"
className="text-[rgb(var(--color-neutral-foreground-1))]"

// With opacity
className="bg-[rgb(var(--color-brand-background)/0.5)]"

// NEVER use hardcoded colors
// ❌ bg-blue-600, text-white, bg-black
```

### Token Categories

| Category | Token Pattern | Example |
|----------|--------------|---------|
| Backgrounds | `--color-neutral-background-{1,2,3}` | Page, card, input |
| Foregrounds | `--color-neutral-foreground-{1,2,3}` | Primary, muted, tertiary |
| Brand | `--color-brand-background` | Primary buttons |
| Status | `--color-status-{success,warning,danger}` | Alerts, badges |
| Strokes | `--color-neutral-stroke-{1,2}` | Borders |
| Focus | `--color-neutral-stroke-focus` | Focus rings |
| Inverted | `--color-neutral-foreground-inverted` | Text on dark bg |
| Overlay | `--color-overlay` | Modal backdrop |

### Focus Ring Pattern

```tsx
// Standard interactive elements
"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-neutral-stroke-focus))]"

// Brand accent (buttons)
"focus-visible:ring-[rgb(var(--color-brand-background))]"
```

---

## Common AI Tasks

### Adding a New Component

1. Create folder: `components/[name]/`
2. Create files:
   ```
   [name].variants.ts  # CVA definitions (if needed)
   [name].tsx          # Component
   index.ts            # Barrel export
   ```
3. Add export to `components/index.ts`
4. Update CLAUDE.md component list

### Component Template

```tsx
// [name].variants.ts
import { cva } from "class-variance-authority";

export const nameVariants = cva(
  "base-classes",
  {
    variants: {
      variant: { default: "...", alt: "..." },
      size: { sm: "...", md: "...", lg: "..." },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

// [name].tsx
import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../../utils/cn";
import { nameVariants } from "./[name].variants";

type NameProps = ComponentProps<"div"> &
  VariantProps<typeof nameVariants>;

function Name({ className, variant, size, ref, ...props }: NameProps) {
  return (
    <div
      ref={ref}
      className={cn(nameVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Name };
export type { NameProps };
```

### Finding Token Issues

Search patterns:
```bash
# Hardcoded colors
grep -r "bg-white\|text-white\|bg-black\|text-black" components/
grep -r "bg-blue-\|bg-gray-\|text-gray-" components/

# Missing rgb() wrapper
grep -r "var(--color-" components/ | grep -v "rgb(var"

# Old focus pattern
grep -r "focus:ring" components/ | grep -v "focus-visible:ring"
```

### Adding Accessibility

```tsx
// Toggle/selection
aria-pressed={isSelected}
data-state={isSelected ? "on" : "off"}

// Expandable
aria-expanded={isOpen}
aria-controls={contentId}
aria-haspopup="menu" // or "listbox", "dialog"

// Modal
role="dialog"
aria-modal="true"
aria-hidden={!isOpen}

// Focus management
useFocusTrap(containerRef, isOpen)
```

### Testing Components

Each component should have a `.test.tsx` file with this structure:

```tsx
describe("ComponentName", () => {
  // BEHAVIOR (2-3 tests)
  it("renders with default props")
  it("handles loading/error states")

  // ACCESSIBILITY (2-3 tests)
  it("has correct ARIA attributes")
  it("supports keyboard navigation")

  // API CONTRACT (2-3 tests)
  it("forwards ref")
  it("accepts all variant/size props without error")
  it("calls event handlers")

  // RENDER PROPS (if applicable, 1-2 tests)
  it("provides expected props to render function")
});
```

**Test Checklist** (before submitting a component):

- [ ] Renders without errors with default props
- [ ] All public props accepted without error (use forEach loop)
- [ ] Ref forwarding works
- [ ] ARIA attributes correct for interactive components
- [ ] Event handlers called (onClick, onChange, etc.)
- [ ] Loading/disabled states work correctly
- [ ] Render props provide expected values (if applicable)

**What NOT to Test**:

- CSS class names or specific styling (use Storybook for visual testing)
- Internal timers or implementation details
- Every variant's visual appearance
- Browser-native behaviors (Space key if Enter works)

**Target Metrics**:

- **Tests per component**: 6-12 focused tests
- **Lines per test file**: 50-100 lines
- **Coverage target**: 50-80%

See [DESIGN_DECISIONS.md](./DESIGN_DECISIONS.md#testing-philosophy) for the full rationale.

---

## File Reference

| Purpose | Path |
|---------|------|
| Full Documentation | `CLAUDE.md` |
| Token CSS | `styles/tokens.css` |
| Animations | `styles/animations.css` |
| Component Exports | `components/index.ts` |
| Hooks | `hooks/` |
| Utils | `utils/cn.ts` |

---

## Validation Checklist

Before committing:

- [ ] No hardcoded colors (`bg-blue-*`, `text-white`, etc.)
- [ ] All tokens use `rgb(var(--token))` wrapper
- [ ] Interactive elements have `focus-visible:ring-*`
- [ ] Overlays use `useExitAnimation` hook
- [ ] ARIA attributes present for interactive components
- [ ] Light & dark themes render correctly
- [ ] Types exported from index.ts
