# AI Component Unification Guide

This file consolidates the component + hook patterns for Lunamark so AI models follow one consistent recipe.

---

## Non-negotiables

- **Tokens:** Always use `rgb(var(--token-name))` for colors.
- **Variants:** Only create `*.variants.ts` when the component exposes variants. If there are no variants, inline Tailwind classes in the component.
- **Types:** Use `ComponentProps<"element">` (React 19+ pattern).
- **Exports:** Barrel export component + types, and variants only when they exist.
- **Client:** Add `"use client"` to any file that uses React hooks or context.
- **data-slot:** Keep `data-slot` attributes for public components to enable styling hooks and testing.

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

## Import Aliases

- Use `@ui/*` when a relative import would climb more than one `../`.
- Keep `./` or `../` for same-folder or single-level imports.

---

## File Structure Patterns

**Basic**
```
components/button/
  button.tsx
  button.variants.ts (only if variants exist)
  index.ts
```

**Compound**
```
components/toggle-group/
  toggle-group.tsx
  toggle-group.context.ts
  toggle-group.variants.ts (only if variants exist)
  index.ts
```

**Portal**
```
components/dialog/
  dialog.tsx
  dialog-content.tsx
  dialog.context.ts
  dialog.variants.ts (only if variants exist)
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
export { componentVariants } from "./component.variants"; // only if variants exist
```
