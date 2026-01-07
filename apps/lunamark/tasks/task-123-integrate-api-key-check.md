---
id: task-123
title: Integrate API key check into app startup
status: completed
priority: high
labels:
  - cli
  - tui
  - integration
created: '2026-01-07'
order: 123
assignee: glm
---

## Description

Modify the TUI app to check for API key on startup and redirect to setup screen if not found.

## Acceptance Criteria

- [ ] Update `packages/cli/src/tui/app.tsx` to check API key on mount
- [ ] If no API key: show ApiKeySetupScreen first
- [ ] If API key exists: show normal menu
- [ ] Update StatusBar to show API key status indicator
- [ ] Add "Settings" menu option to reconfigure API key

## Implementation Details

1. Add `hasApiKey` check in App component's useEffect
2. Add `apiKeySetup` screen to Screen type in `state/app-context.tsx`
3. Update StatusBar to show checkmark/cross indicator for API status
4. Add "Settings" menu option that navigates to settings screen

**Updated app-context.tsx Screen type:**

```typescript
export type Screen = 'home' | 'chat' | 'history' | 'settings' | 'help' | 'review' | 'loading' | 'error' | 'apiKeySetup';
```

**App.tsx startup check:**

```typescript
import { hasApiKey } from './storage/api-key-store.js';

// In AppContent component
useEffect(() => {
  const checkApiKey = async () => {
    const hasKey = await hasApiKey();
    if (!hasKey) {
      navigate('apiKeySetup');
    }
  };
  checkApiKey();
}, [navigate]);
```

**StatusBar with API status:**

```typescript
interface StatusBarProps {
  message: string;
  sessionCount?: number;
  hasApiKey?: boolean;
}

export function StatusBar({ message, sessionCount, hasApiKey }: StatusBarProps) {
  return (
    <Box flexDirection="row" justifyContent="space-between" paddingX={1} borderStyle="single" borderTop borderBottom={false} borderLeft={false} borderRight={false}>
      <Text dimColor>{message}</Text>
      <Box>
        {hasApiKey !== undefined && (
          <Text color={hasApiKey ? 'green' : 'red'}>{hasApiKey ? 'API: OK' : 'API: Missing'}</Text>
        )}
        {sessionCount !== undefined && (
          <Text dimColor> | Sessions: {sessionCount}</Text>
        )}
      </Box>
    </Box>
  );
}
```

**MainMenu update - add Settings option:**

```typescript
const menuOptions = [
  { label: 'Review Staged Changes', value: 'review-staged' },
  { label: 'Review Unstaged Changes', value: 'review-unstaged' },
  { label: 'Discover Conventions', value: 'discover' },
  { label: 'Session History', value: 'history' },
  { label: 'Settings', value: 'settings' },
  { label: 'Help', value: 'help' },
  { label: 'Exit', value: 'exit' },
];
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm build
# Remove env var and test startup
unset GEMINI_API_KEY
node dist/index.js
# Should show API key setup screen
```
