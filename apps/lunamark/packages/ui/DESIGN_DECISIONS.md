# Design Decisions

Architectural decisions and their rationale for the @ui design system.

---

## Render Props vs Slot/asChild for Polymorphic Components

### Decision

We use **render props** for polymorphic rendering (e.g., styling a Link as a Button) rather than the Slot/asChild pattern popularized by Radix UI.

### Context

When building UI libraries, there's often a need for "polymorphic" components—components that render as different HTML elements or other components while maintaining consistent styling. Common use cases:

- Rendering a `<Link>` component with Button styles
- Creating an `<a>` tag that looks like a button
- Wrapping third-party components with consistent styling

### Options Considered

#### Option 1: Slot/asChild Pattern (Radix UI approach)

```tsx
<Button asChild>
  <Link to="/login">Login</Link>
</Button>
```

**How it works:**
- Parent component checks for `asChild` prop
- Uses `cloneElement` to inject props (className, onClick, etc.) into child
- Child becomes the rendered element

**Pros:**
- Familiar to Radix UI users
- Slightly more concise JSX
- Works well for simple prop forwarding

**Cons:**
- **Type safety issues**: `cloneElement` requires casting props as `object` or `any`
- **Ref forwarding complexity**: Child must accept ref, not always guaranteed
- **Single child restriction**: Only works with exactly one child element
- **Hidden behavior**: Props are injected "magically"—not explicit what child receives
- **Computed values invisible**: Child cannot access computed state (e.g., `disabled = props.disabled || isLoading`)
- **Debugging difficulty**: Hard to trace where injected props come from

#### Option 2: Render Props Pattern (our choice)

```tsx
<Button variant="primary">
  {({ className, disabled }) => (
    <Link to="/login" className={className} aria-disabled={disabled}>
      Login
    </Link>
  )}
</Button>
```

**Pros:**
- **Explicit data flow**: Consumer sees exactly what props are available
- **Full type safety**: Render props function is fully typed
- **Access to computed values**: Consumer receives processed state (`disabled = props.disabled || isLoading`)
- **Flexibility**: Consumer controls how props are applied
- **No ref issues**: Consumer manages their own refs
- **Debuggable**: Clear what data flows where

**Cons:**
- Slightly more verbose JSX
- Less familiar to some developers
- Requires function-as-child check in component

### Decision Rationale

We chose render props because:

1. **Type Safety Priority**: This codebase prioritizes TypeScript correctness. Render props provide complete type inference without casts.

2. **Explicit Over Implicit**: Render props make data flow visible. The consumer sees exactly what styling/state information is available.

3. **Computed State Access**: Components like Button compute state (e.g., `disabled = disabled || isLoading`). Render props expose these computed values, enabling proper ARIA attributes on custom elements.

4. **Zero Dependencies**: No need for `@radix-ui/react-slot` or custom Slot implementation.

5. **Debugging**: When something breaks, render props make it trivial to log or inspect what values the component provides.

### Usage Examples

#### Standard Button (unchanged)

```tsx
<Button variant="primary" size="md">
  Click me
</Button>
```

#### Link styled as Button

```tsx
<Button variant="primary" size="lg" onClick={handleClick}>
  {({ className, disabled, onClick }) => (
    <Link
      to="/dashboard"
      className={className}
      aria-disabled={disabled || undefined}
      onClick={onClick}
    >
      Go to Dashboard
    </Link>
  )}
</Button>
```

#### Spread all props for convenience

```tsx
<Button variant="primary" onClick={handleClick} aria-label="Submit form">
  {(props) => (
    <Link to="/submit" {...props}>
      Submit
    </Link>
  )}
</Button>
```

#### External link as Button

```tsx
<Button variant="outline">
  {({ className }) => (
    <a
      href="https://example.com"
      className={className}
      target="_blank"
      rel="noopener noreferrer"
    >
      External Link
    </a>
  )}
</Button>
```

#### With loading state awareness

```tsx
<Button variant="primary" isLoading={isSubmitting}>
  {({ className, disabled, isLoading }) => (
    <Link
      to="/next-step"
      className={className}
      aria-disabled={disabled || undefined}
    >
      {isLoading ? "Loading..." : "Continue"}
    </Link>
  )}
</Button>
```

### Tradeoffs Accepted

1. **Verbosity**: Render prop usage is more verbose than asChild. We accept this for the type safety and explicitness benefits.

2. **Learning Curve**: Developers familiar only with Radix may need to adjust. The pattern is well-documented and common in React (used by React Aria, Downshift, etc.).

3. **Spinner Responsibility**: When using render props, the consumer is responsible for rendering loading indicators if needed. The `isLoading` prop is provided for this purpose.

### Quick Reference

| Aspect | Render Props | Slot/asChild |
|--------|--------------|--------------|
| Type Safety | Full inference | Requires casts |
| Data Flow | Explicit | Hidden (cloneElement) |
| Computed Values | Accessible | Not exposed |
| Dependencies | None | @radix-ui/react-slot |
| Debugging | Easy | Difficult |
| Verbosity | More verbose | Cleaner JSX |

