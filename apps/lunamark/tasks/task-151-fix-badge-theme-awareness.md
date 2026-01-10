---
id: task-151
title: Fix Badge component theme awareness
status: done
priority: critical
labels:
  - cli
  - design-system
  - bug-fix
created: '2025-01-10'
order: 151
assignee: ai-agent
depends_on: []
---

## Description

The Badge component in the design system uses hardcoded hex colors instead of theme-aware tokens. This causes incorrect colors when users have light theme terminals.

## Problem

**File:** `packages/cli/src/tui/design-system/components/badge.tsx`

Lines 41-48 have hardcoded colors:
```typescript
const variantColors: Record<BadgeVariant, string> = {
  default: '#f8fafc',  // HARDCODED - not theme-aware
  success: statusColors.success.text,
  warning: statusColors.warning.text,
  error: statusColors.error.text,
  info: statusColors.info.text,
  brand: '#7dd3fc', // HARDCODED - not theme-aware
};
```

Other components (Card, InputField, ProgressBar) correctly use `useTheme()` hook, but Badge does not.

## Acceptance Criteria

- [ ] Badge component uses `useTheme()` hook
- [ ] All colors come from theme context
- [ ] Works correctly on both dark and light themes
- [ ] No hardcoded hex colors in the component
- [ ] All existing Badge usage still works (no breaking changes)

## Implementation

**File:** `packages/cli/src/tui/design-system/components/badge.tsx`

### Step 1: Add useTheme import

```typescript
// Change this import
import { Text } from 'ink';
import { type ReactNode } from 'react';
import { gradientLine } from '../gradient.js';
import { STAR_ICONS, type PaletteName } from '../palettes.js';
import { statusColors } from '../tokens/colors.js';

// To this (add useTheme)
import { Text } from 'ink';
import { type ReactNode } from 'react';
import { gradientLine } from '../gradient.js';
import { STAR_ICONS, type PaletteName } from '../palettes.js';
import { statusColors, textColors, brandColors } from '../tokens/colors.js';
import { useTheme } from '../primitives/theme-provider.js';
```

### Step 2: Create theme-aware color getter

Replace the static `variantColors` object with a function that gets theme-aware colors:

```typescript
/**
 * Get variant color based on current theme
 */
function getVariantColor(variant: BadgeVariant, theme: 'dark' | 'light'): string {
  switch (variant) {
    case 'default':
      return textColors[theme].primary;
    case 'success':
      return statusColors.success.text;
    case 'warning':
      return statusColors.warning.text;
    case 'error':
      return statusColors.error.text;
    case 'info':
      return statusColors.info.text;
    case 'brand':
      return brandColors[theme].primary;
  }
}
```

### Step 3: Update Badge component to use useTheme

```typescript
export function Badge({
  variant = 'default',
  children,
  showIcon = true,
  gradient = false,
}: BadgeProps) {
  const { theme } = useTheme();
  const icon = variantIcons[variant];
  const color = getVariantColor(variant, theme);
  const palette = variantPalettes[variant];

  const content = showIcon ? `${icon} ${String(children)}` : String(children);

  if (gradient) {
    return (
      <Text>
        {gradientLine(content, { palette })}
      </Text>
    );
  }

  return <Text color={color}>{content}</Text>;
}
```

### Step 4: Update CountBadge and PillBadge

```typescript
export function CountBadge({ count, variant = 'default', label }: CountBadgeProps) {
  const { theme } = useTheme();
  const icon = variantIcons[variant];
  const color = getVariantColor(variant, theme);

  const text = label ? `${icon} ${count} ${label}` : `${icon} ${count}`;

  return <Text color={color}>{text}</Text>;
}

export function PillBadge({ children, variant = 'default' }: PillBadgeProps) {
  const { theme } = useTheme();
  const icon = variantIcons[variant];
  const color = getVariantColor(variant, theme);

  return (
    <Text color={color}>
      [{icon} {children}]
    </Text>
  );
}
```

### Step 5: Remove the old variantColors constant

Delete lines 41-48 (the old static `variantColors` object).

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
```

## Verification

After implementation, verify:
1. Run the CLI and check Badge components render correctly
2. If possible, test with `STARGAZER_THEME=light` environment variable
3. Check that status bar badges still work
4. Check that review results badges still work

## Files Changed

- `packages/cli/src/tui/design-system/components/badge.tsx`
