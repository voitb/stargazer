---
id: task-159
title: Implement slash commands (/) system
status: done
priority: high
labels:
  - cli
  - feature
  - chat
created: '2025-01-10'
order: 159
assignee: ai-agent
depends_on:
  - task-157
---

## Description

After typing `/`, show available commands like Claude Code and OpenCode. This provides quick access to CLI functionality from within the chat.

## Commands to Implement

| Command | Description |
|---------|-------------|
| `/help` | Show all available commands |
| `/clear` | Clear conversation history |
| `/review` | Run code review |
| `/review staged` | Review staged changes |
| `/review unstaged` | Review unstaged changes |
| `/discover` | Discover codebase |
| `/settings` | Open settings |
| `/theme` | Change theme (dark/light) |
| `/model` | Switch model |
| `/export` | Export conversation to Markdown |
| `/resume` | Resume previous session |
| `/repo` | Show repository summary |
| `/exit` | Exit the application |

## Implementation

### Step 1: Create command registry

**File:** `packages/cli/src/tui/features/chat/commands/registry.ts` (create)

```typescript
export interface Command {
  name: string;
  aliases: string[];
  description: string;
  usage: string;
  handler: (args: string[], context: CommandContext) => Promise<string | void>;
}

export interface CommandContext {
  navigate: (screen: string) => void;
  clearMessages: () => void;
  addSystemMessage: (content: string) => void;
  runReview: (type: 'staged' | 'unstaged') => void;
  exportSession: () => Promise<string>;
  setTheme: (theme: 'dark' | 'light') => void;
  setModel: (model: string) => void;
  projectPath: string;
}

export const commands: Command[] = [
  {
    name: 'help',
    aliases: ['h', '?'],
    description: 'Show all available commands',
    usage: '/help',
    handler: async () => {
      const commandList = commands
        .map(cmd => `  /${cmd.name.padEnd(12)} ${cmd.description}`)
        .join('\n');
      return `Available commands:\n\n${commandList}\n\nType /command for more info.`;
    },
  },
  {
    name: 'clear',
    aliases: ['c'],
    description: 'Clear conversation history',
    usage: '/clear',
    handler: async (_, ctx) => {
      ctx.clearMessages();
      return 'Conversation cleared.';
    },
  },
  {
    name: 'review',
    aliases: ['r'],
    description: 'Run code review',
    usage: '/review [staged|unstaged]',
    handler: async (args, ctx) => {
      const type = args[0] === 'unstaged' ? 'unstaged' : 'staged';
      ctx.runReview(type);
      return `Starting ${type} review...`;
    },
  },
  {
    name: 'settings',
    aliases: ['s', 'config'],
    description: 'Open settings',
    usage: '/settings',
    handler: async (_, ctx) => {
      ctx.navigate('settings');
    },
  },
  {
    name: 'theme',
    aliases: ['t'],
    description: 'Change theme (dark/light)',
    usage: '/theme [dark|light]',
    handler: async (args, ctx) => {
      if (!args[0] || !['dark', 'light'].includes(args[0])) {
        return 'Usage: /theme dark or /theme light';
      }
      ctx.setTheme(args[0] as 'dark' | 'light');
      return `Theme changed to ${args[0]}.`;
    },
  },
  {
    name: 'model',
    aliases: ['m'],
    description: 'Switch LLM model',
    usage: '/model [model-name]',
    handler: async (args, ctx) => {
      if (!args[0]) {
        return 'Available models: gemini-1.5-pro, gemini-1.5-flash';
      }
      ctx.setModel(args[0]);
      return `Model changed to ${args[0]}.`;
    },
  },
  {
    name: 'export',
    aliases: ['e'],
    description: 'Export conversation to Markdown',
    usage: '/export',
    handler: async (_, ctx) => {
      const markdown = await ctx.exportSession();
      // Could also write to file
      return `Session exported:\n\n${markdown}`;
    },
  },
  {
    name: 'repo',
    aliases: [],
    description: 'Show repository summary',
    usage: '/repo [refresh]',
    handler: async (args, ctx) => {
      if (args[0] === 'refresh') {
        return 'Refreshing repository summary...';
      }
      return `Repository: ${ctx.projectPath}\nUse /repo refresh to update summary.`;
    },
  },
  {
    name: 'exit',
    aliases: ['quit', 'q'],
    description: 'Exit the application',
    usage: '/exit',
    handler: async (_, ctx) => {
      ctx.navigate('exit');
    },
  },
];

/**
 * Find command by name or alias
 */
export function findCommand(name: string): Command | undefined {
  return commands.find(
    cmd => cmd.name === name || cmd.aliases.includes(name)
  );
}

/**
 * Get command suggestions for autocomplete
 */
export function getCommandSuggestions(partial: string): Command[] {
  const lower = partial.toLowerCase();
  return commands.filter(
    cmd =>
      cmd.name.startsWith(lower) ||
      cmd.aliases.some(alias => alias.startsWith(lower))
  );
}
```

### Step 2: Create command executor

**File:** `packages/cli/src/tui/features/chat/commands/executor.ts` (create)

