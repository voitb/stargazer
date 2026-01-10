/**
 * Review Result Formatting Utility
 *
 * Formats ReviewResult objects into human-readable strings for display.
 */

import type { ReviewResult } from '@stargazer/core';

/**
 * Format a ReviewResult into a displayable string.
 *
 * @param result - The review result to format
 * @returns Formatted string representation
 *
 * @example
 * ```ts
 * const formatted = formatReviewResult(reviewResult);
 * // Output:
 * // Decision: approve
 * // Summary: Code looks good overall
 * //
 * // Issues found: 2
 * //
 * // 1. [warning] src/utils.ts:42
 * //    Consider using const instead of let
 * ```
 */
export function formatReviewResult(result: ReviewResult): string {
  const lines: string[] = [];

  if (result.decision) {
    lines.push(`Decision: ${result.decision}`);
  }

  if (result.summary) {
    lines.push(`Summary: ${result.summary}`);
  }

  if (result.issues && result.issues.length > 0) {
    lines.push(`\nIssues found: ${result.issues.length}`);

    result.issues.forEach((issue, i) => {
      const severity = issue.severity || 'info';
      const file = issue.file || 'unknown';
      const line = issue.line || 0;

      lines.push(`\n${i + 1}. [${severity}] ${file}:${line}`);

      if (issue.message) {
        lines.push(`   ${issue.message}`);
      }

      if (issue.suggestion) {
        lines.push(`   Suggestion: ${issue.suggestion}`);
      }
    });
  } else {
    lines.push('\nNo issues found!');
  }

  return lines.join('\n');
}
