---
id: task-030
title: Add terminal formatting
status: todo
priority: medium
labels:
  - cli
  - output
created: '2026-01-01'
order: 300
---
## Description

Create beautiful terminal output with colors using chalk.

## Acceptance Criteria

- [ ] Create `packages/cli/src/output/terminal.ts`
- [ ] Implement `formatReview()` function
- [ ] Color-code issues by severity
- [ ] Show decision with emoji

## Implementation

**File**: `packages/cli/src/output/terminal.ts`

```typescript
import chalk from 'chalk';
import type { ReviewResult, Issue, Severity, Decision } from '@stargazer/core/review/schemas';

const SEVERITY_COLORS: Record<Severity, (text: string) => string> = {
  critical: chalk.red.bold,
  high: chalk.red,
  medium: chalk.yellow,
  low: chalk.blue,
};

const DECISION_ICONS: Record<Decision, string> = {
  approve: '✅',
  request_changes: '🔴',
  comment: '💬',
};

export function formatReview(review: ReviewResult): string {
  const lines: string[] = [];

  // Header
  lines.push(chalk.bold('\n📝 Code Review Results\n'));

  // Decision
  const decisionIcon = DECISION_ICONS[review.decision];
  lines.push(`Decision: ${decisionIcon} ${chalk.bold(review.decision)}`);

  // Summary
  lines.push(`\n${review.summary}\n`);

  // Issues
  if (review.issues.length === 0) {
    lines.push(chalk.green('✓ No issues found!'));
  } else {
    lines.push(chalk.bold(`Found ${review.issues.length} issue(s):\n`));
    review.issues.forEach((issue, i) => {
      lines.push(formatIssue(issue, i + 1));
    });
  }

  lines.push(''); // Empty line at end
  return lines.join('\n');
}

function formatIssue(issue: Issue, num: number): string {
  const color = SEVERITY_COLORS[issue.severity];
  const severityBadge = color(`[${issue.severity.toUpperCase()}]`);
  const location = chalk.cyan(`${issue.file}:${issue.line}`);

  let output = `${num}. ${severityBadge} ${location}\n`;
  output += `   ${issue.message}`;

  if (issue.suggestion) {
    output += `\n   ${chalk.dim('💡')} ${chalk.dim(issue.suggestion)}`;
  }

  output += '\n';
  return output;
}
```

## Test

```bash
cd packages/cli && pnpm tsc --noEmit
```

TypeScript compiles without errors.
