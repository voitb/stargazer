# STARGAZER CLI Feature Roadmap

> Comprehensive feature requirements for transforming the CLI into a full-featured AI-powered code assistant.
> Inspired by Claude Code, OpenCode, and Gemini CLI.

---

## Table of Contents

1. [Chat & Conversation System](#1-chat--conversation-system)
2. [Token & Context Management](#2-token--context-management)
3. [Enhanced CLI Experience](#3-enhanced-cli-experience)
4. [Review Modes](#4-review-modes)
5. [Theme System](#5-theme-system)
6. [API Server & Web UI](#6-api-server--web-ui)
7. [Agentic Workflow](#7-agentic-workflow)
8. [Git Integration](#8-git-integration)
9. [Cross-Platform Support](#9-cross-platform-support)
10. [Session & History Management](#10-session--history-management)
11. [Navigation & Keymaps](#11-navigation--keymaps)
12. [Testing Mode](#12-testing-mode)

---

## 1. Chat & Conversation System

### 1.1 Chat Input for LLM Interaction
**Priority: HIGH**

Add a functional input to the chat so users can have conversations with the LLM.

**Requirements:**
- Text input at the bottom of the screen (following Claude Code/OpenCode pattern)
- Support for multi-line input
- Input history (up/down arrows to navigate previous inputs)
- Auto-focus on the input field
- Visual feedback when LLM is processing

**Reference:** OpenCode chat input, Claude Code conversation interface

### 1.2 Conversation History Persistence
**Priority: CRITICAL**

Currently, conversation history is NOT saved and users cannot return to previous sessions.

**Requirements:**
- Save all conversations to disk (JSON or SQLite)
- List previous conversations in history screen
- Resume any previous conversation
- Search through conversation history
- Delete/archive conversations
- Export conversations (Markdown format)

**Reference:** Claude Code `/resume` command, OpenCode session management

---

## 2. Token & Context Management

### 2.1 Token Counter Display
**Priority: HIGH**

Show how much of the LLM's context window has been used and remaining capacity.

**Requirements:**
- Display current token count in status bar
- Display context limit (varies by model)
- Visual progress indicator (percentage or bar)
- Warning when approaching limit (80%, 90%)
- Real-time updates as conversation grows

**Implementation Note:** Requires token counting logic. For Gemini, use `countTokens` API. For others, use tiktoken or similar.

### 2.2 Token Usage Tracking
**Priority: MEDIUM**

Track token usage across sessions for cost awareness.

**Requirements:**
- Track input/output tokens separately
- Daily/weekly/monthly usage summaries
- Cost estimation based on model pricing
- Usage alerts/limits

---

## 3. Enhanced CLI Experience

### 3.1 Slash Commands (/)
**Priority: HIGH**

After typing `/`, show available commands (like Claude Code).

**Commands to implement:**
- `/help` - Show all commands
- `/clear` - Clear conversation
- `/review` - Run code review
- `/discover` - Discover codebase
- `/settings` - Open settings
- `/theme` - Change theme
- `/model` - Switch model
- `/export` - Export conversation
- `/resume` - Resume previous session
- `/repo` - Show repo summary

### 3.2 File Tagging (@)
**Priority: HIGH**

After typing `@`, allow tagging files to include in context.

**Requirements:**
- Fuzzy search for files in repo
- Preview file contents before adding
- Show file path completion
- Multiple file selection
- Directory selection (include all files)
- Syntax: `@src/index.ts` or `@components/`

### 3.3 Inline Code Comments
**Priority: MEDIUM**

Support for inline code blocks and comments in chat.

**Requirements:**
- Syntax highlighting in chat messages
- Copy code button
- Line numbers
- Language detection

---

## 4. Review Modes

### 4.1 Single File Review Mode
**Priority: HIGH**

Review only specific files, not the whole repository.

**Requirements:**
- Select single file for review
- Select multiple specific files
- Review only changed lines (like PR review)
- Diff view with suggestions
- Accept/reject individual suggestions

### 4.2 Show Exact Changes
**Priority: HIGH**

Display the EXACT changes needed to fix issues found in review.

**Requirements:**
- Unified diff format for each issue
- Line-by-line changes
- Before/after preview
- One-click apply changes
- Copy patch to clipboard
- Generate git patch file

---

## 5. Theme System

### 5.1 User Theme Selection
**Priority: MEDIUM**

Allow users to choose between dark and light themes (like Claude Code).

**Requirements:**
- Dark theme (default) - current blueish colors
- Light theme - inverted colors for light terminals
- Auto-detect from terminal (COLORFGBG env var)
- Persist theme preference
- `/theme` command to switch
- Theme preview before applying

**Reference:** Claude Code `/config` theme settings, OpenCode JSON theme configuration

---

## 6. API Server & Web UI

### 6.1 API Server
**Priority: HIGH**

Local API server that syncs between CLI and Web UI (like OpenCode).

**Requirements:**
- HTTP/WebSocket server running alongside CLI
- Stream LLM responses to both CLI and Web UI
- Sync conversation state
- RESTful API for session management
- WebSocket for real-time updates

**Endpoints:**
- `GET /api/sessions` - List sessions
- `GET /api/sessions/:id` - Get session
- `POST /api/chat` - Send message
- `WS /api/stream` - Stream responses
- `GET /api/status` - Server status

### 6.2 Web UI
**Priority: HIGH**

Web interface accessible from CLI menu/command.

**Requirements:**
- Launch from CLI menu or `--web` flag
- Full chat interface
- Conversation history browser
- File tree with git status
- Code diff viewer
- Settings panel
- Theme support (matches CLI theme)

**Features:**
- Watch git changes in real-time
- Test individual files (new testing mode)
- Side-by-side diff view
- Markdown rendering
- Code syntax highlighting

---

## 7. Agentic Workflow

### 7.1 Repository Summary
**Priority: CRITICAL**

First-time run should create a comprehensive "repo summary" for the AI.

**Requirements:**
- Auto-run on first launch in a repo
- Analyze: file structure, languages, frameworks, dependencies
- Store summary for future sessions
- Update on significant changes
- Manual refresh command (`/repo refresh`)

**Summary includes:**
- Project type (frontend, backend, full-stack)
- Primary languages and frameworks
- Entry points
- Test framework
- Build system
- Key directories
- Important files (README, config, etc.)

### 7.2 Context Persistence
**Priority: HIGH**

AI should remember repo context across sessions.

**Requirements:**
- Load repo summary at session start
- Incremental updates after reviews
- User-triggered refresh
- Show when summary was last updated

---

## 8. Git Integration

### 8.1 Pre-Push Hook
**Priority: MEDIUM**

Run review before git push (like Husky).

**Requirements:**
- Install hook via `stargazer init`
- Run review on staged changes
- Block push if critical issues found
- Configurable severity threshold
- Bypass flag (`--no-verify`)

### 8.2 Git Change Watching
**Priority: MEDIUM**

Watch for git changes in real-time (for Web UI).

**Requirements:**
- File system watcher
- Detect staged/unstaged changes
- Show diff in UI
- Auto-refresh on changes

---

## 9. Cross-Platform Support

### 9.1 OS Support
**Priority: HIGH**

Support all major operating systems.

**Requirements:**
- macOS (Intel + Apple Silicon)
- Linux (Ubuntu, Debian, Fedora, Arch)
- Windows (native + WSL)
- Handle path differences
- Handle terminal differences
- Test on all platforms

**Considerations:**
- Windows terminal color support
- WSL file system access
- Cross-platform config paths
- Native binaries vs Node.js

---

## 10. Session & History Management

### 10.1 Session Persistence
**Priority: CRITICAL**

Save and restore sessions.

**Requirements:**
- Auto-save on each message
- Session metadata (date, model, tokens)
- Session naming (auto + custom)
- Session list in history screen
- Resume session from any point
- Fork session (branch conversation)

### 10.2 History Navigation
**Priority: HIGH**

Browse and search conversation history.

**Requirements:**
- List all sessions with previews
- Search by content
- Filter by date/model
- Sort by date/relevance
- Quick resume (last session)

---

## 11. Navigation & Keymaps

### 11.1 Arrow Key Navigation
**Priority: HIGH**

Improve keyboard navigation throughout TUI.

**Requirements:**
- Left/Right arrows for menu depth navigation
- Up/Down arrows for item selection
- Enter to select/confirm
- Escape to go back
- Tab for focus switching
- Vim-style alternatives (h/j/k/l)

### 11.2 Fix Navigation Blocking
**Priority: CRITICAL**

After model finishes review, navigation gets blocked (state issue).

**Requirements:**
- Debug and fix state management
- Ensure clean state transitions
- Add loading/done states
- Test all navigation paths
- Add timeout handling

### 11.3 Customizable Keymaps
**Priority: LOW**

Allow users to customize keyboard shortcuts.

**Requirements:**
- JSON configuration file
- Default keymap
- Leader key support (like Vim)
- Keymap preview/help
- Conflict detection

---

## 12. Testing Mode

### 12.1 Single File Testing
**Priority: MEDIUM**

Test specific files instead of full test suite.

**Requirements:**
- Select file to test
- Run only related tests
- Show test output
- Re-run failed tests
- Test coverage display

---

## Implementation Order (Suggested)

### Phase 1: Foundation
1. Session & History Management (CRITICAL)
2. Navigation Fixes (CRITICAL)
3. Chat Input for LLM (HIGH)
4. Token Counter Display (HIGH)

### Phase 2: Enhanced Experience
5. Slash Commands (/) (HIGH)
6. File Tagging (@) (HIGH)
7. Single File Review Mode (HIGH)
8. Show Exact Changes (HIGH)

### Phase 3: Agentic Features
9. Repository Summary (CRITICAL)
10. Context Persistence (HIGH)
11. Theme System (MEDIUM)

### Phase 4: Server & Web
12. API Server (HIGH)
13. Web UI (HIGH)
14. Git Change Watching (MEDIUM)

### Phase 5: Polish
15. Pre-Push Hook (MEDIUM)
16. Cross-Platform Support (HIGH)
17. Customizable Keymaps (LOW)
18. Single File Testing (MEDIUM)

---

## Technical Notes

### Design System Validation

After research, the current design token approach is **correct** for terminal CLIs:

- Terminals do NOT support CSS custom properties (they use ANSI escape codes)
- TypeScript objects for design tokens is the industry standard
- This is how OpenCode, Claude Code, and other professional CLI tools implement theming
- The naming convention (`spacing.md`, `colors.brand.primary`) is senior-level pattern

**Sources:**
- [Ink - React for CLI](https://github.com/vadimdemedes/ink)
- [OpenCode TUI Theming](https://deepwiki.com/sst/opencode/6.4-tui-theming-keybinds-and-commands)
- [Chalk - Terminal Styling](https://github.com/chalk/chalk)

### Token Counting

For accurate token counting:
- Gemini: Use `countTokens` API endpoint
- OpenAI-compatible: Use `tiktoken` library
- Anthropic: Use their token counting API

### API Server Architecture

Recommended stack:
- Fastify or Express for HTTP server
- WebSocket (ws library) for real-time streaming
- SQLite for session persistence
- Port: 31337 (configurable)

---

## References

- [Claude Code GitHub](https://github.com/anthropics/claude-code)
- [OpenCode GitHub](https://github.com/sst/opencode)
- [Gemini CLI GitHub](https://github.com/google-gemini/gemini-cli)
- [Ink Documentation](https://github.com/vadimdemedes/ink)
- [oh-my-logo - ASCII Art](https://github.com/shinshin86/oh-my-logo)
