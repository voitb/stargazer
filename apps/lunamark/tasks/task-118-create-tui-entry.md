---
id: task-118
title: Create TUI entry point
status: pending
priority: high
labels:
  - cli
  - tui
created: '2025-01-06'
order: 118
assignee: glm
---

## Description

Create the TUI entry point that renders the Ink app.

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/index.tsx`
- [ ] Export `startTUI()` function
- [ ] Use Ink render() to mount App
- [ ] Wait for exit with waitUntilExit()

## Implementation

**File**: `packages/cli/src/tui/index.tsx`

```typescript
import React from 'react';
import { render } from 'ink';
import { App } from './App.js';

/**
 * Start the interactive TUI
 */
export async function startTUI(): Promise<void> {
  const projectPath = process.cwd();

  const { waitUntilExit } = render(<App projectPath={projectPath} />);

  await waitUntilExit();
}
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
```
