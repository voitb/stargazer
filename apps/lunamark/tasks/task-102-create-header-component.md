---
id: task-102
title: Create Header component
status: completed
priority: medium
labels:
  - cli
  - tui
  - components
created: '2025-01-06'
order: 102
assignee: glm
---

## Description

Create the Header component that displays the Stargazer branding and current project name.

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/components/Header.tsx`
- [ ] Display Stargazer logo/name in cyan
- [ ] Display project name (dimmed)
- [ ] Use Ink Box with border styling

## Implementation

**File**: `packages/cli/src/tui/components/Header.tsx`

```typescript
import React from 'react';
import { Box, Text } from 'ink';

interface HeaderProps {
  projectName: string;
}

export function Header({ projectName }: HeaderProps) {
  return (
    <Box
      flexDirection="row"
      justifyContent="space-between"
      paddingX={1}
      borderStyle="single"
      borderBottom
    >
      <Text bold color="cyan">
        ✦ Stargazer
      </Text>
      <Text dimColor>
        {projectName}
      </Text>
    </Box>
  );
}
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
```
