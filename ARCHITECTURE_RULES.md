# Architecture Rules

Generic architectural guidelines for React/TypeScript applications. These rules apply across all apps and packages.

---

## Table of Contents

1. [Core Principles](#core-principles)
2. [File Organization](#file-organization)
3. [Hook Extraction Guidelines](#hook-extraction-guidelines)
4. [Component Splitting Rules](#component-splitting-rules)
5. [Utility Function Guidelines](#utility-function-guidelines)
6. [Type Organization](#type-organization)
7. [Decision Trees](#decision-trees)

---

## Core Principles

### The Golden Rules

1. **Duplication is cheaper than wrong abstraction** - Extract only when patterns are proven
2. **Unidirectional codebase flow** - Root modules → features → app (never backwards)
3. **Colocation over centralization** - Keep code close to where it's used
4. **Explicit over implicit** - Data flow should be traceable
5. **Single responsibility** - One reason to change per module

### Dependency Flow

```
┌─────────────────────────────────────────────────────────┐
│                         app/                            │
│         (pages, routing, app-level providers)           │
└─────────────────────────┬───────────────────────────────┘
                          │ imports from
                          ▼
┌─────────────────────────────────────────────────────────┐
│                      features/                          │
│        (domain logic, feature components, APIs)         │
└─────────────────────────┬───────────────────────────────┘
                          │ imports from
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Root-level shared modules                  │
│  (components/, hooks/, utils/, types/, lib/, config/)   │
└─────────────────────────────────────────────────────────┘
```

**Cross-feature communication**: Features should NOT import from each other directly. Use the app layer to orchestrate.

**Import direction rule**: Code can only import from layers below it:
- `app/` → can import from `features/` and root-level modules
- `features/` → can import from root-level modules only (NOT other features)
- Root-level modules → can import from each other, but NOT from `features/` or `app/`

---

## File Organization

### Project Structure (Bulletproof React Style)

```
src/
├── app/                          # Application layer
│   ├── routes/                   # Route definitions / pages
│   ├── app.tsx                   # Main application component
│   ├── provider.tsx              # Global providers wrapper
│   └── router.tsx                # Router configuration
│
├── assets/                       # Static files (images, fonts, etc.)
│
├── components/                   # Shared UI components (used across features)
│
├── config/                       # Global configurations, env variables
│
├── features/                     # Feature-based modules
│   └── [feature-name]/
│       ├── api/                  # Feature API calls & queries
│       ├── components/           # Feature-specific components
│       ├── hooks/                # Feature-specific hooks
│       ├── types/                # Feature-specific types
│       ├── utils/                # Feature-specific utilities
│       └── index.ts              # Public API (selective exports)
│
├── hooks/                        # Shared hooks (used across features)
│
├── lib/                          # Pre-configured reusable libraries
│
├── stores/                       # Global state stores
│
├── testing/                      # Test utilities and mocks
│
├── types/                        # Shared type definitions
│
└── utils/                        # Shared utility functions
```

**Why flat structure over `shared/` folder:**
- Root-level position already implies "shared across the app"
- Cleaner imports: `@/components/Button` vs `@/shared/components/Button`
- Matches [Bulletproof React](https://github.com/alan2207/bulletproof-react) conventions

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `user-profile.tsx` |
| Components | PascalCase | `UserProfile` |
| Hooks | camelCase with `use` prefix | `useUserProfile` |
| Utilities | camelCase | `formatDate` |
| Types | PascalCase | `UserProfileProps` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT` |

### Barrel File Rules

**Avoid barrel files (`index.ts` with re-exports) except:**

1. Component folder public API (single component export)
2. Feature module public API (selective exports)

**Why**: Barrel files break tree-shaking and create circular dependency risks.

```typescript
// GOOD: Feature public API (selective exports)
// features/auth/index.ts
export { LoginForm } from './components/login-form'
export { useAuth } from './hooks/use-auth'
export type { User, AuthState } from './types'

// BAD: Re-exporting everything
export * from './components'
export * from './hooks'
```

---

## Hook Extraction Guidelines

### The Three-Component Rule

**Extract a hook when logic is used by 3+ components.**

Before 3 uses, keep logic inline or in component-specific hooks. Premature extraction creates unnecessary abstraction.

### Hook Categories

| Category | Location | When to Use |
|----------|----------|-------------|
| Component-specific | `ComponentName/use-component-name.ts` | Complex logic for one component |
| Feature-specific | `features/[name]/hooks/` | Shared within a feature |
| Application-wide | `hooks/` (root-level) | Used across multiple features |

### Hook Naming

Name hooks after their **purpose**, not implementation.

```typescript
// GOOD: Purpose-focused
useUserPermissions()    // What it provides
useFormValidation()     // What it does
useKeyboardNavigation() // What behavior it adds

// BAD: Implementation-focused
useUserState()          // Too vague
useFormEffect()         // Describes mechanism, not purpose
useKeyListener()        // Too low-level
```

### When to Extract a Hook

Extract when:
1. Logic is reused across 3+ components
2. Complex logic that obscures component's main purpose
3. Logic has a clear, nameable purpose
4. You want to test the logic independently

### When NOT to Extract

Keep logic inline when:
1. **Trivial**: Single `useState` or `useRef`
2. **Contextual**: Logic is meaningless outside the component
3. **Unclear name**: If you can't name it clearly, it's not ready

```typescript
// Keep inline - too trivial
function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}

// Extract - complex, reusable
function useCounter(initial = 0, { min, max }: CounterOptions = {}) {
  const [count, setCount] = useState(initial)

  const increment = useCallback(() => {
    setCount(c => max !== undefined ? Math.min(c + 1, max) : c + 1)
  }, [max])

  const decrement = useCallback(() => {
    setCount(c => min !== undefined ? Math.max(c - 1, min) : c - 1)
  }, [min])

  return { count, increment, decrement }
}
```

---

## Component Splitting Rules

### When to Split a Component

| Signal | Action |
|--------|--------|
| `renderX()` function inside component | Extract as separate component |
| Component accepts too many props (>7) | Split into smaller components or use composition |
| >3 levels of prop drilling | Consider Context or composition |
| Multiple responsibilities | Split by responsibility |
| Reused UI pattern | Extract to shared component |

### Single Responsibility Principle

Each component should have **one reason to change**.

```typescript
// BAD: Multiple responsibilities
function UserDashboard() {
  // Fetching data
  // Processing data
  // Rendering header
  // Rendering sidebar
  // Rendering content
  // Handling user actions
}

// GOOD: Split by responsibility
function UserDashboard() {
  return (
    <DashboardLayout>
      <DashboardHeader />
      <DashboardSidebar />
      <DashboardContent />
    </DashboardLayout>
  )
}
```

### Composition Over Configuration

Prefer composable children over complex prop APIs:

```typescript
// BAD: Configuration-heavy
<Card
  title="User"
  subtitle="Active"
  headerIcon={<UserIcon />}
  footerActions={[<Button>Edit</Button>]}
/>

// GOOD: Composable
<Card>
  <Card.Header>
    <UserIcon />
    <Card.Title>User</Card.Title>
    <Card.Subtitle>Active</Card.Subtitle>
  </Card.Header>
  <Card.Footer>
    <Button>Edit</Button>
  </Card.Footer>
</Card>
```

---

## Utility Function Guidelines

### When to Create a Utility

1. **Pure function** - No side effects, same input = same output
2. **Reusable** - Used in 2+ places (or will be)
3. **Domain-agnostic** - Not tied to specific feature logic
4. **Testable** - Easy to unit test in isolation

### Utility Categories

| Category | Location | Examples |
|----------|----------|----------|
| Feature-specific | `features/[name]/utils/` | `parseUserInput()`, `validateOrder()` |
| Application-wide | `utils/` | `formatDate()`, `debounce()`, `cn()` |
| Type utilities | `types/utils.ts` | `Prettify<T>`, `StrictOmit<T>` |

### Utility vs Hook

| Use Utility When | Use Hook When |
|------------------|---------------|
| Pure transformation | Needs React state |
| Synchronous operation | Needs effects/lifecycle |
| No React dependencies | Uses other hooks |
| Data formatting | Manages subscriptions |

```typescript
// UTILITY: Pure transformation
function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

// HOOK: Needs React state
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}
```

---

## Type Organization

### Type Categories

| Category | Location | Description |
|----------|----------|-------------|
| Domain types | `features/[name]/types/` | Business entities for that feature |
| API types | `features/[name]/api/types.ts` | Request/response shapes |
| Shared types | `types/` | Types used across features |
| Utility types | `types/utils.ts` | Generic type helpers |

### Common Utility Types

```typescript
// types/utils.ts

// Make type properties more readable in IDE
type Prettify<T> = { [K in keyof T]: T[K] } & {}

// Stricter Omit that requires valid keys
type StrictOmit<T, K extends keyof T> = Omit<T, K>

// Require at least one of the specified keys
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> &
  { [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>> }[Keys]

// Make specific properties optional
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Make specific properties required
type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>
```

### Props Typing Patterns

```typescript
// Extending native elements (React 19+)
type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary'
  loading?: boolean
}

// Discriminated unions for variants
type AlertProps =
  | { variant: 'success'; onDismiss?: () => void }
  | { variant: 'error'; error: Error; retry?: () => void }
  | { variant: 'warning'; action?: ReactNode }

// Generic component props
type ListProps<T> = {
  items: T[]
  renderItem: (item: T, index: number) => ReactNode
  keyExtractor: (item: T) => string
}
```

---

## Decision Trees

### Should I Extract This Hook?

```
START
  │
  ▼
Is this logic used by 3+ components?
  │
  ├─ YES
  │   │
  │   ▼
  │   Used across multiple features?
  │     │
  │     ├─ YES ──► hooks/  (root-level)
  │     │
  │     └─ NO ──► features/[name]/hooks/
  │
  └─ NO
      │
      ▼
    Is it complex logic for a single component?
      │
      ├─ YES ──► ComponentName/use-component-name.ts
      │
      └─ NO
          │
          ▼
        Is it trivial (single useState/useRef)?
          │
          ├─ YES ──► Keep inline in component
          │
          └─ NO
              │
              ▼
            Can you name it after its PURPOSE clearly?
              │
              ├─ YES ──► Extract to component folder
              │
              └─ NO ──► Not ready to extract. Keep inline.
```

### Should I Extract This Component?

```
START
  │
  ▼
Is it used in multiple places?
  │
  ├─ YES
  │   │
  │   ▼
  │   Used across multiple features?
  │     │
  │     ├─ YES ──► components/  (root-level)
  │     │
  │     └─ NO ──► features/[name]/components/
  │
  └─ NO
      │
      ▼
    Does it have a single responsibility?
      │
      ├─ NO ──► Split into multiple components
      │
      └─ YES
          │
          ▼
        Is it a render function inside another component?
          │
          ├─ YES ──► Extract to separate component
          │
          └─ NO
              │
              ▼
            Is there >3 levels of prop drilling?
              │
              ├─ YES ──► Consider Context + compound component
              │
              └─ NO ──► Keep as part of parent
```

### Where Does This Code Belong?

```
START
  │
  ▼
Is it feature-specific code?
  │
  ├─ YES ──► features/[name]/[type]/
  │          (components/, hooks/, types/, utils/, api/)
  │
  └─ NO (used across multiple features)
      │
      ▼
    What type of code is it?
      │
      ├─ UI Component ──────────► components/
      ├─ Hook ──────────────────► hooks/
      ├─ Type definition ───────► types/
      ├─ Utility function ──────► utils/
      ├─ Pre-configured lib ────► lib/
      ├─ Global state ──────────► stores/
      └─ Configuration ─────────► config/
```

### Should I Create a Utility?

```
START
  │
  ▼
Is it a pure function (no side effects)?
  │
  ├─ NO ──► Consider a hook or service instead
  │
  └─ YES
      │
      ▼
    Is it reusable (used 2+ places)?
      │
      ├─ NO ──► Keep inline or wait for reuse
      │
      └─ YES
          │
          ▼
        Is it feature-specific?
          │
          ├─ YES ──► features/[name]/utils/
          │
          └─ NO ──► utils/
```

### Is This Abstraction Ready?

```
START
  │
  ▼
Have you seen this pattern 3+ times?
  │
  ├─ NO ──► STOP. Duplication is cheaper than wrong abstraction.
  │
  └─ YES
      │
      ▼
    Can you name it clearly after its PURPOSE?
      │
      ├─ NO ──► STOP. If you can't name it, it's not ready.
      │
      └─ YES
          │
          ▼
        Do all use cases fit the same interface?
          │
          ├─ NO ──► STOP. Wait for patterns to converge.
          │
          └─ YES
              │
              ▼
            Will it make the code MORE readable?
              │
              ├─ NO ──► STOP. Abstraction for abstraction's sake.
              │
              └─ YES ──► EXTRACT. Create the abstraction.
```

---

## Quick Reference

### File Naming Cheatsheet

```
Component:        user-profile.tsx
Hook:             use-user-profile.ts
Utility:          format-date.ts
Types:            types.ts (or user.types.ts)
Test:             user-profile.test.tsx
```

### Import Order

```typescript
// 1. React
import { useState, useEffect } from 'react'

// 2. External libraries
import { clsx } from 'clsx'

// 3. Internal - absolute paths
import { Button } from '@/components'
import { useAuth } from '@/features/auth'

// 4. Internal - relative paths
import { useUserProfile } from './use-user-profile'

// 5. Types (if separate)
import type { UserProfileProps } from './types'

// 6. Styles/assets
import './user-profile.css'
```

---

## React 19+ Considerations

### Automatic Memoization (React Compiler)

The React Compiler (React Forget) can automatically handle `useMemo`/`useCallback` optimization in many cases. Manual memoization is optional for fine-grained control, but not required for most use cases.

**When manual memoization is still beneficial:**
- Performance-critical paths you've measured with profiling
- Libraries that need explicit stability guarantees
- Expensive computations with clear dependency arrays
- Callbacks passed to memoized children (measured impact)

**When to skip manual memoization:**
- Simple calculations or object creation
- Callbacks passed to native DOM elements
- When you haven't measured a performance problem

```typescript
// Often unnecessary with React Compiler
const expensiveValue = useMemo(() => computeExpensive(data), [data])

// Still useful for measured performance issues
const sortedItems = useMemo(() => {
  // 10,000+ items, measured 50ms computation
  return heavySort(items, sortConfig)
}, [items, sortConfig])
```

### Server vs Client Components (Next.js/RSC)

When using Next.js App Router or React Server Components:

| Component Type | Default to | Use Case |
|----------------|------------|----------|
| Data fetching | Server | Static content, SEO, initial data |
| Interactive UI | Client | Forms, modals, state-dependent UI |
| Hybrid | Server wrapper + Client islands | Optimized bundles |

**Decision rule:** Start with Server Components, add `'use client'` only when needed.

```typescript
// Server Component (default) - no directive needed
async function UserProfile({ userId }: { userId: string }) {
  const user = await getUser(userId)  // Direct database/API call
  return (
    <div>
      <h1>{user.name}</h1>
      <UserActions userId={userId} />  {/* Client island */}
    </div>
  )
}

// Client Component - needs interactivity
'use client'
function UserActions({ userId }: { userId: string }) {
  const [isFollowing, setIsFollowing] = useState(false)
  return <button onClick={() => toggleFollow(userId)}>Follow</button>
}
```

**Client boundary minimization:**
- Keep client components as small as possible
- Pass serializable props from server to client
- Avoid wrapping entire pages in `'use client'`

---

## References

- [Bulletproof React](https://github.com/alan2207/bulletproof-react)
- [React Docs - Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [React Compiler](https://react.dev/learn/react-compiler)
- [Next.js App Router](https://nextjs.org/docs/app)
