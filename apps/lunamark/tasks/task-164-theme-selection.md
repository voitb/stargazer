---
id: task-164
title: Implement user theme selection
status: pending
priority: medium
labels:
  - cli
  - feature
  - ui
created: '2025-01-10'
order: 164
assignee: ai-agent
depends_on:
  - task-151
---

## Description

Allow users to choose between dark and light themes (like Claude Code), with persistence of their preference.

## Requirements

1. Dark theme (default) - current blueish stellar colors
2. Light theme - inverted colors for light terminals
3. Auto-detect from terminal (COLORFGBG env var)
4. Persist theme preference
5. `/theme` command to switch
6. Theme option in settings menu

## Implementation

### Step 1: Update theme persistence

**File:** `packages/cli/src/tui/storage/settings-store.ts` (create or update)

```typescript
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';

const SETTINGS_DIR = join(homedir(), '.stargazer');
const SETTINGS_FILE = join(SETTINGS_DIR, 'settings.json');

export interface UserSettings {
  theme: 'dark' | 'light' | 'auto';
  model: string;
  apiKeys: {
    gemini?: string;
    openai?: string;
    anthropic?: string;
  };
}

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'auto',
  model: 'gemini-1.5-pro',
  apiKeys: {},
};

export async function getSettings(): Promise<UserSettings> {
  await mkdir(SETTINGS_DIR, { recursive: true });

  if (!existsSync(SETTINGS_FILE)) {
    return DEFAULT_SETTINGS;
  }

  try {
    const content = await readFile(SETTINGS_FILE, 'utf-8');
    return { ...DEFAULT_SETTINGS, ...JSON.parse(content) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Partial<UserSettings>): Promise<void> {
  await mkdir(SETTINGS_DIR, { recursive: true });

  const current = await getSettings();
  const updated = { ...current, ...settings };

  await writeFile(SETTINGS_FILE, JSON.stringify(updated, null, 2));
}

export async function getThemePreference(): Promise<'dark' | 'light' | 'auto'> {
  const settings = await getSettings();
  return settings.theme;
}

export async function setThemePreference(theme: 'dark' | 'light' | 'auto'): Promise<void> {
  await saveSettings({ theme });
}
```

### Step 2: Update theme provider with persistence

**File:** `packages/cli/src/tui/design-system/primitives/theme-provider.tsx`

```typescript
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getThemeColors, type ThemeColors } from '../tokens/colors.js';
import { getThemePreference, setThemePreference } from '../../storage/settings-store.js';

export type Theme = 'dark' | 'light';

export interface ThemeContextValue {
  theme: Theme;
  colors: ThemeColors;
  setTheme: (theme: Theme | 'auto') => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Detect theme from environment
 */
export function detectTheme(): Theme {
  // Check STARGAZER_THEME env var
  const envTheme = process.env.STARGAZER_THEME;
  if (envTheme === 'light' || envTheme === 'dark') {
    return envTheme;
  }

  // Check COLORFGBG (format: "fg;bg")
  const colorfgbg = process.env.COLORFGBG;
  if (colorfgbg) {
    const parts = colorfgbg.split(';');
    const bg = parseInt(parts[1] || '0', 10);
    // High values = light background
    return bg > 8 ? 'light' : 'dark';
  }

  // NOTE: For macOS appearance detection, use execFileNoThrow utility
  // to avoid command injection vulnerabilities. However, for simplicity
  // in this task, we skip this check and default to dark theme.
  // If needed, import execFileNoThrow from '../utils/execFileNoThrow.js'

  // Default to dark
  return 'dark';
}

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({ children, defaultTheme }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme || detectTheme());
  const [preference, setPreference] = useState<'dark' | 'light' | 'auto'>('auto');

  // Load saved preference on mount
  useEffect(() => {
    getThemePreference().then(pref => {
      setPreference(pref);
      if (pref !== 'auto') {
        setThemeState(pref);
      }
    });
  }, []);

  const setTheme = (newTheme: Theme | 'auto') => {
    setPreference(newTheme);
    setThemePreference(newTheme);

    if (newTheme === 'auto') {
      setThemeState(detectTheme());
    } else {
      setThemeState(newTheme);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const colors = getThemeColors(theme);

  const value: ThemeContextValue = {
    theme,
    colors,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

export function useIsDark(): boolean {
  const { theme } = useTheme();
  return theme === 'dark';
}
```

