---
id: task-061
title: Create markdown formatter for PR
status: todo
priority: medium
labels:
  - action
  - output
created: '2026-01-01'
order: 610
---
## Description

Create a markdown formatter for PR comments.

## Acceptance Criteria

- [ ] Create `packages/action/src/format.ts`
- [ ] Implement `formatReviewAsMarkdown()` function
- [ ] Use emoji for severity indicators
- [ ] Include summary and decision

## Implementation

**File**: `packages/action/src/format.ts`

```typescript
import type { ReviewResult, Issue, Severity, Decision } from '@stargazer/core';

const SEVERITY_EMOJI: Record<Severity, string> = {
  critical: '🔴',
  high: '🟠',
  medium: '🟡',
  low: '🔵',
};

const DECISION_EMOJI: Record<Decision, string> = {
  approve: '✅',
  request_changes: '❌',
  comment: '💬',
};

/**
 * Formats a review result as GitHub-flavored markdown.
 */
export function formatReviewAsMarkdown(review: ReviewResult): string {
  const lines: string[] = [];

  // Header
  lines.push('## 🤖 Stargazer AI Review');
  lines.push('');

  // Decision
  const decisionEmoji = DECISION_EMOJI[review.decision];
  lines.push(`**Decision:** ${decisionEmoji} ${formatDecision(review.decision)}`);
  lines.push('');

  // Summary
  lines.push('### Summary');
  lines.push('');
  lines.push(review.summary);
  lines.push('');

  // Issues
  if (review.issues.length === 0) {
    lines.push('### ✅ No Issues Found');
    lines.push('');
    lines.push('Great job! The code looks good.');
  } else {
    lines.push(`### Issues Found (${review.issues.length})`);
    lines.push('');

    // Group by severity
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

  // Footer
  lines.push('---');
  lines.push('*Powered by [Stargazer](https://github.com/stargazer) + Google Gemini*');

  return lines.join('\n');
}

function formatIssue(issue: Issue): string {
  let line = `- **\`${issue.file}:${issue.line}\`** - ${issue.message}`;

  if (issue.suggestion) {
    line += `\n  - 💡 *Suggestion:* ${issue.suggestion}`;
  }

  if (issue.conventionRef) {
    line += `\n  - 📋 *Convention:* ${issue.conventionRef}`;
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

function groupBySeverity(issues: Issue[]): Record<Severity, Issue[]> {
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
```

## Test

```bash
cd packages/action && pnpm tsc --noEmit
```

TypeScript compiles without errors.
