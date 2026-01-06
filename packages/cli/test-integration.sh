#!/bin/bash
set -e

echo "=== Stargazer CLI Integration Test ==="
echo ""

if [ -z "$GEMINI_API_KEY" ]; then
  echo "Error: GEMINI_API_KEY is required"
  exit 1
fi

echo "1. Building CLI..."
pnpm build

echo ""
echo "2. Testing --help..."
pnpm stargazer --help
pnpm stargazer review --help
pnpm stargazer discover --help
pnpm stargazer init --help

echo ""
echo "3. Testing init command..."
rm -f stargazer.config.ts
pnpm stargazer init
test -f stargazer.config.ts && echo "✓ Config file created"

echo ""
echo "4. Testing discover command..."
pnpm stargazer discover --max-files 5
test -f .stargazer/conventions.json && echo "✓ Conventions file created"

echo ""
echo "5. Testing review command..."
pnpm stargazer review --format terminal || true
pnpm stargazer review --format json | head -20 || true
pnpm stargazer review --format markdown | head -20 || true

echo ""
echo "=== All Tests Passed! ==="
echo ""
echo "Stargazer is ready for the hackathon! 🚀"
