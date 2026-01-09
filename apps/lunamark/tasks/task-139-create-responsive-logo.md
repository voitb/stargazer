---
id: task-139
title: Create responsive logo system
status: pending
priority: high
labels:
  - cli
  - design-system
  - logo
  - responsive
created: '2025-01-09'
order: 139
assignee: glm
depends_on:
  - task-134
---

## Description

Create a responsive logo system that detects terminal width and renders the appropriate logo variant.
Following Gemini CLI's approach of dynamic logo sizing.

## Reference

See: `packages/cli/CLI_DESIGN_SYSTEM.md` - Logo System section
Existing: `packages/cli/src/tui/design-system/ascii-logo.ts`

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/design-system/logo/responsive.ts`
- [ ] Implement terminal width detection hook
- [ ] Define breakpoints (xs, sm, md, lg, xl)
- [ ] Map breakpoints to logo variants (minimal, compact, medium, full)
- [ ] Export useResponsiveLogo hook

## Implementation

**File**: `packages/cli/src/tui/design-system/logo/responsive.ts`

```typescript
/**
 * Stargazer CLI Design System - Responsive Logo System
 *
 * Detects terminal width and selects appropriate logo variant.
 * Inspired by Gemini CLI's dynamic logo sizing.
 *
 * @example
 * ```typescript
 * import { useResponsiveLogo, useTerminalSize } from './responsive.js';
 *
 * const logoVariant = useResponsiveLogo();
 * // Returns: 'full' | 'medium' | 'compact' | 'minimal'
 * ```
 */

import { useState, useEffect } from 'react';
import { useStdout } from 'ink';

/**
 * Terminal size breakpoints
 *
 * | Breakpoint | Min Width | Logo Variant |
 * |------------|-----------|--------------|
 * | xl         | 120       | full + tagline |
 * | lg         | 80        | full |
 * | md         | 60        | medium |
 * | sm         | 40        | compact |
 * | xs         | < 40      | minimal |
 */
export const breakpoints = {
  xl: 120,
  lg: 80,
  md: 60,
  sm: 40,
} as const;

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type LogoVariant = 'full' | 'medium' | 'compact' | 'minimal';

/**
 * Map breakpoint to logo variant
 */
export const breakpointToLogo: Record<Breakpoint, LogoVariant> = {
  xl: 'full',
  lg: 'full',
  md: 'medium',
  sm: 'compact',
  xs: 'minimal',
};

/**
 * Get breakpoint from terminal width
 */
export function getBreakpoint(width: number): Breakpoint {
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
}

/**
 * Get logo variant from terminal width
 */
export function getLogoVariant(width: number): LogoVariant {
  const breakpoint = getBreakpoint(width);
  return breakpointToLogo[breakpoint];
}

export interface TerminalSize {
  columns: number;
  rows: number;
}

/**
 * Hook to get current terminal size
 *
 * Updates when terminal is resized (on supported terminals)
 */
export function useTerminalSize(): TerminalSize {
  const { stdout } = useStdout();

  const [size, setSize] = useState<TerminalSize>({
    columns: stdout?.columns ?? 80,
    rows: stdout?.rows ?? 24,
  });

  useEffect(() => {
    if (!stdout) return;

    const handleResize = () => {
      setSize({
        columns: stdout.columns,
        rows: stdout.rows,
      });
    };

    // Initial size
    handleResize();

    // Listen for resize events
    stdout.on('resize', handleResize);

    return () => {
      stdout.off('resize', handleResize);
    };
  }, [stdout]);

  return size;
}

/**
 * Hook to get current breakpoint
 */
export function useBreakpoint(): Breakpoint {
  const { columns } = useTerminalSize();
  return getBreakpoint(columns);
}

/**
 * Hook to get responsive logo variant
 *
 * @example
 * ```typescript
 * function Header() {
 *   const logoVariant = useResponsiveLogo();
 *
 *   return <Logo variant={logoVariant} palette="stellar" />;
 * }
 * ```
 */
export function useResponsiveLogo(): LogoVariant {
  const { columns } = useTerminalSize();
  return getLogoVariant(columns);
}

/**
 * Hook to check if terminal is at or above a breakpoint
 */
export function useMediaQuery(minBreakpoint: Breakpoint): boolean {
  const currentBreakpoint = useBreakpoint();

  const order: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl'];
  const currentIndex = order.indexOf(currentBreakpoint);
  const minIndex = order.indexOf(minBreakpoint);

  return currentIndex >= minIndex;
}

/**
 * Check if we should show tagline (only on xl terminals)
 */
export function useShouldShowTagline(): boolean {
  return useMediaQuery('xl');
}
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
```

## Usage Example

```typescript
import { Box, Text } from 'ink';
import { useResponsiveLogo, useBreakpoint, useShouldShowTagline } from '../design-system/logo/responsive.js';
import { renderLogo } from '../design-system/ascii-logo.js';

function ResponsiveHeader() {
  const logoVariant = useResponsiveLogo();
  const showTagline = useShouldShowTagline();
  const breakpoint = useBreakpoint();

  return (
    <Box flexDirection="column">
      <Text>
        {renderLogo({
          palette: 'stellar',
          slim: logoVariant === 'medium',
          tagline: showTagline ? 'AI-Powered Code Review' : undefined,
        })}
      </Text>
      <Text dimColor>Terminal: {breakpoint}</Text>
    </Box>
  );
}
```
