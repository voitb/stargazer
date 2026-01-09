---
id: task-136
title: Create star spinner animation
status: pending
priority: high
labels:
  - cli
  - design-system
  - animation
created: '2025-01-09'
order: 136
assignee: glm
depends_on:
  - task-133
  - task-134
---

## Description

Create a star-themed spinner component that rotates through star icons.
Unique to Stargazer branding, replacing generic spinners.

## Reference

See: `packages/cli/CLI_DESIGN_SYSTEM.md` - Animation System section

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/design-system/animations/star-spinner.tsx`
- [ ] Implement frame rotation: ✦ → ✧ → ☆ → ★ → ✦
- [ ] Support gradient coloring via palette prop
- [ ] Support different spinner types (star, dot, simple)
- [ ] Configurable speed

## Implementation

**File**: `packages/cli/src/tui/design-system/animations/star-spinner.tsx`

```typescript
/**
 * Stargazer CLI Design System - Star Spinner
 *
 * Animated spinner with star-themed frames.
 * Unique branding element that replaces generic loading indicators.
 *
 * @example
 * ```typescript
 * import { StarSpinner } from './star-spinner.js';
 *
 * <StarSpinner palette="stellar" />
 * <StarSpinner type="dot" />
 * ```
 */

import { useState, useEffect } from 'react';
import { Text } from 'ink';
import { gradientLine } from '../gradient.js';
import { spinnerConfig, getSpinnerFrames, type SpinnerType } from '../tokens/motion.js';
import type { PaletteName } from '../palettes.js';

export interface StarSpinnerProps {
  /** Spinner frame type */
  type?: SpinnerType;
  /** Color palette for gradient */
  palette?: PaletteName;
  /** Custom frame interval in ms (default: 100) */
  interval?: number;
  /** Optional label text after spinner */
  label?: string;
}

/**
 * Star Spinner Component
 *
 * Animated spinner with star-themed frames.
 * Frame sequence: ✦ → ✧ → ☆ → ★ → ✦
 */
export function StarSpinner({
  type = 'star',
  palette = 'stellar',
  interval = spinnerConfig.frameInterval,
  label,
}: StarSpinnerProps) {
  const frames = getSpinnerFrames(type);
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrameIndex((current) => (current + 1) % frames.length);
    }, interval);

    return () => clearInterval(timer);
  }, [frames.length, interval]);

  const currentFrame = frames[frameIndex];
  const coloredFrame = gradientLine(currentFrame, { palette });

  if (label) {
    return (
      <Text>
        {coloredFrame} <Text>{label}</Text>
      </Text>
    );
  }

  return <Text>{coloredFrame}</Text>;
}

/**
 * Hook to use spinner frames manually
 *
 * @example
 * ```typescript
 * const frame = useSpinnerFrame('star');
 * // Returns current frame: ✦, ✧, ☆, or ★
 * ```
 */
export function useSpinnerFrame(
  type: SpinnerType = 'star',
  interval: number = spinnerConfig.frameInterval
): string {
  const frames = getSpinnerFrames(type);
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrameIndex((current) => (current + 1) % frames.length);
    }, interval);

    return () => clearInterval(timer);
  }, [frames.length, interval]);

  return frames[frameIndex];
}

/**
 * Loading indicator with spinner and message
 */
export interface LoadingIndicatorProps {
  /** Loading message */
  message: string;
  /** Spinner type */
  type?: SpinnerType;
  /** Color palette */
  palette?: PaletteName;
}

export function LoadingIndicator({
  message,
  type = 'star',
  palette = 'stellar',
}: LoadingIndicatorProps) {
  return (
    <Text>
      <StarSpinner type={type} palette={palette} />
      <Text> {message}</Text>
    </Text>
  );
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
import { StarSpinner, LoadingIndicator } from '../design-system/animations/star-spinner.js';

function ReviewProgress() {
  return (
    <Box flexDirection="column">
      <LoadingIndicator message="Analyzing code..." palette="stellar" />

      {/* Or manually */}
      <Box>
        <StarSpinner type="star" />
        <Text> Processing files...</Text>
      </Box>
    </Box>
  );
}
```
