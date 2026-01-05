/**
 * Global Motion Tokens (Layer 1)
 * Fluent 2 motion: functional, natural, consistent, appealing
 */

// Duration scale
export const durations = {
  ultraFast: "50ms",
  faster: "100ms",
  fast: "150ms",
  normal: "200ms",
  slow: "300ms",
  slower: "400ms",
  ultraSlow: "500ms",
} as const;

// Easing curves
export const easings = {
  // Default for most UI transitions
  default: "cubic-bezier(0.4, 0, 0.2, 1)",

  // For elements entering (decelerate)
  easeOut: "cubic-bezier(0, 0, 0.2, 1)",

  // For elements exiting (accelerate)
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",

  // Spring-like bounce for playful interactions
  spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",

  // Linear for continuous animations
  linear: "linear",
} as const;

// Semantic motion presets
export const transitions = {
  // Fast interactions (buttons, toggles)
  fast: `${durations.fast} ${easings.default}`,

  // Normal UI transitions
  normal: `${durations.normal} ${easings.default}`,

  // Slow transitions (modals, large elements)
  slow: `${durations.slow} ${easings.default}`,

  // Enter transitions
  enterFast: `${durations.fast} ${easings.easeOut}`,
  enterNormal: `${durations.normal} ${easings.easeOut}`,
  enterSlow: `${durations.slow} ${easings.easeOut}`,

  // Exit transitions
  exitFast: `${durations.fast} ${easings.easeIn}`,
  exitNormal: `${durations.normal} ${easings.easeIn}`,
  exitSlow: `${durations.slow} ${easings.easeIn}`,

  // Spring transitions
  springFast: `${durations.fast} ${easings.spring}`,
  springNormal: `${durations.normal} ${easings.spring}`,
} as const;

export type DurationKey = keyof typeof durations;
export type EasingKey = keyof typeof easings;
export type TransitionKey = keyof typeof transitions;
