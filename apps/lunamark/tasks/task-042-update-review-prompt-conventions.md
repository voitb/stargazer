---
id: task-042
title: Update review prompt with conventions
status: done
assignee: voitb
priority: medium
labels:
  - core
  - review
created: '2026-01-01'
order: 420
---
## Description

Enhance the review prompt to include project conventions when available.

## Acceptance Criteria

- [x] Update `packages/core/src/review/prompts.ts`
- [x] Accept optional conventions parameter
- [x] Include conventions in prompt when provided
- [x] Instruct AI to reference conventions by name

## Implementation

**File**: `packages/core/src/review/prompts.ts`

```typescript
import type { ProjectConventions } from '../conventions/schemas';

export function buildReviewPrompt(
  diff: string,
  conventions?: ProjectConventions
): string {
  const conventionsSection = conventions
    ? formatConventionsSection(conventions)
    : '';

  return `You are a senior code reviewer. Review the following git diff and identify issues.

${conventionsSection}

Focus on:
- Bugs and logic errors
- Security vulnerabilities
- Code style and conventions
- Performance issues
${conventions ? '- Violations of the project conventions listed above' : ''}

Be specific: include file path, line number, and clear explanation.
${conventions ? 'If a convention is violated, reference it by name in the conventionRef field.' : ''}
Only report real issues with high confidence.

Git Diff:
\`\`\`diff
${diff}
\`\`\`

Respond with your structured review.`;
}

function formatConventionsSection(conventions: ProjectConventions): string {
  if (conventions.patterns.length === 0) return '';

  const patternsList = conventions.patterns
    .map((p) => `- **${p.name}**: ${p.description}`)
    .join('\n');

  return `## Project Conventions

This project follows these coding conventions. Flag any violations:

${patternsList}
`;
}
```

## Test

```bash
cd packages/core && pnpm tsc --noEmit
```

TypeScript compiles without errors.
