# AI Component Unification Guide

This file consolidates the component + hook patterns for Lunamark so AI models follow one consistent recipe.

---

## Non-negotiables

- **Tokens:** Always use `rgb(var(--token-name))` for colors.
- **Variants:** All components with variants must have a separate `*.variants.ts`.
- **Types:** Use `ComponentProps<"element">` (React 19+ pattern).
- **Exports:** Barrel export component, types, and variants.
- **Client:** Add `"use client"` to any file that uses React hooks or context.

---

## Logic vs Render Separation

Keep state/behavior in a hook and keep JSX in the component:

- Portal/overlay components: `use-[name].ts` owns all logic.
- Compound components: context + hook for shared logic.
- Simple components: logic stays inline only if trivial.

---

## Hook Placement Rules

- **Reusable logic (3+ components):** put in `hooks/`.
- **Single-use logic:** keep in the component folder as `use-[name].ts`.
- **One hook per component** for component-specific logic.

---

## Context Provider Values

Context provider values should be stable:

- Use `useMemo` for the provider value object.
- Use `useCallback` only when the function is part of the provider value,
  used in effect dependencies, or used as a ref callback.

---

## File Structure Patterns

**Basic**
```
components/button/
  button.tsx
  button.variants.ts
  index.ts
```

**Compound**
```
components/toggle-group/
  toggle-group.tsx
  toggle-group.context.ts
  toggle-group.variants.ts
  index.ts
```

**Portal**
```
components/dialog/
  dialog.tsx
  dialog-content.tsx
  dialog.context.ts
  dialog.variants.ts
  use-dialog.ts
  index.ts
```

---

## Testing Rules

- Test behavior and accessibility, not CSS class names.
- Co-locate tests with the component/hook.
- Use `vitest-axe` for a11y checks on interactive components.

---

## Export Pattern (Required)

```
export { Component } from "./component";
export type { ComponentProps } from "./component";
export { componentVariants } from "./component.variants";
```
