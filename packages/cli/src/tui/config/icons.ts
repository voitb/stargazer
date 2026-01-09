import type { Severity, Decision } from '@stargazer/core';

/**
 * Shared icon constants for consistent display across formatters.
 * Uses star-themed icons for TUI, ASCII markers for CI environments.
 *
 * Star icon meanings:
 * ✦ (filled) - Primary/success/critical
 * ★ (star) - Secondary/high importance
 * ✧ (outline) - Tertiary/medium/hint
 * ◇ (diamond) - Info/low/comment
 * ○ (circle) - Destructive/error
 * ◌ (empty circle) - Exit/muted
 */

const isCI = process.env['CI'] === 'true';

/**
 * Severity level indicators for code review issues.
 * Star-themed for visual hierarchy.
 */
export const SEVERITY_EMOJI: Record<Severity, string> = isCI
  ? { critical: '[CRIT]', high: '[HIGH]', medium: '[MED]', low: '[LOW]' }
  : { critical: '✦', high: '★', medium: '✧', low: '◇' };

/**
 * Decision indicators for code review results.
 * Star-themed for consistency.
 */
export const DECISION_ICONS: Record<Decision, string> = isCI
  ? { approve: '[PASS]', request_changes: '[FAIL]', comment: '[INFO]' }
  : { approve: '✦', request_changes: '○', comment: '◇' };

/**
 * Miscellaneous icons used across the application.
 * Star-themed for consistency.
 */
export const MISC_ICONS = isCI
  ? {
      lightbulb: '[TIP]',
      clipboard: '[REF]',
      checkmark: '[OK]',
      pencil: '[EDIT]',
      crossmark: '[FAIL]',
    }
  : {
      lightbulb: '✧',
      clipboard: '◇',
      checkmark: '✦',
      pencil: '✧',
      crossmark: '○',
    };
