import type { ReviewResult, Issue, Severity, Decision } from '@stargazer/core';

// Use ASCII markers in CI environments for better log compatibility
const isCI = process.env['CI'] === 'true';

const SEVERITY_EMOJI: Record<Severity, string> = isCI
  ? { critical: '[CRIT]', high: '[HIGH]', medium: '[MED]', low: '[LOW]' }
  : { critical: '🔴', high: '🟠', medium: '🟡', low: '🔵' };

const DECISION_EMOJI: Record<Decision, string> = isCI
  ? { approve: '[PASS]', request_changes: '[FAIL]', comment: '[INFO]' }
  : { approve: '✅', request_changes: '❌', comment: '💬' };

// Header marker for CI vs regular output
const HEADER_EMOJI = isCI ? '[AI]' : '🤖';

export function formatReviewAsMarkdown(review: ReviewResult): string {
  const lines: string[] = [];

  lines.push(`## ${HEADER_EMOJI} Stargazer AI Review`);
  lines.push('');

  const decisionEmoji = DECISION_EMOJI[review.decision];
  lines.push(`**Decision:** ${decisionEmoji} ${formatDecision(review.decision)}`);
  lines.push('');

  lines.push('### Summary');
  lines.push('');
  lines.push(review.summary);
  lines.push('');

  if (review.issues.length === 0) {
    lines.push(`### ${DECISION_EMOJI.approve} No Issues Found`);
    lines.push('');
    lines.push('Great job! The code looks good.');
  } else {
    lines.push(`### Issues Found (${review.issues.length})`);
    lines.push('');

    const grouped = groupBySeverity(review.issues);

    for (const severity of ['critical', 'high', 'medium', 'low'] as Severity[]) {
      const issues = grouped[severity];
      if (issues && issues.length > 0) {
        lines.push(`#### ${SEVERITY_EMOJI[severity]} ${capitalize(severity)} (${issues.length})`);
        lines.push('');

        for (const issue of issues) {
          lines.push(formatIssue(issue));
        }

        lines.push('');
      }
    }
  }

  lines.push('---');
  lines.push('*Powered by [Stargazer](https://github.com/stargazer) + Google Gemini*');

  return lines.join('\n');
}

// Inline markers for suggestions and conventions
const SUGGESTION_MARKER = isCI ? '[TIP]' : '💡';
const CONVENTION_MARKER = isCI ? '[REF]' : '📋';

function formatIssue(issue: Issue): string {
  let line = `- **\`${issue.file}:${issue.line}\`** - ${issue.message}`;

  if (issue.suggestion) {
    line += `\n  - ${SUGGESTION_MARKER} *Suggestion:* ${issue.suggestion}`;
  }

  if (issue.conventionRef) {
    line += `\n  - ${CONVENTION_MARKER} *Convention:* ${issue.conventionRef}`;
  }

  return line;
}

function formatDecision(decision: Decision): string {
  switch (decision) {
    case 'approve':
      return 'Approved';
    case 'request_changes':
      return 'Changes Requested';
    case 'comment':
      return 'Comment';
  }
}

function groupBySeverity(issues: readonly Issue[]): Record<Severity, Issue[]> {
  const grouped: Record<Severity, Issue[]> = {
    critical: [],
    high: [],
    medium: [],
    low: [],
  };

  for (const issue of issues) {
    grouped[issue.severity].push(issue);
  }

  return grouped;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