### Step 3: Add theme to settings screen

**File:** `packages/cli/src/tui/features/settings/settings-screen.tsx`

```typescript
import { Box, Text, useInput } from 'ink';
import { useState } from 'react';
import { useTheme, ScreenTitle, Badge, HintText } from '../../design-system/index.js';
import { useNavigation } from '../../state/navigation-context.js';

export function SettingsScreen() {
  const { colors, theme, setTheme } = useTheme();
  const { goBack } = useNavigation();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const settings = [
    {
      label: 'Theme',
      value: theme,
      options: ['dark', 'light', 'auto'],
    },
    {
      label: 'Model',
      value: 'gemini-1.5-pro',
      options: ['gemini-1.5-pro', 'gemini-1.5-flash'],
    },
    // ... more settings
  ];

  useInput((input, key) => {
    if (key.escape || input === 'b') {
      goBack();
      return;
    }

    if (key.upArrow || input === 'k') {
      setSelectedIndex(i => Math.max(0, i - 1));
      return;
    }

    if (key.downArrow || input === 'j') {
      setSelectedIndex(i => Math.min(settings.length - 1, i + 1));
      return;
    }

    // Cycle through options
    if (key.return || key.rightArrow || input === 'l') {
      const setting = settings[selectedIndex];
      if (setting) {
        const currentIndex = setting.options.indexOf(setting.value);
        const nextIndex = (currentIndex + 1) % setting.options.length;
        const newValue = setting.options[nextIndex];

        if (setting.label === 'Theme') {
          setTheme(newValue as 'dark' | 'light' | 'auto');
        }
        // ... handle other settings
      }
      return;
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <ScreenTitle>Settings</ScreenTitle>

      <Box flexDirection="column" marginTop={1}>
        {settings.map((setting, index) => (
          <Box key={setting.label} gap={2}>
            <Text color={index === selectedIndex ? 'cyan' : undefined}>
              {index === selectedIndex ? '▶' : ' '}
            </Text>
            <Text bold={index === selectedIndex}>{setting.label}:</Text>
            <Badge variant={index === selectedIndex ? 'brand' : 'default'}>
              {setting.value}
            </Badge>
          </Box>
        ))}
      </Box>

      <Box marginTop={2}>
        <HintText>↑↓ navigate • Enter/→ change • ESC back</HintText>
      </Box>
    </Box>
  );
}
```

### Step 4: Add /theme command

**File:** `packages/cli/src/tui/features/chat/commands/registry.ts`

Update the theme command:

```typescript
{
  name: 'theme',
  aliases: ['t'],
  description: 'Change theme (dark/light/auto)',
  usage: '/theme [dark|light|auto]',
  handler: async (args, ctx) => {
    const validThemes = ['dark', 'light', 'auto'];
    const theme = args[0]?.toLowerCase();

    if (!theme) {
      return `Current theme: ${ctx.currentTheme}\nUsage: /theme dark|light|auto`;
    }

    if (!validThemes.includes(theme)) {
      return `Invalid theme. Choose from: ${validThemes.join(', ')}`;
    }

    ctx.setTheme(theme as 'dark' | 'light' | 'auto');
    return `Theme changed to: ${theme}`;
  },
},
```

## Acceptance Criteria

- [ ] `/theme dark` switches to dark theme
- [ ] `/theme light` switches to light theme
- [ ] `/theme auto` uses terminal detection
- [ ] Theme persists across sessions
- [ ] Settings screen shows theme option
- [ ] All components respect theme (no hardcoded colors)
- [ ] Light theme has proper inverted colors

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit

# Manual test:
# 1. Start CLI (should be dark by default)
# 2. Type /theme light - should switch
# 3. Exit and restart - should remember light
# 4. Type /theme auto - should detect from terminal
# 5. Go to settings, change theme there
```

## Files Changed

- UPDATE: `packages/cli/src/tui/storage/settings-store.ts`
- UPDATE: `packages/cli/src/tui/design-system/primitives/theme-provider.tsx`
- UPDATE: `packages/cli/src/tui/features/settings/settings-screen.tsx`
- UPDATE: `packages/cli/src/tui/features/chat/commands/registry.ts`
