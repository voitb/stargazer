---
id: task-150
title: Update design system main index
status: pending
priority: high
labels:
  - cli
  - design-system
  - integration
created: '2025-01-09'
order: 150
assignee: glm
depends_on:
  - task-149
  - task-135
  - task-136
  - task-137
  - task-138
  - task-140
  - task-142
  - task-143
  - task-144
  - task-145
  - task-146
  - task-147
  - task-148
---

## Description

Update the main design system index to export all new modules.
Final integration task that brings everything together.

## Reference

See: `packages/cli/CLI_DESIGN_SYSTEM.md`
Existing: `packages/cli/src/tui/design-system/index.ts`

## Acceptance Criteria

- [ ] Update `packages/cli/src/tui/design-system/index.ts`
- [ ] Export all tokens
- [ ] Export all primitives (gradient, theme-provider)
- [ ] Export all animations
- [ ] Export all logo utilities
- [ ] Export all components
- [ ] Export all utilities
- [ ] Maintain backward compatibility with existing exports

## Implementation

**File**: `packages/cli/src/tui/design-system/index.ts` (UPDATE)

```typescript
/**
 * Stargazer CLI Design System
 *
 * A premium, Apple/Stripe-inspired design system for terminal interfaces.
 * Built with Ink (React for CLI), inspired by Claude Code & Gemini CLI.
 *
 * ## Quick Start
 *
 * ```typescript
 * import {
 *   // Tokens
 *   tokens,
 *   spacing,
 *   typography,
 *
 *   // Primitives
 *   gradientLine,
 *   gradientText,
 *   ThemeProvider,
 *   useTheme,
 *
 *   // Logo
 *   Logo,
 *   AnimatedLogo,
 *   renderLogo,
 *
 *   // Animations
 *   StarSpinner,
 *   Typewriter,
 *
 *   // Components
 *   Card,
 *   Divider,
 *   Badge,
 *   KeyHint,
 *   Toast,
 *
 *   // Utils
 *   detectTheme,
 *   getTerminalSize,
 * } from './design-system/index.js';
 * ```
 *
 * @module design-system
 */

// ═══════════════════════════════════════════════════════════════
// TOKENS
// ═══════════════════════════════════════════════════════════════

export * from './tokens/index.js';

// ═══════════════════════════════════════════════════════════════
// PRIMITIVES (existing + new)
// ═══════════════════════════════════════════════════════════════

// Gradient utilities (existing)
export {
  type GradientDirection,
  gradientLine,
  gradientText,
} from './gradient.js';

// Theme provider (new)
export {
  ThemeProvider,
  useTheme,
  useIsDark,
  detectTheme as detectThemeFromEnv,
  type Theme,
  type ThemeProviderProps,
  type ThemeContextValue,
} from './primitives/theme-provider.js';

// ═══════════════════════════════════════════════════════════════
// LOGO (existing + new)
// ═══════════════════════════════════════════════════════════════

// ASCII art definitions (existing)
export {
  STAR_LOGO,
  SLIM_LOGO,
  renderLogo,
  renderCompactLogo,
  renderStarIcon,
} from './ascii-logo.js';

// Responsive logo (new)
export {
  breakpoints,
  getBreakpoint as getLogoBreakpoint,
  getLogoVariant,
  useTerminalSize,
  useBreakpoint,
  useResponsiveLogo,
  useMediaQuery,
  useShouldShowTagline,
  type Breakpoint,
  type LogoVariant,
  type TerminalSize,
} from './logo/responsive.js';

// Logo component (new)
export {
  Logo,
  StarIcon,
  BrandMark,
  type LogoProps,
  type BrandMarkProps,
} from './logo/logo-component.js';

// Animated logo (new)
export {
  AnimatedLogo,
  useAnimatedIntro,
  type AnimatedLogoProps,
} from './logo/animated-logo.js';

// ═══════════════════════════════════════════════════════════════
// ANIMATIONS (new)
// ═══════════════════════════════════════════════════════════════

export {
  StarSpinner,
  LoadingIndicator,
  useSpinnerFrame,
  type StarSpinnerProps,
  type LoadingIndicatorProps,
} from './animations/star-spinner.js';

export {
  Typewriter,
  MultiLineTypewriter,
  useTypewriter,
  type TypewriterProps,
  type MultiLineTypewriterProps,
} from './animations/typewriter.js';

export {
  Pulse,
  Blink,
  FocusRing,
  usePulse,
  type PulseProps,
  type BlinkProps,
  type FocusRingProps,
} from './animations/pulse.js';

// ═══════════════════════════════════════════════════════════════
// COMPONENTS (new)
// ═══════════════════════════════════════════════════════════════

export {
  Card,
  SimpleCard,
  type CardProps,
  type CardVariant,
  type SimpleCardProps,
} from './components/card.js';

export {
  Divider,
  StarDivider,
  DotDivider,
  LineDivider,
  type DividerProps,
  type DividerVariant,
} from './components/divider.js';

export {
  Badge,
  SuccessBadge,
  WarningBadge,
  ErrorBadge,
  InfoBadge,
  CountBadge,
  PillBadge,
  type BadgeProps,
  type BadgeVariant,
  type CountBadgeProps,
  type PillBadgeProps,
} from './components/badge.js';

export {
  KeyHint,
  SingleKeyHint,
  KeyHintBar,
  FormattedKeyHint,
  formatKey,
  KEY_SYMBOLS,
  type KeyHintProps,
  type KeyHintBarProps,
} from './components/key-hint.js';

export {
  Toast,
  Notification,
  useToast,
  type ToastProps,
  type ToastVariant,
  type ToastData,
  type NotificationProps,
} from './components/toast.js';

// ═══════════════════════════════════════════════════════════════
// UTILITIES (new)
// ═══════════════════════════════════════════════════════════════

export {
  detectTheme,
  getThemeFromEnv,
  getThemeConfig,
  isLightTheme,
  isDarkTheme,
  parseColorfgbg,
  type ThemeConfig,
} from './utils/detect-theme.js';

export {
  getTerminalSize,
  getTerminalWidth,
  getTerminalHeight,
  getBreakpoint,
  isAboveBreakpoint,
  canShowFullLogo,
  canShowTagline,
  getCenterPadding,
  getSafeWidth,
  truncateToFit,
  DEFAULT_SIZE,
} from './utils/terminal-size.js';
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
```

## Verification

After this task, the following imports should work:

```typescript
import {
  // Everything from original
  gradientLine,
  gradientText,
  renderLogo,
  STAR_ICONS,
  PALETTES,

  // New tokens
  tokens,
  spacing,
  typography,

  // New theme
  ThemeProvider,
  useTheme,
  detectTheme,

  // New animations
  StarSpinner,
  Typewriter,

  // New components
  Card,
  Divider,
  Badge,
  KeyHint,

  // New logo
  Logo,
  AnimatedLogo,
} from '../design-system/index.js';
```
