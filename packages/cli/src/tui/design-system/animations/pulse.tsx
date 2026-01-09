/**
 * Stargazer CLI Design System - Pulse Animation
 *
 * Gradient intensity oscillation effect for focus/active states.
 * Provides a subtle "breathing" animation to draw attention.
 *
 * Note: Terminal gradients can't smoothly animate, so this works by
 * cycling through discrete intensity levels.
 *
 * @example
 * ```typescript
 * import { Pulse, usePulse } from './pulse.js';
 *
 * <Pulse>
 *   <Text>Pulsing content</Text>
 * </Pulse>
 * ```
 */

import { useState, useEffect, type ReactNode } from 'react';
import { Text, Box } from 'ink';
import { pulseConfig } from '../tokens/motion.js';

export interface PulseProps {
  /** Child content to pulse */
  children: ReactNode;
  /** Cycle duration in ms */
  duration?: number;
  /** Intensity range [min, max] from 0-1 */
  intensityRange?: readonly [number, number];
  /** Number of intensity steps */
  steps?: number;
  /** Whether animation is active */
  active?: boolean;
}

/**
 * Calculate intensity at a given point in the cycle
 * Uses sine wave for smooth oscillation
 */
function calculateIntensity(
  progress: number,
  min: number,
  max: number
): number {
  // Sine wave from 0 to 1 based on progress
  const sineValue = (Math.sin(progress * Math.PI * 2 - Math.PI / 2) + 1) / 2;
  return min + sineValue * (max - min);
}

/**
 * Pulse Component
 *
 * Wraps content with a pulsing dim effect.
 * Uses dimColor attribute to simulate intensity changes.
 */
export function Pulse({
  children,
  duration = pulseConfig.cycleDuration,
  intensityRange = pulseConfig.intensityRange,
  steps = 10,
  active = true,
}: PulseProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      setStep((s) => (s + 1) % steps);
    }, duration / steps);

    return () => clearInterval(interval);
  }, [duration, steps, active]);

  const progress = step / steps;
  const intensity = calculateIntensity(
    progress,
    intensityRange[0],
    intensityRange[1]
  );

  // In terminals, we approximate intensity with dimColor
  // At low intensity, we dim the text
  const shouldDim = intensity < 0.7;

  return (
    <Text dimColor={shouldDim}>
      {children}
    </Text>
  );
}

/**
 * Hook to get current pulse intensity
 *
 * @returns Current intensity value between 0 and 1
 */
export function usePulse(
  duration: number = pulseConfig.cycleDuration,
  intensityRange: readonly [number, number] = pulseConfig.intensityRange,
  steps: number = 20
): number {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % steps);
    }, duration / steps);

    return () => clearInterval(interval);
  }, [duration, steps]);

  const progress = step / steps;
  return calculateIntensity(progress, intensityRange[0], intensityRange[1]);
}

/**
 * Blinking effect (simpler alternative to pulse)
 *
 * Toggles visibility at regular intervals
 */
export interface BlinkProps {
  children: ReactNode;
  /** Blink interval in ms */
  interval?: number;
  /** Whether blinking is active */
  active?: boolean;
}

export function Blink({
  children,
  interval = 500,
  active = true,
}: BlinkProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!active) {
      setVisible(true);
      return;
    }

    const timer = setInterval(() => {
      setVisible((v) => !v);
    }, interval);

    return () => clearInterval(timer);
  }, [interval, active]);

  if (!visible) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Focus ring effect
 *
 * Visual indicator for focused elements
 */
export interface FocusRingProps {
  children: ReactNode;
  focused?: boolean;
  color?: string;
}

export function FocusRing({
  children,
  focused = false,
  color = 'cyan',
}: FocusRingProps) {
  return (
    <Box borderStyle={focused ? 'round' : undefined} borderColor={focused ? color : undefined}>
      {children}
    </Box>
  );
}
