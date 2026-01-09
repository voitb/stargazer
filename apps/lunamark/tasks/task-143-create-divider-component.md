---
id: task-143
title: Create Divider component
status: pending
priority: high
labels:
  - cli
  - design-system
  - components
created: '2025-01-09'
order: 143
assignee: glm
depends_on:
  - task-131
---

## Description

Create a Divider component for themed section separators.
Includes star-themed patterns unique to Stargazer branding.

## Reference

See: `packages/cli/CLI_DESIGN_SYSTEM.md` - Component Library section
See: `task-131` for createDivider function

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/design-system/components/divider.tsx`
- [ ] Support variants: line, star, dots, diamond
- [ ] Support auto-width (fills container)
- [ ] Support fixed width
- [ ] Optional label in center

## Implementation

**File**: `packages/cli/src/tui/design-system/components/divider.tsx`

```typescript
/**
 * Stargazer CLI Design System - Divider Component
 *
 * Themed section separators with star-branded variants.
 *
 * @example
 * ```typescript
 * import { Divider } from './divider.js';
 *
 * <Divider variant="star" />
 * // Output: ✦────────────────────────────────────✦
 *
 * <Divider variant="star" label="Section" />
 * // Output: ✦──────── Section ────────✦
 * ```
 */

import { Box, Text, useStdout } from 'ink';
import { createDivider, dividerChars } from '../tokens/borders.js';
import { gradientLine } from '../gradient.js';
import type { PaletteName } from '../palettes.js';

export type DividerVariant = 'line' | 'star' | 'dots' | 'diamond';

export interface DividerProps {
  /** Divider style variant */
  variant?: DividerVariant;
  /** Fixed width (default: auto-fill container) */
  width?: number;
  /** Optional center label */
  label?: string;
  /** Color palette for gradient (star variant) */
  palette?: PaletteName;
  /** Use dimmed color */
  dimmed?: boolean;
}

/**
 * Divider Component
 *
 * Horizontal separator line with various styles.
 */
export function Divider({
  variant = 'line',
  width: fixedWidth,
  label,
  palette,
  dimmed = true,
}: DividerProps) {
  const { stdout } = useStdout();
  const terminalWidth = stdout?.columns ?? 80;

  // Calculate width
  const width = fixedWidth ?? Math.min(terminalWidth - 4, 60);

  // With label - split divider around label
  if (label) {
    return <LabeledDivider variant={variant} width={width} label={label} palette={palette} dimmed={dimmed} />;
  }

  // Simple divider
  const dividerStr = createDivider(variant, width);

  // Apply gradient to star variant
  if (palette && (variant === 'star' || variant === 'diamond')) {
    return <Text>{gradientLine(dividerStr, { palette })}</Text>;
  }

  return <Text dimColor={dimmed}>{dividerStr}</Text>;
}

/**
 * Divider with centered label
 */
interface LabeledDividerProps {
  variant: DividerVariant;
  width: number;
  label: string;
  palette?: PaletteName;
  dimmed?: boolean;
}

function LabeledDivider({ variant, width, label, palette, dimmed }: LabeledDividerProps) {
  const labelWithPadding = ` ${label} `;
  const labelLength = labelWithPadding.length;

  // Calculate side lengths
  const sideWidth = Math.max(0, Math.floor((width - labelLength) / 2));

  // Get start/end characters based on variant
  const { startChar, endChar, lineChar } = getVariantChars(variant);

  // Build left and right sides
  const leftInner = lineChar.repeat(Math.max(0, sideWidth - 1));
  const rightInner = lineChar.repeat(Math.max(0, sideWidth - 1));

  const left = `${startChar}${leftInner}`;
  const right = `${rightInner}${endChar}`;

  const fullDivider = `${left}${labelWithPadding}${right}`;

  if (palette && (variant === 'star' || variant === 'diamond')) {
    // Apply gradient but keep label readable
    const leftStyled = gradientLine(left, { palette });
    const rightStyled = gradientLine(right, { palette });

    return (
      <Text>
        {leftStyled}
        <Text dimColor>{labelWithPadding}</Text>
        {rightStyled}
      </Text>
    );
  }

  return <Text dimColor={dimmed}>{fullDivider}</Text>;
}

function getVariantChars(variant: DividerVariant) {
  switch (variant) {
    case 'star':
      return {
        startChar: dividerChars.starStart,
        endChar: dividerChars.starEnd,
        lineChar: dividerChars.line,
      };
    case 'diamond':
      return {
        startChar: dividerChars.diamond,
        endChar: dividerChars.diamond,
        lineChar: dividerChars.line,
      };
    case 'dots':
      return {
        startChar: dividerChars.dot,
        endChar: dividerChars.dot,
        lineChar: dividerChars.dot,
      };
    case 'line':
    default:
      return {
        startChar: dividerChars.line,
        endChar: dividerChars.line,
        lineChar: dividerChars.line,
      };
  }
}

/**
 * Shorthand components for common divider types
 */
export function StarDivider(props: Omit<DividerProps, 'variant'>) {
  return <Divider {...props} variant="star" />;
}

export function DotDivider(props: Omit<DividerProps, 'variant'>) {
  return <Divider {...props} variant="dots" />;
}

export function LineDivider(props: Omit<DividerProps, 'variant'>) {
  return <Divider {...props} variant="line" />;
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
import { Divider, StarDivider } from '../design-system/components/divider.js';

function ContentSections() {
  return (
    <Box flexDirection="column" gap={1}>
      <Text>Section 1 content</Text>

      <StarDivider palette="stellar" />

      <Text>Section 2 content</Text>

      <Divider variant="star" label="Results" palette="stellar" />

      <Text>Results content</Text>

      <Divider variant="dots" />

      <Text dimColor>Footer</Text>
    </Box>
  );
}
```
