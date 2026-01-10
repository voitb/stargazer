---
id: task-169
title: Implement single file testing mode
status: pending
priority: medium
labels:
  - cli
  - feature
  - testing
created: '2025-01-10'
order: 169
assignee: ai-agent
depends_on:
  - task-161
---

## Description

Allow users to test specific files instead of running the full test suite. Useful for focused development and faster feedback loops.

## Requirements

1. Select file to test
2. Run only related tests
3. Show test output
4. Re-run failed tests
5. Test coverage display (optional)

## Implementation

### Step 1: Create test runner utility

**File:** `packages/cli/src/utils/test-runner.ts`

```typescript
import { execFileNoThrow } from './execFileNoThrow.js';
import { join, basename, dirname } from 'node:path';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

export interface TestResult {
  passed: boolean;
  output: string;
  duration: number;
  testsRun: number;
  testsPassed: number;
  testsFailed: number;
  failedTests: string[];
}

/**
 * Detect test framework from package.json
 */
export async function detectTestFramework(projectPath: string): Promise<string | null> {
  const packageJsonPath = join(projectPath, 'package.json');

  if (!existsSync(packageJsonPath)) {
    return null;
  }

  const pkg = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  if (deps.vitest) return 'vitest';
  if (deps.jest) return 'jest';
  if (deps.mocha) return 'mocha';
  if (deps.ava) return 'ava';

  return null;
}

/**
 * Find test files related to a source file
 */
export async function findRelatedTests(
  projectPath: string,
  sourceFile: string
): Promise<string[]> {
  const baseName = basename(sourceFile, '.ts').replace('.tsx', '');
  const dirName = dirname(sourceFile);

  // Common test file patterns
  const patterns = [
    `${baseName}.test.ts`,
    `${baseName}.test.tsx`,
    `${baseName}.spec.ts`,
    `${baseName}.spec.tsx`,
    `__tests__/${baseName}.test.ts`,
    `__tests__/${baseName}.test.tsx`,
    `__tests__/${baseName}.spec.ts`,
    `__tests__/${baseName}.spec.tsx`,
  ];

  const tests: string[] = [];

  for (const pattern of patterns) {
    // Check in same directory
    const testPath = join(projectPath, dirName, pattern);
    if (existsSync(testPath)) {
      tests.push(testPath);
    }

    // Check in project root test directory
    const rootTestPath = join(projectPath, 'tests', pattern);
    if (existsSync(rootTestPath)) {
      tests.push(rootTestPath);
    }

    // Check in __tests__ directory
    const underscoreTestPath = join(projectPath, '__tests__', pattern);
    if (existsSync(underscoreTestPath)) {
      tests.push(underscoreTestPath);
    }
  }

  return tests;
}

/**
 * Run tests for specific files
 */
export async function runTests(
  projectPath: string,
  testFiles: string[],
  options: { watch?: boolean; coverage?: boolean } = {}
): Promise<TestResult> {
  const framework = await detectTestFramework(projectPath);

  if (!framework) {
    return {
      passed: false,
      output: 'No test framework detected',
      duration: 0,
      testsRun: 0,
      testsPassed: 0,
      testsFailed: 0,
      failedTests: [],
    };
  }

  const startTime = Date.now();
  let result: { stdout: string; stderr: string; status: number };

  switch (framework) {
    case 'vitest':
      result = await runVitest(projectPath, testFiles, options);
      break;
    case 'jest':
      result = await runJest(projectPath, testFiles, options);
      break;
    default:
      return {
        passed: false,
        output: `Unsupported test framework: ${framework}`,
        duration: 0,
        testsRun: 0,
        testsPassed: 0,
        testsFailed: 0,
        failedTests: [],
      };
  }

  const duration = Date.now() - startTime;
  const output = result.stdout + result.stderr;

  // Parse results (simplified)
  const testsRun = (output.match(/Tests:\s+(\d+)/)?.[1] || '0');
  const testsPassed = (output.match(/(\d+) passed/)?.[1] || '0');
  const testsFailed = (output.match(/(\d+) failed/)?.[1] || '0');

  return {
    passed: result.status === 0,
    output,
    duration,
    testsRun: parseInt(testsRun),
    testsPassed: parseInt(testsPassed),
    testsFailed: parseInt(testsFailed),
    failedTests: [], // Would need more parsing
  };
}

async function runVitest(
  projectPath: string,
  testFiles: string[],
  options: { watch?: boolean; coverage?: boolean }
) {
  const args = ['vitest', 'run', ...testFiles];

  if (options.watch) {
    args[1] = 'watch';
  }
  if (options.coverage) {
    args.push('--coverage');
  }

  return execFileNoThrow('npx', args, { cwd: projectPath, timeout: 120000 });
}

async function runJest(
  projectPath: string,
  testFiles: string[],
  options: { watch?: boolean; coverage?: boolean }
) {
  const args = ['jest', ...testFiles, '--colors'];

  if (options.watch) {
    args.push('--watch');
  }
  if (options.coverage) {
    args.push('--coverage');
  }

  return execFileNoThrow('npx', args, { cwd: projectPath, timeout: 120000 });
}
```

### Step 2: Create test screen component

**File:** `packages/cli/src/tui/features/testing/test-screen.tsx` (create)

