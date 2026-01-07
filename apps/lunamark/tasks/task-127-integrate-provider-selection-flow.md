---
id: task-127
title: Integrate provider selection flow into app startup
status: completed
priority: high
labels:
  - cli
  - tui
  - integration
  - providers
created: '2026-01-07'
order: 127
assignee: glm
---

## Description

Update app.tsx to redirect to provider selection screen when no API key is configured, creating a smooth onboarding flow.

## Acceptance Criteria

- [x] Check for API key on app mount
- [x] If no API key: redirect to providerSelect screen
- [x] If API key exists: show home menu
- [x] Track API key status for StatusBar display
- [x] Handle error screen navigation based on API key status

## Implementation

**File**: `packages/cli/src/tui/app.tsx`

Key changes:

```typescript
import { getApiKey, hasApiKey } from './storage/api-key-store.js';
import { ProviderSelectScreen, ApiKeySetupScreen } from './screens/index.js';

// In AppContent component
const [apiKeyStatus, setApiKeyStatus] = useState<boolean | undefined>(undefined);

useEffect(() => {
  const checkApiKey = async () => {
    const hasKey = await hasApiKey();
    setApiKeyStatus(hasKey);
    if (!hasKey) {
      navigate('providerSelect');
    }
  };
  checkApiKey();
  refreshSessions();
}, [navigate, refreshSessions]);

// Re-check API key when returning to home
useEffect(() => {
  if (screen === 'home') {
    hasApiKey().then(setApiKeyStatus);
  }
}, [screen]);

// In renderContent switch
case 'providerSelect':
  return <ProviderSelectScreen />;

case 'apiKeySetup':
  return <ApiKeySetupScreen />;

// Pass apiKeyStatus to StatusBar
<StatusBar message={statusMessage} sessionCount={sessions.length} hasApiKey={apiKeyStatus} />
```

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm build

# Test without API key
unset GEMINI_API_KEY
rm -f ~/.stargazer/config.json
node dist/index.js
# Should show provider selection screen

# Test with API key
export GEMINI_API_KEY="test-key"
node dist/index.js
# Should show main menu directly
```
