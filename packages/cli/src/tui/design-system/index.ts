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
  BrandBadge,
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

export {
  ProgressBar,
  CompactProgressBar,
  ProgressPercent,
  type ProgressBarProps,
} from './components/progress-bar.js';

export {
  UsageDisplay,
  TokenBadge,
  type UsageDisplayProps,
} from './components/usage-display.js';

export {
  InputField,
  InlineInput,
  type InputFieldProps,
} from './components/input-field.js';

export {
  // Screen & Section titles
  ScreenTitle,
  SectionTitle,
  type ScreenTitleProps,
  type SectionTitleProps,
  // Status text
  StatusText,
  type StatusTextProps,
  type StatusVariant,
  // Label & hint text
  LabelText,
  HintText,
  CodeText,
  type LabelTextProps,
  // Severity display
  SeverityText,
  type SeverityTextProps,
  type SeverityLevel,
  // Decision display
  DecisionText,
  type DecisionTextProps,
  type DecisionType,
  DECISION_DISPLAY,
  // Menu icons
  MENU_ICONS,
} from './components/text.js';

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
