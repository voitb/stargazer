# CLI Package Architecture

Architecture guidelines specific to the CLI package with Ink TUI.

> For generic React/TypeScript rules (hooks, utils, splitting), see [/ARCHITECTURE_RULES.md](/ARCHITECTURE_RULES.md)

---

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [TUI Architecture](#tui-architecture)
4. [State Management](#state-management)
5. [Component Patterns](#component-patterns)
6. [Ink-Specific Patterns](#ink-specific-patterns)

---

## Overview

This CLI package uses a **hybrid architecture**:
- **Commander.js** for non-interactive commands (`review`, `discover`, `init`)
- **Ink (React)** for interactive TUI mode

```
┌─────────────────────────────────────────────────┐
│                   index.tsx                      │
│              (Entry Point)                       │
└─────────────────┬───────────────────────────────┘
                  │
          Is TTY + No command?
                  │
       ┌──────────┴──────────┐
       │                     │
       ▼                     ▼
┌─────────────┐       ┌─────────────┐
│    TUI      │       │  Commands   │
│   (Ink)     │       │ (Commander) │
└─────────────┘       └─────────────┘
```

---

## Project Structure

```
apps/cli/src/
│
├── index.tsx                     # Entry point (routes to TUI or commands)
├── logger.ts                     # Logging utility
├── exit-codes.ts                 # Exit code constants
│
├── commands/                     # Non-interactive CLI commands
│   ├── discover.ts
│   ├── init.ts
│   ├── review.ts
│   └── index.ts
│
├── output/                       # Output formatting (shared)
│   ├── markdown.ts
│   ├── terminal.ts
│   └── index.ts
│
└── tui/                          # Interactive TUI (Ink)
    │
    ├── app.tsx                   # Root TUI component
    ├── index.tsx                 # TUI entry (startTUI)
    │
    ├── components/               # Shared TUI components
    │   ├── layout/               # Layout components
    │   │   ├── header.tsx
    │   │   ├── status-bar.tsx
    │   │   └── index.ts
    │   ├── navigation/           # Navigation components
    │   │   ├── main-menu.tsx
    │   │   └── index.ts
    │   ├── feedback/             # Status, toasts, spinners
    │   │   ├── badge.tsx
    │   │   ├── progress-bar.tsx
    │   │   ├── star-spinner.tsx
    │   │   ├── status-text.tsx
    │   │   ├── toast.tsx
    │   │   └── index.ts
    │   ├── forms/                # Inputs and selectors
    │   │   ├── input-field.tsx
    │   │   ├── select-with-arrows.tsx
    │   │   └── index.ts
    │   ├── display/              # Layout/display utilities
    │   │   ├── card.tsx
    │   │   ├── divider.tsx
    │   │   ├── icons.ts
    │   │   ├── key-hint.tsx
    │   │   ├── labels.tsx
    │   │   ├── titles.tsx
    │   │   ├── usage-display.tsx
    │   │   └── index.ts
    │   ├── branding/             # Logos and ASCII art
    │   │   ├── animated-logo.tsx
    │   │   ├── ascii-logo.ts
    │   │   ├── logo-component.tsx
    │   │   ├── responsive.ts
    │   │   └── index.ts
    │   ├── error-boundary.tsx
    │   └── index.ts
    │
    ├── theme/                    # Theme, palettes, tokens
    │   ├── index.ts
    │   ├── provider.tsx
    │   ├── palettes.ts
    │   ├── gradient.ts
    │   └── tokens/
    │       ├── index.ts
    │       ├── colors.ts
    │       ├── spacing.ts
    │       ├── typography.ts
    │       ├── borders.ts
    │       └── motion.ts
    │
    ├── features/                 # Feature modules
    │   ├── chat/
    │   │   ├── components/
    │   │   │   ├── chat-input.tsx
    │   │   │   ├── chat-message.tsx
    │   │   │   ├── chat-view.tsx
    │   │   │   └── index.ts
    │   │   ├── chat-screen.tsx
    │   │   ├── chat.context.tsx
    │   │   ├── types.ts
    │   │   └── index.ts
    │   │
    │   ├── review/
    │   │   ├── components/
    │   │   │   ├── review-view.tsx
    │   │   │   └── index.ts
    │   │   ├── hooks/
    │   │   │   └── use-review.ts
    │   │   ├── types.ts
    │   │   └── index.ts
    │   │
    │   ├── sessions/
    │   │   ├── components/
    │   │   │   ├── session-list.tsx
    │   │   │   └── index.ts
    │   │   ├── session.context.tsx
    │   │   ├── session-store.ts
    │   │   ├── types.ts
    │   │   └── index.ts
    │   │
    │   └── settings/
    │       ├── settings-screen.tsx
    │       ├── api-key-setup-screen.tsx
    │       ├── hooks/
    │       │   └── use-settings.ts
    │       └── index.ts
    │
    ├── screens/                  # Screen orchestration
    │   ├── home-screen.tsx
    │   ├── help-screen.tsx
    │   ├── history-screen.tsx
    │   └── index.ts
    │
    ├── state/                    # Global state
    │   ├── navigation.context.tsx
    │   ├── app.context.tsx
    │   └── index.ts
    │
    ├── hooks/                    # Shared TUI hooks
    │   ├── use-keyboard.ts
    │   ├── use-exit.ts
    │   └── index.ts
    │
    ├── storage/                  # Persistence layer
    │   ├── paths.ts
    │   ├── schemas.ts
    │   ├── api-key-store.ts
    │   └── index.ts
    │
    ├── config/                   # Configuration & constants
    │   ├── defaults.ts
    │   ├── models.ts
    │   ├── settings.ts
    │   ├── icons.ts
    │   └── index.ts
    │
    ├── types/                    # Shared types
    │   └── index.ts
    │
    └── utils/                    # Shared utilities
        ├── error-messages.ts
        └── index.ts
```

---

## TUI Architecture

### Layer Diagram

```
┌─────────────────────────────────────────────────────────┐
│                      app.tsx                            │
│              (Root + Provider Composition)              │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                     Screens                             │
│  (Full terminal views: HomeScreen, ChatScreen, etc.)    │
└─────────────────────────┬───────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│   Layout    │   │  Features   │   │  Feedback   │
│ Components  │   │ Components  │   │ Components  │
│             │   │             │   │             │
│ Header      │   │ ChatView    │   │ Progress    │
│ StatusBar   │   │ ReviewView  │   │ Error       │
│ MainMenu    │   │ SessionList │   │ Spinner     │
└─────────────┘   └─────────────┘   └─────────────┘
```

### Screen vs Component

| Type | Purpose | Location |
|------|---------|----------|
| **Screen** | Full terminal view, orchestrates components | `screens/` or `features/[name]/` |
| **Component** | Reusable UI piece | `components/` or `features/[name]/components/` |

```typescript
// SCREEN: Orchestrates components, handles navigation
function HomeScreen() {
  const { navigate } = useNavigation()

  return (
    <Box flexDirection="column">
      <WelcomeMessage />
      <MainMenu onSelect={(item) => navigate(item)} />
    </Box>
  )
}

// COMPONENT: Reusable UI piece
function MainMenu({ onSelect }: MainMenuProps) {
  return (
    <SelectInput items={menuItems} onSelect={onSelect} />
  )
}
```

---

## State Management

### Context Architecture

Split contexts by domain for better performance:

```
┌─────────────────────────────────────────────────────────┐
│                    AppProvider                          │
│            (Combines all providers)                     │
└─────────────────────────┬───────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│  Navigation   │ │    Session    │ │     Chat      │
│   Context     │ │    Context    │ │   Context     │
│               │ │               │ │               │
│ screen        │ │ activeSession │ │ messages      │
│ navigate()    │ │ sessions      │ │ addMessage()  │
└───────────────┘ └───────────────┘ └───────────────┘
     Global            Feature            Feature
   (state/)        (features/sessions) (features/chat)
```

### Context Location Rules

| Context | Location | Reason |
|---------|----------|--------|
| NavigationContext | `state/` | Used by ALL screens |
| SessionContext | `features/sessions/` | Feature-specific |
| ChatContext | `features/chat/` | Feature-specific |
| AppContext | `state/` | Combines all (backwards compat) |

### Context Pattern

```typescript
// features/chat/chat.context.tsx
import { createContext, useContext, type ReactNode } from 'react'

type ChatContextValue = {
  messages: ChatMessage[]
  addMessage: (message: NewMessage) => Promise<void>
  isLoading: boolean
}

const ChatContext = createContext<ChatContextValue | null>(null)

function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within ChatProvider')
  }
  return context
}

function ChatProvider({ children }: { children: ReactNode }) {
  // ... implementation

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

export { ChatProvider, useChat }
```

---

## Component Patterns

### Layout Components

Standard layout wrapper:

```typescript
// components/layout/header.tsx
import { Box, Text } from 'ink'

type HeaderProps = {
  projectName: string
}

function Header({ projectName }: HeaderProps) {
  return (
    <Box borderStyle="single" paddingX={1}>
      <Text bold color="cyan">Stargazer</Text>
      <Text dimColor> • {projectName}</Text>
    </Box>
  )
}
```

### Feature Components

Feature-specific components live with their feature:

```typescript
// features/review/components/review-view.tsx
import { Box, Text } from 'ink'
import type { ReviewResult } from '../types'

type ReviewViewProps = {
  result: ReviewResult
}

function ReviewView({ result }: ReviewViewProps) {
  return (
    <Box flexDirection="column">
      <Text bold>Review Results</Text>
      {result.issues.map((issue, i) => (
        <Box key={i}>
          <Text color="yellow">{issue.severity}</Text>
          <Text> {issue.message}</Text>
        </Box>
      ))}
    </Box>
  )
}
```

### Screen Components

Screens orchestrate features:

```typescript
// features/chat/chat-screen.tsx
import { Box } from 'ink'
import { ChatView, ChatInput } from './components'
import { useChat } from './chat.context'

function ChatScreen() {
  const { messages, addMessage, isLoading } = useChat()

  return (
    <Box flexDirection="column" flexGrow={1}>
      <ChatView messages={messages} />
      <ChatInput onSubmit={addMessage} disabled={isLoading} />
    </Box>
  )
}

export { ChatScreen }
```

---

## Ink-Specific Patterns

### Input Handling

Use `useInput` for keyboard handling:

```typescript
import { useInput } from 'ink'

function MyComponent() {
  useInput((input, key) => {
    if (input === 'q') {
      // quit
    }
    if (key.escape) {
      // go back
    }
    if (key.ctrl && input === 'c') {
      // force exit
    }
  })
}
```

### Focus Management

Use Ink's focus system for multi-input screens:

```typescript
import { useFocus, useFocusManager } from 'ink'

function FocusableInput({ id }: { id: string }) {
  const { isFocused } = useFocus({ id })

  return (
    <Box borderStyle={isFocused ? 'bold' : 'single'}>
      <TextInput focus={isFocused} />
    </Box>
  )
}

function MultiInputScreen() {
  const { focusNext, focusPrevious } = useFocusManager()

  useInput((input, key) => {
    if (key.tab) {
      key.shift ? focusPrevious() : focusNext()
    }
  })

  return (
    <Box flexDirection="column">
      <FocusableInput id="name" />
      <FocusableInput id="email" />
    </Box>
  )
}
```

### Exit Handling

Graceful shutdown pattern:

```typescript
// hooks/use-exit.ts
import { useApp } from 'ink'
import { useEffect } from 'react'

function useGracefulExit(cleanup?: () => Promise<void>) {
  const { exit } = useApp()

  useEffect(() => {
    const handleExit = async () => {
      if (cleanup) await cleanup()
      exit()
    }

    process.on('SIGINT', handleExit)
    process.on('SIGTERM', handleExit)

    return () => {
      process.removeListener('SIGINT', handleExit)
      process.removeListener('SIGTERM', handleExit)
    }
  }, [cleanup, exit])
}
```

### Static Content for Performance

Use `<Static>` for content that doesn't change (like logs):

```typescript
import { Static, Box, Text } from 'ink'

function LogOutput({ logs }: { logs: string[] }) {
  return (
    <>
      {/* Static - won't re-render */}
      <Static items={logs.slice(0, -1)}>
        {(log, index) => (
          <Text key={index} dimColor>{log}</Text>
        )}
      </Static>

      {/* Dynamic - current line */}
      <Text>{logs[logs.length - 1]}</Text>
    </>
  )
}
```

### Screen Navigation Pattern

```typescript
// state/navigation.context.tsx
type Screen =
  | 'home'
  | 'chat'
  | 'review'
  | 'settings'
  | 'help'
  | 'loading'
  | 'error'

type NavigationContextValue = {
  screen: Screen
  navigate: (screen: Screen) => void
  goBack: () => void
  history: Screen[]
}

// Usage in app.tsx
function AppContent() {
  const { screen } = useNavigation()

  switch (screen) {
    case 'home':
      return <HomeScreen />
    case 'chat':
      return <ChatScreen />
    case 'review':
      return <ReviewScreen />
    // ...
  }
}
```

---

## Accessibility

### Screen Reader Support

Ink provides hooks for screen reader detection. Use them to provide alternative experiences:

```typescript
import { useIsScreenReaderEnabled, Box, Text } from 'ink'

function AccessibleComponent() {
  const isScreenReaderActive = useIsScreenReaderEnabled()

  if (isScreenReaderActive) {
    // Simplified, linear output for screen readers
    return (
      <Box flexDirection="column">
        <Text>Status: Loading data...</Text>
        <Text>Progress: 3 of 5 complete</Text>
      </Box>
    )
  }

  // Rich visual interface for sighted users
  return <ProgressBar current={3} total={5} />
}
```

### ARIA Attributes

Use semantic ARIA attributes on `<Box>` and `<Text>` for accessibility:

```typescript
<Box aria-label="Main navigation menu">
  <Text aria-live="polite">3 items loaded</Text>
  <Box aria-role="listbox" aria-label="Select an option">
    {items.map(item => (
      <Text key={item.id} aria-selected={item.id === selected}>
        {item.label}
      </Text>
    ))}
  </Box>
</Box>
```

### Focus Indicators

Always provide clear visual focus indicators:

```typescript
function FocusableItem({ isFocused, children }: FocusableItemProps) {
  return (
    <Box>
      <Text color={isFocused ? 'cyan' : undefined}>
        {isFocused ? '▶ ' : '  '}{children}
      </Text>
    </Box>
  )
}
```

---

## SSH & Remote Session Handling

SSH sessions and remote environments may have limited capabilities. Always check and provide fallbacks:

```typescript
function useTerminalCapabilities() {
  const isTTY = process.stdout.isTTY
  const termType = process.env.TERM
  const colorDepth = process.stdout.getColorDepth?.() ?? 1

  // Detect constrained environments
  const isConstrained =
    !isTTY ||
    termType === 'dumb' ||
    termType === undefined ||
    colorDepth < 4

  return {
    isTTY,
    termType,
    colorDepth,
    isConstrained,
    supportsColor: colorDepth >= 4,
    supports256Colors: colorDepth >= 8,
    supportsTrueColor: colorDepth >= 24,
  }
}
```

### Graceful Degradation

```typescript
function App() {
  const { isConstrained } = useTerminalCapabilities()

  if (isConstrained) {
    return <SimplifiedView />  // Text-only, no colors or complex layouts
  }

  return <FullTUI />
}

function SimplifiedView() {
  // Linear output without box-drawing characters
  return (
    <Box flexDirection="column">
      <Text>Stargazer CLI (Simple Mode)</Text>
      <Text>---</Text>
      <Text>1. Start Review</Text>
      <Text>2. View History</Text>
      <Text>3. Settings</Text>
    </Box>
  )
}
```

### Terminal Size Handling

```typescript
import { useStdout } from 'ink'

function ResponsiveLayout({ children }: { children: ReactNode }) {
  const { stdout } = useStdout()
  const { columns = 80, rows = 24 } = stdout

  // Adapt layout based on terminal size
  const isNarrow = columns < 60
  const isShort = rows < 20

  return (
    <Box
      flexDirection={isNarrow ? 'column' : 'row'}
      paddingX={isNarrow ? 0 : 1}
    >
      {children}
    </Box>
  )
}
```

---

## Error Handling

### TUI Error Boundary

Wrap your TUI in an error boundary to prevent crashes:

```typescript
import { Box, Text } from 'ink'
import { Component, type ReactNode } from 'react'

type ErrorBoundaryState = { error: Error | null }

class TUIErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to file or external service
    console.error('TUI Error:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <Box flexDirection="column" padding={1}>
          <Text color="red" bold>
            Something went wrong
          </Text>
          <Text dimColor>{this.state.error.message}</Text>
          <Text>
            Press Ctrl+C to exit, or check logs for details.
          </Text>
        </Box>
      )
    }
    return this.props.children
  }
}

// Usage in app.tsx
function App() {
  return (
    <TUIErrorBoundary>
      <AppProviders>
        <AppContent />
      </AppProviders>
    </TUIErrorBoundary>
  )
}
```

### Async Error Handling

Handle errors in async operations gracefully:

```typescript
function useAsyncOperation<T>(
  operation: () => Promise<T>,
  deps: unknown[] = []
) {
  const [state, setState] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error'
    data: T | null
    error: string | null
  }>({ status: 'idle', data: null, error: null })

  const execute = useCallback(async () => {
    setState({ status: 'loading', data: null, error: null })
    try {
      const data = await operation()
      setState({ status: 'success', data, error: null })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      setState({ status: 'error', data: null, error: message })
    }
  }, deps)

  return { ...state, execute }
}
```

---

## Decision Trees

### Where Does TUI Code Go?

```
START
  │
  ▼
Is it a complete screen (full terminal view)?
  │
  ├─ YES
  │   │
  │   ▼
  │   Is it feature-specific?
  │     │
  │     ├─ YES ──► features/[name]/[name]-screen.tsx
  │     │
  │     └─ NO (generic like home, help) ──► screens/
  │
  └─ NO (component)
      │
      ▼
    Is it feature-specific?
      │
      ├─ YES ──► features/[name]/components/
      │
      └─ NO (shared)
          │
          ▼
        What kind of component?
          │
          ├─ Layout (header, footer) ──► components/layout/
          ├─ Feedback (progress, errors) ──► components/feedback/
          └─ Navigation (menus) ──► components/navigation/
```

### Where Does State Go?

```
START
  │
  ▼
Is it used across ALL screens?
  │
  ├─ YES ──► state/ (global context)
  │
  └─ NO
      │
      ▼
    Is it feature-specific?
      │
      ├─ YES ──► features/[name]/*.context.tsx
      │
      └─ NO ──► Consider if it's really needed
```

---

## Import Extensions: Why We Use `.js`

### The Pattern

Throughout this CLI package, you'll see imports like:

```typescript
import { startTUI } from './tui/index.js';
import { logger } from './logger.js';
```

**This is intentional and correct** for ESM TypeScript in 2025/2026.

### Why `.js` Extensions Are Required

1. **ECMAScript Specification**: ES modules require explicit file extensions. This is a spec requirement, not a Node.js quirk.

2. **TypeScript Resolution**: When you write `'./logger.js'` in TypeScript, the compiler understands you're referring to `./logger.ts` during compilation. The `.js` refers to the **output** file.

3. **Portability**: Code with `.js` extensions works:
   - With bundlers (tsup, esbuild, webpack)
   - In Node.js directly (if needed)
   - With future native TypeScript support

### Configuration Context

```json
// tsconfig.json
{
  "moduleResolution": "bundler"  // Allows .js extensions
}

// package.json
{
  "type": "module"  // ESM mode
}
```

### Alternatives Considered

| Approach | Pros | Cons |
|----------|------|------|
| **`.js` extensions** (current) | Portable, spec-compliant | Feels unusual |
| Extensionless | Cleaner imports | Only works with bundler |
| Single-file bundle | Extensions irrelevant | Loses code splitting |

**Decision**: We use `.js` for maximum portability and spec compliance.

### References

- [TypeScript: Choosing Compiler Options](https://www.typescriptlang.org/docs/handbook/modules/guides/choosing-compiler-options.html)
- [2ality: TypeScript ESM Packages](https://2ality.com/2025/02/typescript-esm-packages.html)
- [BEST_PRACTICES_2025.md](/BEST_PRACTICES_2025.md) - Full module system guide

---

## Design System

The CLI uses a comprehensive design system for consistent styling across all screens. See [CLI_DESIGN_SYSTEM.md](./CLI_DESIGN_SYSTEM.md) for full documentation.

### Color Token Usage

All colors must come from the design system tokens. **NEVER use hardcoded hex colors in components.**

| Component Type | Dark Theme | Light Theme | Token Path |
|----------------|------------|-------------|------------|
| Brand/Primary  | stellar    | daylight    | `primaryPalette` |
| Secondary      | moonlight  | dusk        | `secondaryPalette` |
| Success        | #4ade80    | #22c55e     | `statusColors.success` |
| Error          | #f87171    | #ef4444     | `statusColors.error` |
| Warning        | #fbbf24    | #f59e0b     | `statusColors.warning` |
| Info           | #38bdf8    | #0ea5e9     | `statusColors.info` |
| Role: User     | #38bdf8    | #0ea5e9     | `ROLE_COLORS.user` |
| Role: Assistant| #4ade80    | #22c55e     | `ROLE_COLORS.assistant` |
| Role: System   | #fbbf24    | #f59e0b     | `ROLE_COLORS.system` |

### Usage Guidelines

```typescript
// ✅ CORRECT: Use theme-aware colors from useTheme hook
import { useTheme } from '../theme/index.js';

function MyComponent() {
  const { colors } = useTheme();
  // Theme-aware: adapts to dark/light mode automatically
  return <Text color={colors.border.focus}>Info</Text>;
}

// ✅ ALSO CORRECT: Use semantic text components (preferred)
import { StatusText } from '../components/feedback/status-text.js';
import { CodeText } from '../components/display/labels.js';

function BetterComponent() {
  return (
    <>
      <StatusText variant="info">Info message</StatusText>
      <CodeText>src/index.ts:42</CodeText>
    </>
  );
}

// ❌ WRONG: Hardcoded colors (not theme-aware)
function BadComponent() {
  return <Text color="#38bdf8">Info</Text>;
}

// ❌ WRONG: Static statusColors (not theme-aware)
import { statusColors } from '../theme/tokens/colors.js';
function AlsoBadComponent() {
  return <Text color={statusColors.info.text}>Info</Text>;
}
```

### Semantic Text Components

Use semantic text components instead of raw `<Text>` with colors:

| Component | Use Case | Example |
|-----------|----------|---------|
| `ScreenTitle` | Main screen headers | `<ScreenTitle>Settings</ScreenTitle>` |
| `SectionTitle` | Section headers | `<SectionTitle>Options</SectionTitle>` |
| `StatusText` | Status indicators | `<StatusText variant="success">Done</StatusText>` |
| `SeverityText` | Issue severity | `<SeverityText severity="high" />` |
| `HintText` | Muted hints | `<HintText>Press ESC to exit</HintText>` |
| `CodeText` | File paths/code | `<CodeText>src/index.ts:42</CodeText>` |

### Badges with Gradients

For premium visual effects, use gradient badges:

```typescript
import { Badge } from '../components/feedback/badge.js';

<Badge variant="success" gradient>Approved</Badge>
<Badge variant="error" gradient>Changes Requested</Badge>
```

### Theme & Component Locations

```
apps/cli/src/tui/theme/
├── tokens/          # Design values (colors, spacing, motion)
├── provider.tsx     # Theme context
├── palettes.ts      # Palette definitions
└── gradient.ts      # Gradient helpers

apps/cli/src/tui/components/
├── feedback/        # Badge, toast, status text, spinners
├── forms/           # Inputs and selectors
├── display/         # Layout/display utilities
├── branding/        # Logos and ASCII art
└── index.ts         # Aggregated exports
```

---

## References

- [Ink Documentation](https://github.com/vadimdemedes/ink)
- [Ink UI Components](https://github.com/vadimdemedes/ink-ui)
- [Pastel Framework](https://github.com/vadimdemedes/pastel)
- [Building Terminal Interfaces with Node.js](https://blog.openreplay.com/building-terminal-interfaces-nodejs/)
- [Using Ink UI with React](https://blog.logrocket.com/using-ink-ui-react-build-interactive-custom-clis/)