```typescript
import { Box, Text, useInput } from 'ink';
import { useState, useEffect } from 'react';
import { useTheme, ScreenTitle, Badge, HintText, StarSpinner } from '../../design-system/index.js';
import { useNavigation } from '../../state/navigation-context.js';
import { fuzzySearchFiles, type FileMatch } from '../../utils/file-search.js';
import { findRelatedTests, runTests, type TestResult } from '../../utils/test-runner.js';

interface TestScreenProps {
  projectPath: string;
}

export function TestScreen({ projectPath }: TestScreenProps) {
  const { colors } = useTheme();
  const { goBack } = useNavigation();

  const [mode, setMode] = useState<'select' | 'running' | 'results'>('select');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [relatedTests, setRelatedTests] = useState<string[]>([]);
  const [result, setResult] = useState<TestResult | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Find related tests when file is selected
  useEffect(() => {
    if (selectedFile) {
      findRelatedTests(projectPath, selectedFile).then(setRelatedTests);
    }
  }, [selectedFile, projectPath]);

  const handleRunTests = async () => {
    if (relatedTests.length === 0) return;

    setMode('running');
    const result = await runTests(projectPath, relatedTests);
    setResult(result);
    setMode('results');
  };

  useInput((input, key) => {
    if (key.escape) {
      if (mode === 'results') {
        setMode('select');
        setResult(null);
      } else {
        goBack();
      }
      return;
    }

    if (mode === 'select') {
      if (key.return && selectedFile && relatedTests.length > 0) {
        handleRunTests();
        return;
      }

      if (input === 'r' && result) {
        handleRunTests();
        return;
      }
    }
  });

  if (mode === 'running') {
    return (
      <Box flexDirection="column" padding={1} alignItems="center">
        <ScreenTitle>Running Tests</ScreenTitle>
        <Box marginY={2}>
          <StarSpinner />
          <Text> Running {relatedTests.length} test file(s)...</Text>
        </Box>
      </Box>
    );
  }

  if (mode === 'results' && result) {
    return (
      <Box flexDirection="column" padding={1}>
        <ScreenTitle>Test Results</ScreenTitle>

        <Box marginY={1}>
          <Badge variant={result.passed ? 'success' : 'error'}>
            {result.passed ? 'PASSED' : 'FAILED'}
          </Badge>
          <Text> in {result.duration}ms</Text>
        </Box>

        <Box marginY={1} gap={2}>
          <Text color="green">✓ {result.testsPassed} passed</Text>
          {result.testsFailed > 0 && (
            <Text color="red">✗ {result.testsFailed} failed</Text>
          )}
          <Text dimColor>({result.testsRun} total)</Text>
        </Box>

        {/* Test output */}
        <Box
          flexDirection="column"
          borderStyle="round"
          borderColor={colors.border.subtle}
          padding={1}
          marginY={1}
          maxHeight={20}
        >
          <Text>{result.output}</Text>
        </Box>

        <HintText>R re-run • ESC back</HintText>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <ScreenTitle>Test File</ScreenTitle>

      {/* File search */}
      <Box marginY={1}>
        <Text>Search: </Text>
        <Text color="cyan">{searchTerm || '(type to filter files)'}</Text>
      </Box>

      {/* Selected file */}
      {selectedFile && (
        <Box marginY={1} flexDirection="column">
          <Text bold>Selected: </Text>
          <Text color="cyan">{selectedFile}</Text>

          {/* Related tests */}
          {relatedTests.length > 0 ? (
            <Box flexDirection="column" marginTop={1}>
              <Text>Related tests:</Text>
              {relatedTests.map(test => (
                <Text key={test} dimColor>  • {test}</Text>
              ))}
            </Box>
          ) : (
            <Text dimColor>No related tests found</Text>
          )}
        </Box>
      )}

      <Box marginTop={2}>
        <HintText>
          Type to search • Enter run tests • ESC back
        </HintText>
      </Box>
    </Box>
  );
}
```

### Step 3: Add to menu and router

**File:** `packages/cli/src/tui/components/navigation/main-menu.tsx`

Add menu item:

```typescript
{ value: 'test-file', label: 'Test Specific File' },
```

**File:** `packages/cli/src/tui/screens/screen-router.tsx`

Add screen:

```typescript
import { TestScreen } from '../features/testing/test-screen.js';

case 'testFile':
  return <TestScreen projectPath={projectPath} />;
```

### Step 4: Add slash command

**File:** `packages/cli/src/tui/features/chat/commands/registry.ts`

```typescript
{
  name: 'test',
  aliases: ['t'],
  description: 'Run tests for a file',
  usage: '/test [file]',
  handler: async (args, ctx) => {
    if (!args[0]) {
      ctx.navigate('testFile');
      return;
    }

    // Run tests for specified file
    const tests = await findRelatedTests(ctx.projectPath, args[0]);
    if (tests.length === 0) {
      return `No tests found for: ${args[0]}`;
    }

    return `Running tests: ${tests.join(', ')}...`;
  },
},
```

## Acceptance Criteria

- [ ] Can select a file to test
- [ ] Finds related test files automatically
- [ ] Runs tests and shows output
- [ ] Shows pass/fail status with counts
- [ ] Can re-run tests
- [ ] Works with Vitest and Jest
- [ ] `/test` command available in chat

## Test

```bash
cd /Users/voitz/Projects/gemini-hackathon/packages/cli
pnpm exec tsc --noEmit

# Manual test:
# 1. Start CLI
# 2. Select "Test Specific File"
# 3. Select a source file
# 4. Verify related tests are found
# 5. Press Enter to run
# 6. Verify results display
# 7. Press R to re-run
```

## Files Changed

- CREATE: `packages/cli/src/utils/test-runner.ts`
- CREATE: `packages/cli/src/tui/features/testing/test-screen.tsx`
- CREATE: `packages/cli/src/tui/features/testing/index.ts`
- UPDATE: `packages/cli/src/tui/components/navigation/main-menu.tsx`
- UPDATE: `packages/cli/src/tui/screens/screen-router.tsx`
- UPDATE: `packages/cli/src/tui/state/navigation-context.tsx`
- UPDATE: `packages/cli/src/tui/features/chat/commands/registry.ts`
