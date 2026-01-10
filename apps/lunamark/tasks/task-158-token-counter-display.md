---
id: task-158
title: Implement token counter display in status bar
status: pending
priority: high
labels:
  - cli
  - feature
  - ui
created: '2025-01-10'
order: 158
assignee: ai-agent
depends_on:
  - task-157
---

## Description

Display the current token count and context limit in the status bar so users know how much of the LLM's context window has been used.

## Requirements

1. Show current token count in status bar
2. Show context limit (varies by model)
3. Visual progress indicator (percentage or bar)
4. Warning colors when approaching limit (80%, 90%)
5. Real-time updates as conversation grows

## Current State

- StatusBar component at `packages/cli/src/tui/components/layout/status-bar.tsx` already accepts `tokenUsage` prop
- The prop is NOT being passed from app.tsx
- UsageDisplay component exists in design system

## Implementation

### Step 1: Create token counting utility

**File:** `packages/cli/src/tui/utils/token-counter.ts` (create)

```typescript
/**
 * Token counting utilities for different LLM providers
 */

// Model context limits (tokens)
export const MODEL_LIMITS: Record<string, number> = {
  // Gemini
  'gemini-pro': 32_768,
  'gemini-1.5-pro': 1_048_576,
  'gemini-1.5-flash': 1_048_576,

  // OpenAI (if supported later)
  'gpt-4': 8_192,
  'gpt-4-turbo': 128_000,
  'gpt-4o': 128_000,

  // Anthropic (if supported later)
  'claude-3-opus': 200_000,
  'claude-3-sonnet': 200_000,
  'claude-3-haiku': 200_000,

  // Default
  default: 32_768,
};

/**
 * Get context limit for a model
 */
export function getModelLimit(model: string): number {
  return MODEL_LIMITS[model] || MODEL_LIMITS.default;
}

/**
 * Estimate token count from text (rough approximation)
 * For accurate counting, use the provider's API
 */
export function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token for English
  return Math.ceil(text.length / 4);
}

/**
 * Calculate total tokens from messages
 */
export function calculateMessageTokens(
  messages: Array<{ content: string; tokenCount?: number }>
): number {
  return messages.reduce((sum, msg) => {
    return sum + (msg.tokenCount || estimateTokens(msg.content));
  }, 0);
}

/**
 * Get usage percentage
 */
export function getUsagePercentage(current: number, limit: number): number {
  return Math.round((current / limit) * 100);
}

/**
 * Get warning level based on usage
 */
export function getWarningLevel(
  current: number,
  limit: number
): 'normal' | 'warning' | 'critical' {
  const percentage = getUsagePercentage(current, limit);
  if (percentage >= 90) return 'critical';
  if (percentage >= 80) return 'warning';
  return 'normal';
}
```

### Step 2: Create token tracking hook

**File:** `packages/cli/src/tui/hooks/use-token-tracking.ts` (create)

```typescript
import { useState, useEffect, useCallback } from 'react';
import {
  getModelLimit,
  calculateMessageTokens,
  getWarningLevel,
} from '../utils/token-counter.js';

interface Message {
  content: string;
  tokenCount?: number;
}

interface TokenUsage {
  current: number;
  limit: number;
  percentage: number;
  warningLevel: 'normal' | 'warning' | 'critical';
}

export function useTokenTracking(
  messages: Message[],
  model: string
): TokenUsage {
  const [usage, setUsage] = useState<TokenUsage>({
    current: 0,
    limit: getModelLimit(model),
    percentage: 0,
    warningLevel: 'normal',
  });

  useEffect(() => {
    const current = calculateMessageTokens(messages);
    const limit = getModelLimit(model);
    const percentage = Math.round((current / limit) * 100);
    const warningLevel = getWarningLevel(current, limit);

    setUsage({ current, limit, percentage, warningLevel });
  }, [messages, model]);

  return usage;
}
```

### Step 3: Wire up token usage in app.tsx

**File:** `packages/cli/src/tui/app.tsx`

Update to pass token usage to StatusBar:

