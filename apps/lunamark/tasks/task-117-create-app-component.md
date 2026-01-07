---
id: task-117
title: Create main App component
status: completed
priority: high
labels:
  - cli
  - tui
created: '2025-01-06'
order: 117
assignee: glm
---

## Description

Create the main App component that orchestrates screens, navigation, and global keyboard shortcuts.

## Acceptance Criteria

- [ ] Create `packages/cli/src/tui/App.tsx`
- [ ] Wrap in AppProvider for state management
- [ ] Implement screen routing (home, chat, history, help)
- [ ] Handle global keyboard shortcuts (Ctrl+C, ?, Escape)
- [ ] Render Header, current screen, and StatusBar

## Implementation

**File**: `packages/cli/src/tui/App.tsx`

```typescript
import React, { useEffect } from 'react';
import { Box, useApp as useInkApp, useInput } from 'ink';
import { AppProvider, useApp, type Screen } from './state/app-context.js';
import { Header } from './components/Header.js';
import { StatusBar } from './components/StatusBar.js';
import { HomeScreen } from './screens/HomeScreen.js';
import { ChatScreen } from './screens/ChatScreen.js';
import { HistoryScreen } from './screens/HistoryScreen.js';
import { HelpScreen } from './screens/HelpScreen.js';

interface AppContentProps {
  hasApiKey: boolean;
}

function AppContent({ hasApiKey }: AppContentProps) {
  const { screen, sessions, projectPath, navigate, closeSession } = useApp();
  const { exit } = useInkApp();

  // Global keyboard shortcuts
  useInput((input, key) => {
    // Ctrl+C to exit
    if (input === 'c' && key.ctrl) {
      exit();
    }

    // ? for help from home screen
    if (input === '?' && screen === 'home') {
      navigate('help');
    }

    // Escape to go back
    if (key.escape) {
      if (screen === 'chat') {
        closeSession();
      } else if (screen !== 'home') {
        navigate('home');
      }
    }
  });

  const renderScreen = (): React.ReactNode => {
    switch (screen) {
      case 'home':
        return <HomeScreen />;
      case 'chat':
        return <ChatScreen />;
      case 'history':
        return <HistoryScreen />;
      case 'help':
        return <HelpScreen />;
      case 'settings':
        return <HomeScreen />; // Placeholder for now
      default:
        return <HomeScreen />;
    }
  };

  const projectName = projectPath.split('/').pop() || 'Unknown';

  return (
    <Box flexDirection="column" height="100%">
      <Header projectName={projectName} />
      <Box flexDirection="column" flexGrow={1}>
        {renderScreen()}
      </Box>
      <StatusBar sessionCount={sessions.length} hasApiKey={hasApiKey} />
    </Box>
  );
}

interface AppProps {
  projectPath: string;
}

export function App({ projectPath }: AppProps) {
  const hasApiKey = !!process.env.GEMINI_API_KEY || !!process.env.GOOGLE_API_KEY;

  return (
    <AppProvider projectPath={projectPath}>
      <AppContent hasApiKey={hasApiKey} />
    </AppProvider>
  );
}
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit
```
