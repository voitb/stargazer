---
id: task-168
title: Implement cross-platform support
status: pending
priority: high
labels:
  - cli
  - feature
  - platform
created: '2025-01-10'
order: 168
assignee: ai-agent
depends_on: []
---

## Description

Ensure the CLI works correctly on macOS, Linux, and Windows (native + WSL).

## Requirements

1. macOS (Intel + Apple Silicon)
2. Linux (Ubuntu, Debian, Fedora, Arch)
3. Windows (native + WSL)
4. Handle path differences
5. Handle terminal differences
6. Test on all platforms

## Implementation

### Step 1: Create platform utilities

**File:** `packages/cli/src/utils/platform.ts`

```typescript
import { homedir, platform, arch } from 'node:os';
import { join, sep } from 'node:path';

/**
 * Current platform
 */
export const PLATFORM = platform();
export const ARCH = arch();
export const IS_WINDOWS = PLATFORM === 'win32';
export const IS_MAC = PLATFORM === 'darwin';
export const IS_LINUX = PLATFORM === 'linux';
export const IS_WSL = IS_LINUX && process.env.WSL_DISTRO_NAME !== undefined;

/**
 * Get user home directory
 */
export function getHomeDir(): string {
  return homedir();
}

/**
 * Get Stargazer config directory
 */
export function getConfigDir(): string {
  if (IS_WINDOWS) {
    // Use APPDATA on Windows
    return join(process.env.APPDATA || join(homedir(), 'AppData', 'Roaming'), 'stargazer');
  }
  // Use ~/.stargazer on Unix
  return join(homedir(), '.stargazer');
}

/**
 * Get temporary directory
 */
export function getTempDir(): string {
  if (IS_WINDOWS) {
    return process.env.TEMP || join(homedir(), 'AppData', 'Local', 'Temp');
  }
  return '/tmp';
}

/**
 * Normalize path for current platform
 */
export function normalizePath(path: string): string {
  if (IS_WINDOWS) {
    // Convert forward slashes to backslashes on Windows
    return path.replace(/\//g, '\\');
  }
  return path;
}

/**
 * Convert path to POSIX format (for git, etc.)
 */
export function toPosixPath(path: string): string {
  return path.replace(/\\/g, '/');
}

/**
 * Check if path is absolute
 */
export function isAbsolutePath(path: string): boolean {
  if (IS_WINDOWS) {
    // Windows absolute paths: C:\ or \\server
    return /^[a-zA-Z]:[\\/]/.test(path) || /^\\\\/.test(path);
  }
  return path.startsWith('/');
}

/**
 * Get shell for current platform
 */
export function getShell(): string {
  if (IS_WINDOWS) {
    return process.env.COMSPEC || 'cmd.exe';
  }
  return process.env.SHELL || '/bin/sh';
}

/**
 * Platform-specific environment variable separator
 */
export const PATH_SEPARATOR = IS_WINDOWS ? ';' : ':';

/**
 * Check terminal capabilities
 */
export function getTerminalCapabilities() {
  const term = process.env.TERM || '';
  const colorterm = process.env.COLORTERM || '';

  return {
    // Color support
    supportsColor: process.stdout.isTTY !== false,
    supports256Colors: term.includes('256color') || colorterm === 'truecolor',
    supportsTrueColor: colorterm === 'truecolor' || colorterm === '24bit',

    // Unicode support (most modern terminals support this)
    supportsUnicode: !IS_WINDOWS || process.env.WT_SESSION !== undefined,

    // Windows Terminal detection
    isWindowsTerminal: process.env.WT_SESSION !== undefined,

    // VS Code integrated terminal
    isVSCodeTerminal: process.env.TERM_PROGRAM === 'vscode',

    // iTerm2
    isITerm: process.env.TERM_PROGRAM === 'iTerm.app',
  };
}
```

### Step 2: Update storage paths

**File:** `packages/cli/src/tui/storage/paths.ts`

```typescript
import { join } from 'node:path';
import { mkdir } from 'node:fs/promises';
import { getConfigDir, getTempDir } from '../../utils/platform.js';

const CONFIG_DIR = getConfigDir();

export const PATHS = {
  config: CONFIG_DIR,
  sessions: join(CONFIG_DIR, 'sessions'),
  cache: join(CONFIG_DIR, 'cache'),
  settings: join(CONFIG_DIR, 'settings.json'),
  apiKeys: join(CONFIG_DIR, 'credentials'),
} as const;

/**
 * Ensure all required directories exist
 */
export async function ensureDirectories(): Promise<void> {
  await mkdir(PATHS.config, { recursive: true });
  await mkdir(PATHS.sessions, { recursive: true });
  await mkdir(PATHS.cache, { recursive: true });
  await mkdir(PATHS.apiKeys, { recursive: true });
}
```

### Step 3: Update execFileNoThrow for Windows

**File:** `packages/cli/src/utils/execFileNoThrow.ts`

Ensure it handles Windows properly:

