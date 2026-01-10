---
id: task-153
title: Remove unused design system code
status: pending
priority: medium
labels:
  - cli
  - design-system
  - cleanup
created: '2025-01-10'
order: 153
assignee: ai-agent
depends_on:
  - task-151
  - task-152
---

## Description

Code review found approximately 240 lines of unused code in the design system that should be removed to reduce complexity.

## Items to Remove

### 1. Remove entire layers.ts file

**File to DELETE:** `packages/cli/src/tui/design-system/tokens/layers.ts`

Terminals don't have z-index. This entire file is conceptual and never used.

### 2. Remove unused token getter functions

**File:** `packages/cli/src/tui/design-system/tokens/spacing.ts`

Remove these unused functions (keep only the `spacing` constant and types):
```typescript
// DELETE this function
export function getSpacing(token: SpacingToken): SpacingValue {
  return spacing[token];
}

// DELETE this object
export const spacingDefaults = {
  componentPadding: spacing.md,
  itemGap: spacing.sm,
  sectionMargin: spacing.lg,
} as const;
```

**File:** `packages/cli/src/tui/design-system/tokens/typography.ts`

Remove:
```typescript
// DELETE this function
export function getTypography(token: TypographyToken): TypographyStyle {
  return typography[token];
}
```

### 3. Remove easing object from motion.ts

**File:** `packages/cli/src/tui/design-system/tokens/motion.ts`

Remove (terminals don't support CSS easing):
```typescript
// DELETE this entire object and its exports
export const easing = {
  linear: 'linear',
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
} as const;

export type EasingToken = keyof typeof easing;
```

### 4. Remove unused shorthand components

**File:** `packages/cli/src/tui/design-system/components/badge.tsx`

Remove these shorthand components (lines ~93-111):
```typescript
// DELETE all of these - just use <Badge variant="success"> directly
export function SuccessBadge({ children, ...props }: Omit<BadgeProps, 'variant'>) { ... }
export function WarningBadge({ children, ...props }: Omit<BadgeProps, 'variant'>) { ... }
export function ErrorBadge({ children, ...props }: Omit<BadgeProps, 'variant'>) { ... }
export function InfoBadge({ children, ...props }: Omit<BadgeProps, 'variant'>) { ... }
export function BrandBadge({ children, ...props }: Omit<BadgeProps, 'variant'>) { ... }
```

**File:** `packages/cli/src/tui/design-system/components/divider.tsx`

Remove these shorthand components:
```typescript
// DELETE all of these - just use <Divider variant="star"> directly
export function StarDivider(props: Omit<DividerProps, 'variant'>) { ... }
export function DotDivider(props: Omit<DividerProps, 'variant'>) { ... }
export function LineDivider(props: Omit<DividerProps, 'variant'>) { ... }
```

**File:** `packages/cli/src/tui/design-system/components/key-hint.tsx`

Remove these shorthand components:
```typescript
// DELETE these - never used
export function SingleKeyHint({ keyName, children, dimmed }: SingleKeyHintProps) { ... }
export function FormattedKeyHint({ keys, children, dimmed }: FormattedKeyHintProps) { ... }
```

### 5. Remove unused terminal size utilities

**File:** `packages/cli/src/tui/design-system/utils/terminal-size.ts`

Remove these unused functions:
```typescript
// DELETE these functions - React hooks are used instead
export function canShowFullLogo(): boolean { ... }
export function canShowTagline(): boolean { ... }
export function getCenterPadding(contentWidth: number): number { ... }
export function getSafeWidth(margin: number = 2): number { ... }
export function truncateToFit(text: string, maxWidth?: number, ellipsis?: string): string { ... }
```

### 6. Update exports in index files

After removing the above, update the barrel exports:

**File:** `packages/cli/src/tui/design-system/tokens/index.ts`

Remove exports for:
- `layers` (entire module)
- `getSpacing`, `spacingDefaults`
- `getTypography`
- `easing`, `EasingToken`

**File:** `packages/cli/src/tui/design-system/components/index.ts`

Remove exports for:
- `SuccessBadge`, `WarningBadge`, `ErrorBadge`, `InfoBadge`, `BrandBadge`
- `StarDivider`, `DotDivider`, `LineDivider`
- `SingleKeyHint`, `FormattedKeyHint`

**File:** `packages/cli/src/tui/design-system/index.ts`

Remove exports for all the above items.

**File:** `packages/cli/src/tui/design-system/utils/index.ts`

Remove exports for:
- `canShowFullLogo`, `canShowTagline`, `getCenterPadding`, `getSafeWidth`, `truncateToFit`

## Acceptance Criteria

- [ ] layers.ts file is deleted
- [ ] Unused getter functions removed from spacing.ts and typography.ts
- [ ] easing object removed from motion.ts
- [ ] Shorthand badge components removed
- [ ] Shorthand divider components removed
- [ ] Shorthand key-hint components removed
- [ ] Unused terminal size utilities removed
- [ ] All index.ts files updated to remove exports
- [ ] TypeScript compilation passes
- [ ] No runtime errors

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
```

## Files Changed

- DELETE: `packages/cli/src/tui/design-system/tokens/layers.ts`
- `packages/cli/src/tui/design-system/tokens/spacing.ts`
- `packages/cli/src/tui/design-system/tokens/typography.ts`
- `packages/cli/src/tui/design-system/tokens/motion.ts`
- `packages/cli/src/tui/design-system/tokens/index.ts`
- `packages/cli/src/tui/design-system/components/badge.tsx`
- `packages/cli/src/tui/design-system/components/divider.tsx`
- `packages/cli/src/tui/design-system/components/key-hint.tsx`
- `packages/cli/src/tui/design-system/components/index.ts`
- `packages/cli/src/tui/design-system/utils/terminal-size.ts`
- `packages/cli/src/tui/design-system/utils/index.ts`
- `packages/cli/src/tui/design-system/index.ts`
