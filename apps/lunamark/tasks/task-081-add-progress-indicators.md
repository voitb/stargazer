---
id: task-081
title: Add progress indicators for long operations
status: done
priority: medium
labels:
  - cli
  - ux
created: '2026-01-06'
order: 810
assignee: voitb
---
## Description

Add progress indicators (spinners) for long-running CLI operations to improve user experience.

## Issue Details

**Files**:
- `/packages/cli/src/commands/review.ts`
- `/packages/cli/src/commands/discover.ts`

**Confidence**: 87%
**Category**: UX

Both `discover` and `review` commands perform potentially long-running API calls with no progress indicator or spinner. Users may think the CLI has hung.

## Acceptance Criteria

- [x] Add `ora` spinner package dependency
- [x] Show spinner during API calls in review command
- [x] Show spinner during API calls in discover command
- [x] Update spinner text to show current status
- [x] Handle spinner cleanup on errors

## Implementation

**Install dependency**:
```bash
cd packages/cli && pnpm add ora
```

**File**: `packages/cli/src/commands/review.ts`

```typescript
import ora from 'ora';

// In action handler:
const spinner = ora('Analyzing code changes...').start();

try {
  const result = await reviewDiff(client, {
    staged: !options.unstaged,
    projectPath: process.cwd(),
  });

  spinner.stop();

  if (!result.ok) {
    exitWithError(result.error.message);
  }

  // ... rest of handler
} catch (error) {
  spinner.fail('Review failed');
  throw error;
}
```

**File**: `packages/cli/src/commands/discover.ts`

```typescript
import ora from 'ora';

// In action handler:
const spinner = ora('Discovering project conventions...').start();

try {
  const result = await discoverConventions(client, {
    projectPath,
    maxFiles,
  });

  spinner.succeed('Conventions discovered');
  // ... rest of handler
} catch (error) {
  spinner.fail('Discovery failed');
  throw error;
}
```

## Test

```bash
cd packages/cli && pnpm build
GEMINI_API_KEY=xxx pnpm stargazer review
```

Should show animated spinner during API call.