```typescript
import { useTokenTracking } from './hooks/use-token-tracking.js';

function AppContent({ projectPath }: AppContentProps) {
  // ... existing code ...

  const {
    screen,
    navigate,
    goBack,
    error: appError,
    setError: setAppError,
    refreshSessions,
    sessions,
    activeSession,
    currentModel,
  } = useAppContext();

  // Track token usage
  const tokenUsage = useTokenTracking(
    activeSession?.messages || [],
    currentModel || 'gemini-1.5-pro'
  );

  // ... existing code ...

  return (
    <Box flexDirection="column" minHeight={10}>
      <Header projectName={projectName} />
      <Box flexDirection="column" flexGrow={1}>
        <ScreenRouter
          screen={screen}
          review={{
            result: review.result,
            phase: review.phase,
            completedPhases: review.completedPhases,
            elapsedTime: review.elapsedTime,
            timeout: review.timeout,
          }}
          error={error}
          onMenuSelect={handleMenuSelect}
        />
      </Box>
      <StatusBar
        message={statusMessage}
        sessionCount={sessions.length}
        hasApiKey={apiKeyStatus}
        tokenUsage={{
          current: tokenUsage.current,
          limit: tokenUsage.limit,
        }}
      />
    </Box>
  );
}
```

### Step 4: Update app context to expose activeSession

**File:** `packages/cli/src/tui/state/app-context.tsx`

Ensure `activeSession` and `currentModel` are exposed:

```typescript
interface AppContextValue {
  // ... existing fields ...
  activeSession: Session | null;
  currentModel: string;
}

// In provider:
const value: AppContextValue = {
  // ... existing fields ...
  activeSession: chatContext.activeSession,
  currentModel: settingsContext.model,
};
```

### Step 5: Update UsageDisplay for warning colors

**File:** `packages/cli/src/tui/design-system/components/usage-display.tsx`

Add warning color support:

```typescript
interface UsageDisplayProps {
  current: number;
  limit: number;
  label?: string;
  showProgress?: boolean;
  compact?: boolean;
  warningThreshold?: number; // default 80
  criticalThreshold?: number; // default 90
}

export function UsageDisplay({
  current,
  limit,
  label = 'tokens',
  showProgress = true,
  compact = false,
  warningThreshold = 80,
  criticalThreshold = 90,
}: UsageDisplayProps) {
  const { colors } = useTheme();
  const percentage = Math.round((current / limit) * 100);

  // Determine color based on usage
  let color = colors.text.secondary;
  if (percentage >= criticalThreshold) {
    color = statusColors.error.text;
  } else if (percentage >= warningThreshold) {
    color = statusColors.warning.text;
  }

  if (compact) {
    return (
      <Text color={color}>
        {current.toLocaleString()}/{limit.toLocaleString()} {label}
      </Text>
    );
  }

  return (
    <Box flexDirection="row" gap={1}>
      <Text color={color}>
        {current.toLocaleString()}/{limit.toLocaleString()} {label}
      </Text>
      {showProgress && (
        <Text color={color}>({percentage}%)</Text>
      )}
    </Box>
  );
}
```

## Acceptance Criteria

- [ ] Token count displays in status bar
- [ ] Context limit shows for current model
- [ ] Percentage or progress indicator visible
- [ ] Colors change at 80% (warning) and 90% (critical)
- [ ] Updates in real-time as messages are added
- [ ] Different models show correct limits

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit

# Manual test:
# 1. Start CLI
# 2. Look at status bar - should show token count
# 3. Start a conversation
# 4. Verify token count increases with each message
# 5. Verify correct model limit is shown
```

## Files Changed

- CREATE: `packages/cli/src/tui/utils/token-counter.ts`
- CREATE: `packages/cli/src/tui/hooks/use-token-tracking.ts`
- UPDATE: `packages/cli/src/tui/app.tsx`
- UPDATE: `packages/cli/src/tui/state/app-context.tsx`
- UPDATE: `packages/cli/src/tui/design-system/components/usage-display.tsx`
- UPDATE: `packages/cli/src/tui/hooks/index.ts`
- UPDATE: `packages/cli/src/tui/utils/index.ts`
