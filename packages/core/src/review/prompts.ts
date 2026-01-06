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

export function buildReviewPrompt(diff: string): string {
  return `You are a senior code reviewer. Review the following git diff and identify issues.

Focus on:
- Bugs and logic errors
- Security vulnerabilities
- Code style and conventions
- Performance issues

Be specific: include file path, line number, and clear explanation.
Only report real issues with high confidence.

Git Diff:
\`\`\`diff
${diff}
\`\`\`

Respond with your structured review.`;
}

export function buildReviewPromptWithConventions(
  diff: string,
  conventions: ProjectConventions | null
): string {
  const conventionContext = buildConventionContext(conventions);

  return `You are a senior code reviewer. Review the following git diff and identify issues.

Focus on:
- Bugs and logic errors
- Security vulnerabilities
- Code style and conventions
- Performance issues

Be specific: include file path, line number, and clear explanation.
Only report real issues with high confidence.

${conventionContext}
Git Diff:
\`\`\`diff
${diff}
\`\`\`

Respond with your structured review.`;
}
