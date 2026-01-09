import chalk from 'chalk';
import type { ReviewResult, Issue, Severity } from '@stargazer/core';
import { DECISION_ICONS, MISC_ICONS } from '../tui/constants/icons.js';

const SEVERITY_COLORS: Record<Severity, (text: string) => string> = {
  critical: chalk.red.bold,
  high: chalk.red,
  medium: chalk.yellow,
  low: chalk.blue,
};

export function formatReview(review: ReviewResult): string {
  const lines: string[] = [];

  lines.push(chalk.bold(`\n${MISC_ICONS.pencil} Code Review Results\n`));

  const decisionIcon = DECISION_ICONS[review.decision];
  lines.push(`Decision: ${decisionIcon} ${chalk.bold(review.decision)}`);

  lines.push(`\n${review.summary}\n`);

  if (review.issues.length === 0) {
    lines.push(chalk.green(`${MISC_ICONS.checkmark} No issues found!`));
  } else {
    lines.push(chalk.bold(`Found ${review.issues.length} issue(s):\n`));

    review.issues.forEach((issue, i) => {
      lines.push(formatIssue(issue, i + 1));
    });
  }

  lines.push('');

  return lines.join('\n');
}

function formatIssue(issue: Issue, num: number): string {
  const color = SEVERITY_COLORS[issue.severity];
  const severityBadge = color(`[${issue.severity.toUpperCase()}]`);
  const location = chalk.cyan(`${issue.file}:${issue.line}`);

  let output = `${num}. ${severityBadge} ${location}\n`;
  output += `   ${issue.message}`;

  if (issue.suggestion) {
    output += `\n   ${chalk.dim(MISC_ICONS.lightbulb)} ${chalk.dim(issue.suggestion)}`;
  }

  if (issue.conventionRef) {
    output += `\n   ${chalk.dim(`${MISC_ICONS.clipboard} Convention:`)} ${chalk.dim(issue.conventionRef)}`;
  }

  output += '\n';
  return output;
}