---

## ComponentProps vs ComponentPropsWithoutRef for Type Definitions

### Decision

We use **`ComponentProps<"element">`** for typing component props rather than `ComponentPropsWithoutRef<"element">` with explicit `ref?: Ref<T>`.

### Context

React 19 deprecated `forwardRef` and now supports passing `ref` as a regular prop to function components. This simplifies how we type components.

### Options Considered

#### Option 1: Legacy Pattern (ComponentPropsWithoutRef + explicit ref)

```tsx
type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  ref?: Ref<HTMLButtonElement>;
  customProp?: string;
};
```

**Pros:**
- More explicit about ref handling
- Works in React 18 and 19

**Cons:**
- Verbose - requires manual ref type declaration
- Redundant in React 19 (ref is already a regular prop)

#### Option 2: Modern Pattern (ComponentProps) - Our Choice

```tsx
type CardProps = ComponentProps<"div">;
```

**Pros:**
- Simpler, cleaner syntax
- Automatically includes ref (React 19+ semantics)
- Matches React TypeScript Cheatsheet recommendations for 2025
- Used by shadcn/ui post-React 19 migration

**Cons:**
- Slightly less explicit about ref handling

### Decision Rationale

1. **React 19 Alignment**: `ComponentProps` reflects the new reality where refs are regular props.
2. **Simplicity**: No need to manually declare `ref?: Ref<T>` - it's included automatically.
3. **Industry Standard**: shadcn/ui and other major libraries have migrated to this pattern.
4. **Future-Proof**: As React phases out `forwardRef`, this pattern becomes standard.

### Migration Path

Existing components using `ComponentPropsWithoutRef` will be migrated to `ComponentProps` over time. Both patterns work correctly in React 19.

### References

- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19)
- [React TypeScript Cheatsheet - ComponentProps](https://react-typescript-cheatsheet.netlify.app/docs/react-types/componentprops/)
- [shadcn/ui Tailwind v4 Migration](https://ui.shadcn.com/docs/changelog)

---

## Testing Philosophy

### Decision

We use **behavior-focused unit tests** with Vitest + React Testing Library, NOT implementation detail tests.

### Context

UI component libraries need testing, but there's a critical distinction between what unit tests should verify versus what other testing methods handle better:

| Test Type | Purpose | Tool | What We Use |
|-----------|---------|------|-------------|
| **Unit tests** | Behavior, accessibility, API contracts | Vitest + RTL | ✅ Yes |
| **Visual tests** | Styling, variants look correct | Storybook | Future |

### What Unit Tests Should Cover

1. **Core Behavior** - Component renders, handles states (loading, error, empty)
2. **Accessibility** - ARIA attributes, keyboard navigation, focus management
3. **API Contract** - Props work, refs forward, events fire, render props function
4. **Edge Cases** - Null props, error states, unmount cleanup

### What Unit Tests Should NOT Cover

- ❌ CSS class names (`toHaveClass("bg-blue-500")`) - fragile, breaks on refactors
- ❌ Every variant visually - that's visual regression testing
- ❌ Timer/implementation internals (`clearTimeoutSpy`)
- ❌ Redundant browser behaviors (if Enter works, Space works natively)

### Rationale

1. **Kent C. Dodds principle**: "The more your tests resemble how users use software, the more confidence they give you"
2. **Separation of concerns**: Unit tests verify behavior, visual tests verify appearance
3. **Maintainability**: CSS class tests break on every styling refactor
4. **Radix UI recommendation**: "Use real browsers for visual testing"

### Pattern: Testing Variants Without CSS Classes

```tsx
// ❌ BAD - Tests implementation details
it("applies success variant classes", () => {
  render(<Badge variant="success">Test</Badge>);
  expect(screen.getByText("Test")).toHaveClass("bg-[rgb(...)]");
});

// ✅ GOOD - Tests API contract
it("accepts all variant props without error", () => {
  const variants = ["default", "success", "warning", "danger"] as const;
  variants.forEach(variant => {
    const { unmount } = render(<Badge variant={variant}>Test</Badge>);
    expect(screen.getByText("Test")).toBeInTheDocument();
    unmount();
  });
});
```

### Target Metrics

- **Tests per component**: 6-12 focused tests minimum; compound components with
  complex interactions (Dropdown, Dialog, Combobox) may require more to cover
  all behavior paths—this is acceptable as long as tests remain behavior-focused
- **Lines per test file**: 50-100 lines for simple components; complex compound
  components may be longer if tests remain behavior-focused and avoid CSS class assertions
- **Coverage target**: 50-80% (per Storybook watermarks)

### References

- [Testing Library Guiding Principles](https://testing-library.com/docs/guiding-principles)
- [Kent C. Dodds - Testing Implementation Details](https://kentcdodds.com/blog/testing-implementation-details)
- [Storybook Test Coverage](https://storybook.js.org/docs/8/writing-tests/test-coverage)
- [Radix UI Testing Discussion](https://github.com/radix-ui/primitives/discussions/2012)

---

## Automated Accessibility Testing with vitest-axe

### Decision

We use **vitest-axe** for automated accessibility testing in unit tests, integrated with our existing Vitest + React Testing Library setup.

### Context

Accessibility testing is critical for UI libraries. While manual testing and real user testing remain essential, automated testing catches common issues early in the development cycle.

### Options Considered

#### Option 1: Manual ARIA testing only (existing approach)

Testing ARIA attributes like `aria-labelledby`, `aria-modal`, etc. directly in tests.

**Pros:**
- No additional dependencies
- Full control over what's tested
- Catches specific, known issues

**Cons:**
- Limited coverage (~20% of a11y issues)
- Requires expertise to know what to test
- Easy to miss common violations

#### Option 2: vitest-axe (our choice)

Automated accessibility scanning using axe-core via vitest-axe.

**Pros:**
- Catches ~30-50% of accessibility issues automatically
- Based on WCAG standards and best practices
- Integrates seamlessly with Vitest
- Detailed violation reports with remediation guidance

**Cons:**
- Cannot catch all issues (color contrast doesn't work in jsdom)
- Requires jsdom (not happy-dom due to compatibility bug)
- Some false positives possible

#### Option 3: @axe-core/react

Runtime accessibility checking during development.

**Pros:**
- Catches issues during development
- Real browser environment

**Cons:**
- Not suitable for CI/test suites
- Different purpose than test-time validation

### Decision Rationale

1. **Complement, don't replace**: vitest-axe adds automated scanning while keeping our manual ARIA tests for specific behaviors
2. **CI Integration**: Fails builds when a11y violations are introduced
3. **Standards-based**: Tests against WCAG 2.0 A, AA and best practices by default
4. **Vitest native**: No Jest/Vitest conflicts (fork of jest-axe for Vitest)

### Setup

```ts
// vitest.setup.ts
import "@testing-library/jest-dom/vitest";
import * as matchers from "vitest-axe/matchers";
import { expect } from "vitest";

expect.extend(matchers);
```

### Usage Pattern

```tsx
import { axe } from "vitest-axe";

it("passes accessibility checks", async () => {
  render(<MyComponent />);
  const results = await axe(document.body);
  expect(results).toHaveNoViolations();
});
```

### Configuration Options

```tsx
import { axe, configureAxe } from "vitest-axe";

// Customize rules
const customAxe = configureAxe({
  rules: {
    "color-contrast": { enabled: false }, // jsdom limitation
    "landmark-one-main": { enabled: false }, // component testing
  },
  // Filter by impact level: 'minor' | 'moderate' | 'serious' | 'critical'
  impactLevels: ["serious", "critical"],
  // Test against specific WCAG levels
  runOnly: {
    type: "tag",
    values: ["wcag2a", "wcag2aa"],
  },
});

it("passes critical a11y checks", async () => {
  render(<Dialog open={true} />);
  expect(await customAxe(document.body)).toHaveNoViolations();
});
```

### Best Practices

| Practice | Rationale |
|----------|-----------|
| Test components in isolation | Catches component-specific issues before full page testing |
| Use realistic content | Placeholder text like "test" may not reveal content-related issues |
| Filter by impact for initial adoption | Start with `impactLevels: ['critical', 'serious']` to avoid overwhelming output |
| Don't disable rules without reason | Document why any rule is disabled |
| Keep vitest-axe updated | New rules and fixes are regularly added to axe-core |

### Limitations

1. **Color contrast**: Doesn't work in jsdom (disabled by default)
2. **Focus visibility**: Cannot verify visual focus indicators
3. **Screen reader behavior**: Cannot test actual screen reader experience
4. **Dynamic content**: May need to wait for async updates before testing
5. **~30-50% coverage**: Automated tools miss many issues—supplement with manual testing

### When to Add axe Tests

- ✅ Interactive components (Dialog, Dropdown, Combobox)
- ✅ Form components (Input, Select, Checkbox)
- ✅ Components with ARIA attributes
- ⚠️ Simple presentational components (optional)

### References

- [vitest-axe on GitHub](https://github.com/chaance/vitest-axe)
- [axe-core rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Deque University - Automated testing catches ~30% of issues](https://www.deque.com/blog/automated-testing-study-identifies-57-percent-of-digital-accessibility-issues/)

---

## Related Decisions

- [CVA over styled-components](./CLAUDE.md#why-cva-over-styled-componentsemotion) - Why we use class-variance-authority
- [Two-layer token system](./CLAUDE.md#two-layer-token-system) - Token architecture decisions
- [No forwardRef](./CLAUDE.md#why-no-forwardref) - React 19+ ref prop pattern
