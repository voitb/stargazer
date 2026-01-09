import type { Severity, Decision } from '@stargazer/core';

/**
 * Shared icon/emoji constants for consistent display across formatters.
 * CI environments use ASCII markers; terminals use emojis.
 */

const isCI = process.env['CI'] === 'true';

/**
 * Severity level indicators for code review issues.
 */
export const SEVERITY_EMOJI: Record<Severity, string> = isCI
  ? { critical: '[CRIT]', high: '[HIGH]', medium: '[MED]', low: '[LOW]' }
  : { critical: '🔴', high: '🟠', medium: '🟡', low: '🔵' };

/**
 * Decision indicators for code review results.
 */
export const DECISION_ICONS: Record<Decision, string> = isCI
  ? { approve: '[PASS]', request_changes: '[FAIL]', comment: '[INFO]' }
  : { approve: '✅', request_changes: '🔴', comment: '💬' };

/**
 * Miscellaneous icons used across the application.
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
      lightbulb: '💡',
      clipboard: '📋',
      checkmark: '✓',
      pencil: '📝',
      crossmark: '❌',
    };
