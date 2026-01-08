# UI Unification Plan (Proposal)

This document summarizes the audit results and the changes I propose to make. No code changes have been applied yet.

---

## Research Validation (Hooks Folder Structure)

- **Vitest include patterns allow tests anywhere in the repo**, which supports co-locating hook files and tests in the same folder. The default `include` pattern is `**/*.{test,spec}.?(c|m)[jt]s?(x)` and can be extended to match co-located tests (Vitest config docs: https://raw.githubusercontent.com/vitest-dev/vitest/main/docs/config/include.md).
- **React Compiler guidance** indicates manual memoization (`useMemo`, `useCallback`) is optional and should be used only when needed for precise control (React docs via Context7: `/reactjs/react.dev`, React Compiler introduction).
- **React useContext docs** note that context consumers re-render when the provider value identity changes; `useMemo`/`useCallback` are recommended to keep the provider value stable when the underlying data hasn't changed (React docs via Context7: `/reactjs/react.dev`, `useContext` reference).

Conclusion: The existing hook + test folder layout is valid and aligned with Vitest defaults. I’ll keep the structure and ensure any new hooks follow the same layout.

---

## Audit Findings (Mismatches)

### Component Structure / Variants
- `apps/lunamark/packages/ui/components/kanban/drop-indicator/drop-indicator.tsx`
  - Missing `*.variants.ts`, no `className` merging, no `cn()` usage.
- `apps/lunamark/packages/ui/components/kanban/droppable-zone/droppable-zone.tsx`
  - Missing `*.variants.ts`, uses custom props instead of `ComponentProps<"div">`, no ref forwarding.
- `apps/lunamark/packages/ui/components/kanban/swipeable-container/swipeable-container.tsx`
  - Missing `*.variants.ts`, missing `"use client"`, does not merge `ref` with `containerRef`.

### Logic vs Component Separation
- `apps/lunamark/packages/ui/components/dialog`
  - `Dialog` does not use `useDialog`; `DialogContent` calls `useDialog` directly, which duplicates ID logic and mixes behavior into the view layer.

### Context Value Memoization
Context providers here pass object values that can trigger consumer re-renders if identity changes on every render. This matters for a shared UI library even without the React Compiler.

### Client Directive
- `apps/lunamark/packages/ui/components/form-field/form-field.context.ts` is missing `"use client"` while using `useContext`.
- `apps/lunamark/packages/ui/components/kanban/swipeable-container/swipeable-container.tsx` uses hooks but lacks `"use client"`.

### Hooks Cleanup
- `apps/lunamark/packages/ui/hooks/state/use-controllable-state/use-controllable-state.ts` defines `isPending` but never uses it.

### Tests
- `apps/lunamark/packages/ui/components/toggle-button/` has no tests.
- `apps/lunamark/packages/ui/components/kanban/swipeable-container/swipeable-container.test.tsx` mocks a hook path that doesn’t match the actual import (`@ui/hooks/navigation/use-swipe-navigation`).

### Hooks Folder Structure
The hooks folder is already in the requested hook + test subfolder layout. No structural changes required unless we move single-use hooks to component folders (see open questions).

---

## Proposed Changes

### 1) Inline styles when no variants + normalize className usage
- **DropIndicator**
  - Inline base Tailwind classes in the component and keep `cn()` + `className` merging.
  - Do **not** create a `drop-indicator.variants.ts` file (no variants).
- **DroppableZone**
  - Convert props to `ComponentProps<"div">` + custom props and merge `ref`.
  - Keep `activeClassName` for backwards compatibility.
  - Inline classes (no variants file).
- **SwipeableContainer**
  - Add `"use client"`.
  - Merge forwarded `ref` with `containerRef`.
  - Replace `React.ReactElement` type usage with `ReactElement` import.
  - Inline classes (no variants file).

### 2) Enforce logic/component separation for Dialog
- Move `useDialog` usage into `Dialog` root, and pass all behavior (open state, refs, `shouldRender`, `handleBackdropClick`, `dataState`, ids) through context.
- Update `DialogContent` to read all behavior from context and remove duplicate `useDialog` call.
- Update `DialogContextValue` to include the additional values.

### 3) Remove unnecessary useCallback, keep memoization for context values
Planned changes:
- **Keep `useMemo` for context values** in `Dropdown`, `DropdownSub`, `DropdownRadioGroup`, `Popover`, `Tooltip` to avoid unnecessary consumer re-renders (per React `useContext` guidance).
- Replace `useCallback` wrappers with inline functions where they are **not** used in context values, effect dependencies, or ref callbacks:
  - `useDialog`, `useDropdown`, `useToggleGroup`, `useColumn`
  - `dropdown-item.tsx`, `dropdown-sub.tsx`
Notes:
- Keep `useCallback` only when function identity is part of a context value, an effect dependency, or a ref callback to avoid churn.

### 4) Hook cleanup
- Update `useControllableState` to avoid unused `isPending` (use `const [, startTransition] = useTransition()`).

### 5) Tests and consistency
- Add tests for `ToggleButton` (behavior, a11y, controlled/uncontrolled, render props if applicable).
- Update `SwipeableContainer` tests to mock the actual hook import path.
- Replace base CSS class assertions in `FormField` tests with behavior-based checks (e.g., layout prop accepted, ARIA wiring still works).
- Add tests for new `DropIndicator`/`DroppableZone`/`SwipeableContainer` behavior changes if needed.

### 6) New unified AI pattern doc
Create a new doc (proposal): `apps/lunamark/packages/ui/AI_COMPONENT_UNIFICATION.md` that consolidates:
- File structure rules (basic/compound/portal)
- Logic vs render separation (when to use `use-[name].ts`)
- Variant + export pattern (component, types, variants)
- Token usage rules (always `rgb(var(--token))`)
- Testing rules (behavior-focused, a11y, no class assertions)
- Hook placement rule (shared vs component-specific)

I can add links to this doc from `COMPONENT_PATTERN_GUIDE.md` and `IMPLEMENTATION.md` once approved.

---

## Open Questions / Decisions Needed

1) **Single-use hooks in `hooks/`**
   - `useSwipeNavigation`, `useBodyScrollLock`, `useKeyboardShortcut` are currently used by a single component each.  
   - Should we move them into component folders to strictly follow the "3+ components" rule, or keep them in `hooks/` as part of the public API?

2) **Logic separation scope**
   - Do you want logic separation for *all* components (including simple ones), or only for complex ones (portal/compound/DnD)?

3) **useCallback scope**
   - OK to keep `useCallback` only for context value stability, effect deps, and ref callbacks (to avoid churn), and remove the rest?

4) **Comments in hooks/tests**
   - There are no comments in hook source files, but a few exist in hook tests (`use-controllable-state.test.ts`). Should I remove those too?

---

If you approve this plan (and answer the open questions), I’ll proceed with the implementation and tests.
