---
id: task-155
title: Fix navigation blocking after review completes
status: done
priority: critical
labels:
  - cli
  - bug-fix
  - navigation
created: '2025-01-10'
order: 155
assignee: ai-agent
depends_on: []
---

## Description

After the AI model finishes a review, navigation gets blocked. Users cannot navigate with arrow keys or select menu items. This appears to be a state management issue.

## Problem

When review completes:
1. User sees results
2. User presses ESC or B to go back
3. Navigation doesn't work OR menu items can't be selected
4. User has to Ctrl+C to exit

## Investigation Steps

### Step 1: Analyze state transitions

**File:** `packages/cli/src/tui/hooks/use-app-review.ts`

Check the state management in the review hook:
- Does `isReviewing` get set to `false` after completion?
- Is there a race condition with state updates?
- Are event listeners being cleaned up?

### Step 2: Check keyboard handling

**File:** `packages/cli/src/tui/hooks/use-app-keyboard.ts`

Check if keyboard input is being suppressed:
- Is there a condition that blocks input during/after review?
- Is the `screen` state correct after review completes?

### Step 3: Check screen router

**File:** `packages/cli/src/tui/screens/screen-router.tsx`

Check if the screen state is correctly transitioned:
- Does the router handle all screen states?
- Is there a missing case in the switch statement?

## Root Cause Analysis

Read these files to understand the flow:

1. `packages/cli/src/tui/app.tsx` - Main app component
2. `packages/cli/src/tui/hooks/use-app-review.ts` - Review logic
3. `packages/cli/src/tui/hooks/use-app-keyboard.ts` - Keyboard handling
4. `packages/cli/src/tui/state/navigation-context.tsx` - Navigation state
5. `packages/cli/src/tui/screens/screen-router.tsx` - Screen routing

## Implementation

### Likely Fix 1: Review state cleanup

**File:** `packages/cli/src/tui/hooks/use-app-review.ts`

Ensure state is properly cleaned up:

```typescript
const clearResult = useCallback(() => {
  setResult(null);
  setError(null);
  setPhase('idle');
  setIsReviewing(false); // Make sure this is called
}, []);

// After review completes successfully
useEffect(() => {
  if (result && phase === 'complete') {
    setIsReviewing(false); // Ensure flag is cleared
  }
}, [result, phase]);
```

### Likely Fix 2: Keyboard handler conditions

**File:** `packages/cli/src/tui/hooks/use-app-keyboard.ts`

Check the `useInput` conditions:

```typescript
useInput((input, key) => {
  // If we're blocking input during review, ensure we unblock after
  if (isReviewing) {
    // Only allow cancel during review
    if (key.escape) {
      onCancelReview?.();
    }
    return; // Block other input
  }

  // Rest of keyboard handling...
}, { isActive: true }); // Ensure isActive is always true after review
```

### Likely Fix 3: Navigation state reset

**File:** `packages/cli/src/tui/state/navigation-context.tsx`

Ensure navigation state is clean:

```typescript
const goBack = useCallback(() => {
  if (history.length > 1) {
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);
    setScreen(newHistory[newHistory.length - 1]!);
  } else {
    setScreen('home');
  }
}, [history]);
```

### Likely Fix 4: Screen router focus

**File:** `packages/cli/src/tui/screens/screen-router.tsx`

Ensure focus is properly managed:

```typescript
// After transitioning screens, ensure input is re-enabled
useEffect(() => {
  // Force re-render to reset focus
}, [screen]);
```

## Acceptance Criteria

- [ ] After review completes, user can press ESC/B to go back
- [ ] Menu navigation works (up/down arrows)
- [ ] Menu selection works (Enter key)
- [ ] No state leaks between screens
- [ ] No keyboard input blocking after review

## Debug Steps

Add console logging to trace the issue:

```typescript
// In use-app-keyboard.ts
console.log('Keyboard state:', { screen, isReviewing, apiKeyStatus });

// In navigation-context.tsx
console.log('Navigation:', { screen, historyLength: history.length });

// In use-app-review.ts
console.log('Review state:', { isReviewing, phase, hasResult: !!result });
```

## Test

```bash
# Manual test:
# 1. Start CLI
# 2. Run a review (staged or unstaged)
# 3. Wait for review to complete
# 4. Press ESC or B
# 5. Verify you return to menu
# 6. Verify you can navigate menu items
# 7. Verify you can select menu items
```

## Files to Examine

- `packages/cli/src/tui/app.tsx`
- `packages/cli/src/tui/hooks/use-app-review.ts`
- `packages/cli/src/tui/hooks/use-app-keyboard.ts`
- `packages/cli/src/tui/state/navigation-context.tsx`
- `packages/cli/src/tui/screens/screen-router.tsx`
- `packages/cli/src/tui/components/navigation/main-menu.tsx`
