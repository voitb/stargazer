/**
 * CSS Token Types
 * Template literal types for compile-time CSS variable validation.
 */

import type { ColorAliasTokens } from './alias/colors'

// Color token names derive from ColorAliasTokens keys
type ColorTokenKey = keyof ColorAliasTokens

// Map camelCase to kebab-case CSS variable names
type CamelToKebab<S extends string> = S extends `${infer T}${infer U}`
  ? T extends Uppercase<T>
    ? `-${Lowercase<T>}${CamelToKebab<U>}`
    : `${T}${CamelToKebab<U>}`
  : S

/** CSS variable name for color tokens: `--color-brand-background`, etc. */
export type ColorCSSVariable = `--color-${CamelToKebab<ColorTokenKey>}`

/** Full rgb(var(...)) usage pattern */
export type ColorUsage = `rgb(var(${ColorCSSVariable}))` | `rgb(var(${ColorCSSVariable})/${string})`

// Spacing tokens
export type SpacingToken = 'none' | 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl' | 'xxxxl' | 'xxxxxl'
export type SpacingCSSVariable = `--spacing-${SpacingToken}`

// Radius tokens
export type RadiusToken = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl' | 'full'
export type RadiusCSSVariable = `--radius-${RadiusToken}`

// Duration tokens
export type DurationToken = 'ultra-fast' | 'faster' | 'fast' | 'normal' | 'slow' | 'slower' | 'ultra-slow'
export type DurationCSSVariable = `--duration-${DurationToken}`

// Easing tokens
export type EasingToken = 'default' | 'ease-out' | 'ease-in' | 'spring'
export type EasingCSSVariable = `--easing-${EasingToken}`

/** All CSS custom property types */
export type CSSTokenVariable =
  | ColorCSSVariable
  | SpacingCSSVariable
  | RadiusCSSVariable
  | DurationCSSVariable
  | EasingCSSVariable
