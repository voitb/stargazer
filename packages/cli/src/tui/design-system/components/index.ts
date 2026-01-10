/**
 * Stargazer CLI Design System - Components Barrel
 */

export {
  Card,
  SimpleCard,
  type CardProps,
  type CardVariant,
  type SimpleCardProps,
} from './card.js';

export {
  Divider,
  type DividerProps,
  type DividerVariant,
} from './divider.js';

export {
  Badge,
  CountBadge,
  PillBadge,
  type BadgeProps,
  type BadgeVariant,
  type CountBadgeProps,
  type PillBadgeProps,
} from './badge.js';

export {
  KeyHint,
  KeyHintBar,
  FormattedKeyHint,
  formatKey,
  KEY_SYMBOLS,
  type KeyHintProps,
  type KeyHintBarProps,
} from './key-hint.js';

export {
  Toast,
  Notification,
  type ToastProps,
  type ToastVariant,
  type ToastData,
  type NotificationProps,
} from './toast.js';

// Re-export useToast from hooks for backwards compatibility
export { useToast } from '../hooks/use-toast.js';

export {
  ProgressBar,
  CompactProgressBar,
  ProgressPercent,
  type ProgressBarProps,
} from './progress-bar.js';

export {
  UsageDisplay,
  TokenBadge,
  type UsageDisplayProps,
} from './usage-display.js';

export {
  InputField,
  InlineInput,
  type InputFieldProps,
} from './input-field.js';

export {
  SelectWithArrows,
  type SelectOption,
  type SelectWithArrowsProps,
} from './select-with-arrows.js';

// Screen & Section titles
export {
  ScreenTitle,
  SectionTitle,
  type ScreenTitleProps,
  type SectionTitleProps,
} from './titles.js';

// Status text components
export {
  StatusText,
  SeverityText,
  DecisionText,
  DECISION_DISPLAY,
  type StatusTextProps,
  type StatusVariant,
  type SeverityTextProps,
  type SeverityLevel,
  type DecisionTextProps,
  type DecisionType,
} from './status-text.js';

// Label & hint text
export {
  LabelText,
  HintText,
  CodeText,
  type LabelTextProps,
} from './labels.js';

// Menu icons
export { MENU_ICONS } from './icons.js';
