import type { ProjectConventions } from '../conventions/types';

function buildConventionContext(conventions: ProjectConventions | null): string {
  if (!conventions) return '';

  const sections: string[] = ['## Project Conventions\n'];
  sections.push('This project follows these coding conventions (discovered from codebase):\n');

  const { patterns } = conventions;

  if (patterns.errorHandling) {
    sections.push(`### Error Handling: ${patterns.errorHandling.name}`);
    sections.push(patterns.errorHandling.description);
    sections.push('');
  }

  if (patterns.naming) {
    sections.push(`### Naming: ${patterns.naming.name}`);
    sections.push(patterns.naming.description);
    sections.push('');
  }

  if (patterns.testing) {
    sections.push(`### Testing: ${patterns.testing.name}`);
    sections.push(patterns.testing.description);
    sections.push('');
  }

  if (patterns.imports) {
    sections.push(`### Imports: ${patterns.imports.name}`);
    sections.push(patterns.imports.description);
    sections.push('');
  }

  sections.push('Flag any code that violates these conventions in your review.\n');

  return sections.join('\n');
}

/**
 * Build review prompt with optional conventions context.
 */
export function buildReviewPrompt(
  diff: string,
  conventions?: ProjectConventions | null
): string {
  const conventionContext = conventions
    ? buildConventionContext(conventions)
    : '';

  return `You are an expert code reviewer. Analyze the following git diff and identify issues.

Focus on:
- Bugs and logic errors
- Security vulnerabilities
- Performance problems
- Code style violations
${conventionContext ? `\nProject Conventions:\n${conventionContext}` : ''}

For each issue found, provide:
- The file path and line number
- Severity (critical, high, medium, low)
- Category (bug, security, convention, performance)
- Clear description of the issue
- Specific suggestion for fixing it
- Confidence score from 0.0 to 1.0 (e.g., 0.9 for highly confident, 0.5 for uncertain)
${conventionContext ? '- Convention reference if applicable' : ''}

Be thorough but avoid false positives. Only report issues you are confident about.

Diff to review:
\`\`\`diff
${diff}
\`\`\`

Respond with your structured review.`;
}

/** @deprecated Use buildReviewPrompt(diff, conventions) instead */
export const buildReviewPromptWithConventions = buildReviewPrompt;
