---
id: task-073
title: Write CLI tests
status: todo
assignee: voitb
priority: high
labels:
  - cli
  - testing
created: '2026-01-05'
order: 730
---
## Description

Create unit tests for CLI commands and terminal formatter. Based on review.md validation, the CLI implementation needs test coverage.

## Acceptance Criteria

- [ ] Create `packages/cli/src/commands/review.test.ts`
- [ ] Create `packages/cli/src/output/terminal.test.ts`
- [ ] Test review command argument parsing
- [ ] Test terminal formatter output
- [ ] Test error handling and exit codes
- [ ] All tests pass

## Implementation

### Review Command Tests

**File**: `packages/cli/src/commands/review.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
// Test command argument parsing
// Test option handling (--json, --unstaged)
// Test error cases
```

### Terminal Formatter Tests

**File**: `packages/cli/src/output/terminal.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { formatReview } from './terminal';
// Test formatting for different severity levels
// Test summary output
// Test edge cases (empty issues, etc.)
```

## Test

```bash
cd packages/cli && pnpm vitest run
```