```typescript
import { findCommand, type CommandContext } from './registry.js';

export interface ExecuteResult {
  success: boolean;
  output?: string;
  error?: string;
}

/**
 * Execute a slash command
 */
export async function executeCommand(
  input: string,
  context: CommandContext
): Promise<ExecuteResult> {
  // Parse command and args
  const parts = input.slice(1).trim().split(/\s+/);
  const commandName = parts[0]?.toLowerCase();
  const args = parts.slice(1);

  if (!commandName) {
    return {
      success: false,
      error: 'No command specified. Type /help for available commands.',
    };
  }

  const command = findCommand(commandName);

  if (!command) {
    return {
      success: false,
      error: `Unknown command: /${commandName}. Type /help for available commands.`,
    };
  }

  try {
    const output = await command.handler(args, context);
    return {
      success: true,
      output: output || undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Command failed',
    };
  }
}
```

### Step 3: Create command palette component

**File:** `packages/cli/src/tui/features/chat/components/command-palette.tsx` (create)

```typescript
import { Box, Text, useInput } from 'ink';
import { useState, useMemo } from 'react';
import { commands, getCommandSuggestions, type Command } from '../commands/registry.js';
import { useTheme } from '../../../design-system/index.js';

interface CommandPaletteProps {
  searchTerm: string;
  onSelect: (command: Command) => void;
  onClose: () => void;
}

export function CommandPalette({
  searchTerm,
  onSelect,
  onClose,
}: CommandPaletteProps) {
  const { colors } = useTheme();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const suggestions = useMemo(() => {
    if (!searchTerm) return commands;
    return getCommandSuggestions(searchTerm);
  }, [searchTerm]);

  useInput((input, key) => {
    if (key.escape) {
      onClose();
      return;
    }

    if (key.upArrow) {
      setSelectedIndex(i => Math.max(0, i - 1));
      return;
    }

    if (key.downArrow) {
      setSelectedIndex(i => Math.min(suggestions.length - 1, i + 1));
      return;
    }

    if (key.return && suggestions[selectedIndex]) {
      onSelect(suggestions[selectedIndex]);
      return;
    }
  });

  if (suggestions.length === 0) {
    return (
      <Box padding={1}>
        <Text dimColor>No commands match "{searchTerm}"</Text>
      </Box>
    );
  }

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={colors.border.subtle}
      padding={1}
      marginBottom={1}
    >
      <Text bold>Commands</Text>
      <Box flexDirection="column" marginTop={1}>
        {suggestions.slice(0, 8).map((cmd, index) => (
          <Box key={cmd.name} gap={2}>
            <Text color={index === selectedIndex ? 'cyan' : undefined}>
              {index === selectedIndex ? '▶' : ' '}
            </Text>
            <Text bold={index === selectedIndex}>/{cmd.name}</Text>
            <Text dimColor>{cmd.description}</Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
```

### Step 4: Integrate with chat input

**File:** `packages/cli/src/tui/features/chat/components/enhanced-chat-input.tsx`

Update to show command palette when typing `/`:

```typescript
import { useState, useCallback, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { CommandPalette } from './command-palette.js';
import { executeCommand, type CommandContext } from '../commands/executor.js';

// ... existing code ...

export function EnhancedChatInput({
  onSubmit,
  onCommand,
  commandContext,
  // ... other props
}: EnhancedChatInputProps) {
  const [value, setValue] = useState('');
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Show command palette when input starts with /
  const commandSearchTerm = useMemo(() => {
    if (value.startsWith('/') && value.length > 1) {
      return value.slice(1).split(' ')[0] || '';
    }
    return '';
  }, [value]);

  const shouldShowPalette = value.startsWith('/') && !value.includes(' ');

  const handleSubmit = useCallback(async () => {
    const trimmed = value.trim();
    if (!trimmed) return;

    if (trimmed.startsWith('/')) {
      // Execute command
      const result = await executeCommand(trimmed, commandContext);
      if (result.output) {
        onCommand?.(result.output);
      }
      if (result.error) {
        onCommand?.(`Error: ${result.error}`);
      }
    } else {
      // Send as message
      onSubmit(trimmed);
    }

    setValue('');
    setShowCommandPalette(false);
  }, [value, onSubmit, onCommand, commandContext]);

  return (
    <Box flexDirection="column">
      {shouldShowPalette && (
        <CommandPalette
          searchTerm={commandSearchTerm}
          onSelect={(cmd) => {
            setValue(`/${cmd.name} `);
            setShowCommandPalette(false);
          }}
          onClose={() => setShowCommandPalette(false)}
        />
      )}
      {/* ... rest of input component ... */}
    </Box>
  );
}
```

## Acceptance Criteria

- [ ] Typing `/` shows command palette
- [ ] Arrow keys navigate command suggestions
- [ ] Enter executes selected command
- [ ] All commands work correctly
- [ ] Unknown commands show helpful error
- [ ] `/help` shows all available commands
- [ ] Commands with arguments work (e.g., `/review staged`)

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit

# Manual test:
# 1. Start CLI
# 2. Go to chat
# 3. Type / and verify command palette appears
# 4. Navigate with arrows, select with Enter
# 5. Test each command:
#    - /help
#    - /clear
#    - /review staged
#    - /settings
#    - /theme dark
#    - /export
```

## Files Changed

- CREATE: `packages/cli/src/tui/features/chat/commands/registry.ts`
- CREATE: `packages/cli/src/tui/features/chat/commands/executor.ts`
- CREATE: `packages/cli/src/tui/features/chat/commands/index.ts`
- CREATE: `packages/cli/src/tui/features/chat/components/command-palette.tsx`
- UPDATE: `packages/cli/src/tui/features/chat/components/enhanced-chat-input.tsx`
- UPDATE: `packages/cli/src/tui/features/chat/components/index.ts`
