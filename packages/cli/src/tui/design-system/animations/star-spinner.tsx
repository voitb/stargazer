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

  const currentFrame = frames[frameIndex] ?? frames[0] ?? '';
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

  return frames[frameIndex] ?? frames[0] ?? '';
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
