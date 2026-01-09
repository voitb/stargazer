/**
 * Stargazer CLI Design System - Motion Tokens
 *
 * Animation timing and duration tokens.
 * Essential for typewriter effects, spinners, and transitions.
 *
 * Apple/Stripe philosophy: purposeful motion that guides attention.
 *
 * @example
 * ```typescript
 * import { duration, spinnerConfig } from './motion.js';
 *
 * // Typewriter effect
 * const interval = setInterval(() => {
 *   // Reveal next character
 * }, duration.fast);
 *
 * // Spinner rotation
 * const spinnerInterval = setInterval(() => {
 *   // Next frame
 * }, spinnerConfig.frameInterval);
 * ```
 */

/**
 * Duration scale in milliseconds
 *
 * | Token   | Ms   | Use Case |
 * |---------|------|----------|
 * | instant | 0    | No animation |
 * | fast    | 100  | Micro-interactions, spinner frames |
 * | normal  | 200  | Standard transitions |
 * | slow    | 400  | Emphasis, large movements |
 * | slower  | 600  | Dramatic reveals |
 */
export const duration = {
  /** No animation */
  instant: 0,
  /** 100ms - micro-interactions, spinner frames */
  fast: 100,
  /** 200ms - standard transitions */
  normal: 200,
  /** 400ms - emphasis, larger movements */
  slow: 400,
  /** 600ms - dramatic reveals, long animations */
  slower: 600,
} as const;

export type DurationToken = keyof typeof duration;
export type DurationValue = (typeof duration)[DurationToken];

/**
 * Easing functions (conceptual - terminals don't support CSS easing)
 * These describe the intended feel of animations
 */
export const easing = {
  /** Constant speed */
  linear: 'linear',
  /** Start slow, end fast */
  easeIn: 'ease-in',
  /** Start fast, end slow (most natural) */
  easeOut: 'ease-out',
  /** Slow at both ends */
  easeInOut: 'ease-in-out',
} as const;

export type EasingToken = keyof typeof easing;

/**
 * Spinner configuration
 */
export const spinnerConfig = {
  /** Frame interval in ms */
  frameInterval: duration.fast,
  /** Star spinner frames */
  starFrames: ['✦', '✧', '☆', '★'] as const,
  /** Dot spinner frames */
  dotFrames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'] as const,
  /** Simple frames for fallback */
  simpleFrames: ['|', '/', '-', '\\'] as const,
} as const;

export type SpinnerType = 'star' | 'dot' | 'simple';

/**
 * Get spinner frames by type
 */
export function getSpinnerFrames(type: SpinnerType): readonly string[] {
  switch (type) {
    case 'star':
      return spinnerConfig.starFrames;
    case 'dot':
      return spinnerConfig.dotFrames;
    case 'simple':
      return spinnerConfig.simpleFrames;
  }
}

/**
 * Typewriter configuration
 */
export const typewriterConfig = {
  /** Default ms per character */
  charInterval: 50,
  /** Fast typing speed */
  fastCharInterval: 25,
  /** Slow/dramatic speed */
  slowCharInterval: 100,
  /** Pause after punctuation */
  punctuationPause: 150,
} as const;

/**
 * Pulse/glow animation configuration
 */
export const pulseConfig = {
  /** Full cycle duration in ms */
  cycleDuration: 1000,
  /** Intensity range [min, max] from 0-1 */
  intensityRange: [0.5, 1.0] as const,
} as const;

/**
 * Combined motion tokens export
 */
export const motion = {
  duration,
  easing,
  spinner: spinnerConfig,
  typewriter: typewriterConfig,
  pulse: pulseConfig,
} as const;
