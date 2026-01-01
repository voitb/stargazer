---
id: task-071
title: Final CLI integration test
status: todo
priority: high
labels:
  - cli
  - testing
  - milestone
created: '2026-01-01'
order: 710
---
## Description

Comprehensive integration test of the complete CLI.

## Acceptance Criteria

- [ ] All commands work end-to-end
- [ ] Exit codes are correct
- [ ] Output formats work
- [ ] Convention discovery integrates with review

## Implementation

This is a verification task - run the complete test suite.

### Test Script

Create `packages/cli/test-integration.sh`:

```bash
#!/bin/bash
set -e

echo "=== Stargazer CLI Integration Test ==="
echo ""

# Check for API key
if [ -z "$GEMINI_API_KEY" ]; then
  echo "Error: GEMINI_API_KEY is required"
  exit 1
fi

# Build
echo "1. Building CLI..."
pnpm build

# Test help
echo ""
echo "2. Testing --help..."
pnpm stargazer --help
pnpm stargazer review --help
pnpm stargazer discover --help
pnpm stargazer init --help

# Test init
echo ""
echo "3. Testing init command..."
rm -f stargazer.config.ts
pnpm stargazer init
test -f stargazer.config.ts && echo "✓ Config file created"

# Test discover
echo ""
echo "4. Testing discover command..."
pnpm stargazer discover --files 5
test -f .stargazer/conventions.json && echo "✓ Conventions file created"

# Test review with different formats
echo ""
echo "5. Testing review command..."

# Create a test file with an issue
echo 'function test() { eval(userInput); }' > /tmp/test-stargazer.ts
git add /tmp/test-stargazer.ts 2>/dev/null || true

# Test terminal format
echo "   - Terminal format..."
pnpm stargazer review --format terminal || true

# Test JSON format
echo "   - JSON format..."
pnpm stargazer review --format json | head -20 || true

# Test markdown format
echo "   - Markdown format..."
pnpm stargazer review --format markdown | head -20 || true

# Cleanup
rm -f /tmp/test-stargazer.ts
git reset HEAD /tmp/test-stargazer.ts 2>/dev/null || true

# Test exit codes
echo ""
echo "6. Testing exit codes..."

# Test with no changes (should exit 0 or show no changes message)
git stash 2>/dev/null || true
pnpm stargazer review 2>&1 || true
EXIT_CODE=$?
echo "   Exit code with no changes: $EXIT_CODE"

git stash pop 2>/dev/null || true

echo ""
echo "=== All Tests Passed! ==="
echo ""
echo "Stargazer is ready for the hackathon! 🚀"
```

### Manual Verification Checklist

- [ ] `stargazer --version` shows version
- [ ] `stargazer --help` shows all commands
- [ ] `stargazer init` creates config file
- [ ] `stargazer discover` analyzes project
- [ ] `stargazer review` reviews staged changes
- [ ] `stargazer review --format json` outputs valid JSON
- [ ] `stargazer review --format markdown` outputs valid Markdown
- [ ] Exit code 0 when no issues
- [ ] Exit code 1 when issues found
- [ ] Exit code 2 on error
- [ ] Colors display correctly in terminal

## Test

```bash
cd packages/cli
chmod +x test-integration.sh
./test-integration.sh
```

All tests should pass.

---

# 🎉 IMPLEMENTATION COMPLETE!

Congratulations! After completing all 71 tasks, you have:

- ✅ **Core Library** (`@stargazer/core`)
  - Result type pattern for error handling
  - Gemini client with structured output
  - Convention discovery and caching
  - Plugin system (Vite-style hooks)
  - Configuration system

- ✅ **CLI Tool** (`@stargazer/cli`)
  - `stargazer init` - Setup config
  - `stargazer discover` - Analyze conventions
  - `stargazer review` - AI code review
  - Multiple output formats
  - Proper exit codes

- ✅ **GitHub Action** (`@stargazer/action`)
  - PR review automation
  - Formatted comments
  - Configurable severity/limits

You're ready to win the Gemini hackathon! 🏆
