---
id: task-085
title: Unify duplicate prompt template code
status: done
priority: low
labels:
  - core
  - review
  - refactor
created: '2026-01-06'
order: 850
assignee: voitb
---
## Description

Merge duplicate prompt template functions to reduce code duplication.

## Issue Details

**File**: `/packages/core/src/review/prompts.ts:40-84`
**Confidence**: 80%
**Category**: Maintainability

`buildReviewPrompt` and `buildReviewPromptWithConventions` have 90% identical code. This violates DRY and makes maintenance error-prone.

## Acceptance Criteria

- [x] Merge into a single function with optional conventions parameter
- [x] Maintain backward compatibility
- [x] Add tests for both cases

## Implementation

**File**: `packages/core/src/review/prompts.ts`

```typescript
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
- Confidence score (0.0 to 1.0)
${conventionContext ? '- Convention reference if applicable' : ''}

Be thorough but avoid false positives. Only report issues you are confident about.

Diff to review:
\`\`\`diff
${diff}
\`\`\`

Respond with your structured review.`;
}

// DEPRECATED: Use buildReviewPrompt(diff, conventions) instead
export const buildReviewPromptWithConventions = buildReviewPrompt;
```

## Test

```bash
cd packages/core && pnpm test prompts.test.ts
```
