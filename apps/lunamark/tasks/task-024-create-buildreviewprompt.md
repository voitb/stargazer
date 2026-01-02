---
id: task-024
title: Create buildReviewPrompt function
status: todo
priority: high
labels:
  - core
  - review
created: '2026-01-01'
order: 240
---
## Description

Create the prompt builder function that constructs the review prompt for Gemini.

## Acceptance Criteria

- [ ] Create `packages/core/src/review/prompts.ts`
- [ ] Implement `buildReviewPrompt()` function
- [ ] Prompt includes diff content
- [ ] Clear instructions for AI reviewer

## Implementation

**File**: `packages/core/src/review/prompts.ts`

```typescript
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
```

## Test

```bash
# Verify the function builds a prompt correctly
cd packages/core && pnpm tsc --noEmit
```

Verify prompt includes the diff content when called.