```typescript
import { execFile as nodeExecFile } from 'node:child_process';
import { promisify } from 'node:util';
import { IS_WINDOWS } from './platform.js';

const execFileAsync = promisify(nodeExecFile);

export interface ExecResult {
  stdout: string;
  stderr: string;
  status: number;
}

/**
 * Execute a command safely without shell injection risks
 */
export async function execFileNoThrow(
  command: string,
  args: string[] = [],
  options: { cwd?: string; timeout?: number } = {}
): Promise<ExecResult> {
  try {
    // On Windows, some commands need .exe extension
    const cmd = IS_WINDOWS && !command.includes('.') ? `${command}.exe` : command;

    const { stdout, stderr } = await execFileAsync(cmd, args, {
      cwd: options.cwd,
      timeout: options.timeout || 30000,
      encoding: 'utf-8',
      // On Windows, hide the console window
      windowsHide: true,
    });

    return { stdout, stderr, status: 0 };
  } catch (error: any) {
    return {
      stdout: error.stdout || '',
      stderr: error.stderr || error.message,
      status: error.code || 1,
    };
  }
}

/**
 * Check if a command exists
 */
export async function commandExists(command: string): Promise<boolean> {
  const checkCmd = IS_WINDOWS ? 'where' : 'which';
  const result = await execFileNoThrow(checkCmd, [command]);
  return result.status === 0;
}
```

### Step 4: Handle terminal differences

**File:** `packages/cli/src/tui/utils/terminal-compat.ts`

```typescript
import { getTerminalCapabilities, IS_WINDOWS } from '../../utils/platform.js';

const caps = getTerminalCapabilities();

/**
 * Get appropriate spinner characters based on terminal support
 */
export function getSpinnerChars(): string[] {
  if (!caps.supportsUnicode) {
    // ASCII fallback for older Windows terminals
    return ['-', '\\', '|', '/'];
  }
  // Unicode spinner
  return ['◐', '◓', '◑', '◒'];
}

/**
 * Get appropriate star icons based on terminal support
 */
export function getStarIcons() {
  if (!caps.supportsUnicode) {
    return {
      filled: '*',
      outline: 'o',
      diamond: '<>',
      circle: '()',
    };
  }
  return {
    filled: '★',
    outline: '☆',
    diamond: '◇',
    circle: '○',
  };
}

/**
 * Get box drawing characters
 */
export function getBoxChars() {
  if (!caps.supportsUnicode) {
    return {
      topLeft: '+',
      topRight: '+',
      bottomLeft: '+',
      bottomRight: '+',
      horizontal: '-',
      vertical: '|',
    };
  }
  return {
    topLeft: '╭',
    topRight: '╮',
    bottomLeft: '╰',
    bottomRight: '╯',
    horizontal: '─',
    vertical: '│',
  };
}

/**
 * Clear terminal screen
 */
export function clearScreen(): void {
  if (IS_WINDOWS) {
    process.stdout.write('\x1Bc');
  } else {
    process.stdout.write('\x1B[2J\x1B[H');
  }
}
```

### Step 5: Update clipboard operations

**File:** `packages/cli/src/utils/clipboard.ts`

```typescript
import { execFileNoThrow } from './execFileNoThrow.js';
import { IS_WINDOWS, IS_MAC, IS_WSL } from './platform.js';

/**
 * Copy text to system clipboard
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (IS_MAC) {
    const result = await execFileNoThrow('pbcopy');
    // pbcopy reads from stdin, need different approach
    const { spawn } = await import('node:child_process');
    return new Promise((resolve, reject) => {
      const proc = spawn('pbcopy');
      proc.stdin.write(text);
      proc.stdin.end();
      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error('Failed to copy to clipboard'));
      });
    });
  }

  if (IS_WINDOWS || IS_WSL) {
    const { spawn } = await import('node:child_process');
    const cmd = IS_WSL ? 'clip.exe' : 'clip';
    return new Promise((resolve, reject) => {
      const proc = spawn(cmd);
      proc.stdin.write(text);
      proc.stdin.end();
      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error('Failed to copy to clipboard'));
      });
    });
  }

  // Linux - try xclip, xsel, or wl-copy
  const { spawn } = await import('node:child_process');

  // Try xclip first
  if ((await execFileNoThrow('which', ['xclip'])).status === 0) {
    return new Promise((resolve, reject) => {
      const proc = spawn('xclip', ['-selection', 'clipboard']);
      proc.stdin.write(text);
      proc.stdin.end();
      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error('Failed to copy to clipboard'));
      });
    });
  }

  // Try xsel
  if ((await execFileNoThrow('which', ['xsel'])).status === 0) {
    return new Promise((resolve, reject) => {
      const proc = spawn('xsel', ['--clipboard', '--input']);
      proc.stdin.write(text);
      proc.stdin.end();
      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error('Failed to copy to clipboard'));
      });
    });
  }

  throw new Error('No clipboard utility found. Install xclip or xsel.');
}
```

## Acceptance Criteria

- [ ] Works on macOS (Intel and Apple Silicon)
- [ ] Works on Linux (Ubuntu, Debian, Fedora)
- [ ] Works on Windows 10/11 native
- [ ] Works on Windows with WSL
- [ ] Correct path handling on all platforms
- [ ] Correct config directory on all platforms
- [ ] Clipboard works on all platforms
- [ ] Unicode/ASCII fallback for older terminals
- [ ] Git hooks work on all platforms

## Test

```bash
# Test on each platform:
# 1. Install CLI
# 2. Run CLI
# 3. Test navigation
# 4. Test chat
# 5. Test clipboard (copy patch)
# 6. Test git hooks
# 7. Test file paths with spaces

# Platform-specific tests:
# - Windows: Test in cmd, PowerShell, and Windows Terminal
# - Linux: Test in various terminal emulators
# - macOS: Test in Terminal.app and iTerm2
```

## Files Changed

- CREATE: `packages/cli/src/utils/platform.ts`
- UPDATE: `packages/cli/src/tui/storage/paths.ts`
- UPDATE: `packages/cli/src/utils/execFileNoThrow.ts`
- CREATE: `packages/cli/src/tui/utils/terminal-compat.ts`
- CREATE: `packages/cli/src/utils/clipboard.ts`
