# Stargazer - Implementation Guide

> **IMPORTANT**: This document contains implementation details. For architecture decisions, see [state-of-the-art-architecture.md](./state-of-the-art-architecture.md).

## Key Architecture Decisions

| Pattern | Implementation |
|---------|----------------|
| **Error Handling** | `Result<T, E>` Tagged Unions (NO exceptions) |
| **Code Style** | 100% Functional (NO classes) |
| **Module Organization** | NO internal barrels - direct imports only |
| **Validation** | Zod 4 with `z.toJSONSchema(schema, { target: 'openapi-3.0' })` |
| **Gemini Integration** | `responseJsonSchema` (NOT `responseSchema`) |

---

## Executive Summary

**Stargazer** is an AI code reviewer with zero-config convention learning, built on Gemini API.

### Dual-Mode Strategy
- **Free (Self-hosted)**: MIT license, BYOK (Bring Your Own Key)
- **Paid (Hosted)**: GitHub App, users pay subscription (post-hackathon)

---

## Quick Reference (TL;DR)

```
stargazer/
├── packages/
│   ├── core/      → @stargazer/core     # Brain: Gemini + conventions + review
│   ├── cli/       → @stargazer/cli      # Terminal tool
│   └── action/    → @stargazer/action   # GitHub Action
└── turbo.json                            # Turborepo caching
```

**Tech Stack:**
- Runtime: Node.js 20+, TypeScript 5.x
- Package Manager: pnpm 9+ (workspaces)
- Build: Turborepo, tsup (bundler)
- AI: Gemini API (`@google/genai`)
- Schema: Zod 4 (`z.toJSONSchema()`)
- GitHub: `@actions/core`, `@actions/github`
- CLI: Commander.js, chalk

**Key Dependencies:**
```json
{
  "@google/genai": "^1.x",
  "zod": "^4.x",
  "@actions/core": "^1.x",
  "@actions/github": "^6.x",
  "commander": "^12.x",
  "chalk": "^5.x"
}
```

---

## 1. Research Findings

### 1.1 Licensing Strategy

| Approach | Pros | Cons | Examples |
|----------|------|------|----------|
| **MIT + Hosted SaaS** | Maximum adoption, simple | No protection from competitors hosting | LangChain, Ollama |
| **AGPL + Commercial** | Forces SaaS competitors to open-source | Scary for enterprises | MongoDB, Grafana |
| **Open Core** | Best of both worlds | Complex to maintain two codebases | GitLab, Neo4j |

**Recommendation**: **MIT for core** + **Hosted SaaS as value-add**
- Core functionality (CLI, GitHub Action, review engine) = MIT
- Hosted service adds: zero-config, team management, analytics = paid

### 1.2 Competitor Analysis

| Tool | Model | Strengths | Weaknesses |
|------|-------|-----------|------------|
| **CodeRabbit** | Cloud SaaS ($12-24/seat) | Multi-platform, AST analysis | Diff-only, no self-host |
| **Qodo/PR-Agent** | Open core (shifting to SaaS) | RAG context, self-host option | Complexity, closing source |
| **Reviewdog** | Pure open-source | Universal linter bridge | No AI, no learning |

**Our Differentiator**: Zero-config convention learning + truly open MIT + optional hosted service

### 1.3 Technical Patterns Discovered

#### Gemini API Best Practices
```typescript
// Structured output with Zod 4 → JSON Schema (OpenAPI 3.0 target)
import * as z from 'zod/v4';  // NOTE: Zod 4 import!

const ReviewSchema = z.object({
  issues: z.array(z.object({
    file: z.string(),
    line: z.number(),
    severity: z.enum(['critical', 'high', 'medium', 'low']),
    message: z.string(),
    suggestion: z.string().optional()
  })),
  summary: z.string()
});

// Convert to JSON Schema for Gemini - MUST use OpenAPI 3.0 target!
z.toJSONSchema(ReviewSchema, { target: 'openapi-3.0' });
```

#### GitHub Actions Toolkit
- Use `@actions/core` for inputs/outputs/logging
- Use `@actions/github` for Octokit integration
- Store secrets with `core.setSecret()`
- Job summaries with `core.summary`

#### pnpm Monorepo Best Practices
- Workspace protocol: `"@stargazer/core": "workspace:*"`
- Shared `tsconfig.base.json`
- Strict peer dependencies
- Turborepo for caching/parallel builds

---

## 2. Proposed Architecture

### 2.1 Package Structure (pnpm Monorepo)

```
stargazer/
├── package.json                     # Root workspace
├── pnpm-workspace.yaml
├── turbo.json                       # Turborepo config
├── tsconfig.base.json               # Shared TS config
│
├── packages/
│   ├── core/                        # @stargazer/core (MIT)
│   │   ├── src/
│   │   │   ├── index.ts             # Public API exports
│   │   │   ├── gemini/
│   │   │   │   ├── client.ts        # Gemini API wrapper
│   │   │   │   └── schemas.ts       # Zod schemas → JSON Schema
│   │   │   ├── conventions/
│   │   │   │   ├── discovery.ts     # THE DIFFERENTIATOR
│   │   │   │   ├── cache.ts         # Load/save conventions
│   │   │   │   └── types.ts
│   │   │   ├── context/
│   │   │   │   ├── selector.ts      # Smart file selection
│   │   │   │   └── git.ts           # Git operations
│   │   │   └── review/
│   │   │       ├── engine.ts        # Review orchestration
│   │   │       └── filter.ts        # Noise reduction
│   │   └── package.json
│   │
│   ├── cli/                         # @stargazer/cli (MIT)
│   │   ├── bin/stargazer.ts
│   │   ├── src/
│   │   │   ├── commands/
│   │   │   │   ├── review.ts
│   │   │   │   └── discover.ts
│   │   │   └── output.ts            # Terminal formatting
│   │   └── package.json
│   │
│   └── action/                      # @stargazer/action (MIT)
│       ├── action.yml
│       ├── src/
│       │   ├── index.ts
│       │   ├── github.ts            # GitHub API (post reviews)
│       │   └── trigger.ts           # /review comment trigger
│       └── package.json
│
├── apps/
│   └── web/                         # Hosted App (NOT in hackathon)
│       └── ...                      # Next.js + GitHub App
│
└── docs/
    ├── README.md
    ├── quick-start.md
    └── self-hosting.md
```

### 2.2 Core API Design

```typescript
// packages/core/src/index.ts

export interface StargazerConfig {
  geminiApiKey: string;
  model?: 'flash' | 'pro';
  minSeverity?: 'critical' | 'high' | 'medium' | 'low';
  maxComments?: number;
  conventionsPath?: string;
}

export interface ReviewResult {
  summary: string;
  decision: 'approve' | 'request_changes' | 'comment';
  issues: Issue[];
}

export interface Issue {
  file: string;
  line: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'bug' | 'security' | 'convention' | 'performance';
  message: string;
  suggestion?: string;
  conventionRef?: string;  // "Based on src/utils/errors.ts:15"
}

// Main API
export async function review(options: {
  diff: string;
  context: FileContext[];
  conventions?: ProjectConventions;
  config: StargazerConfig;
}): Promise<ReviewResult>;

export async function discoverConventions(options: {
  files: FileContext[];
  config: StargazerConfig;
}): Promise<ProjectConventions>;

export function loadConventions(path: string): Promise<ProjectConventions | null>;
export function saveConventions(conventions: ProjectConventions, path: string): Promise<void>;
```

### 2.3 Schema Definitions (Zod 4)

```typescript
// packages/core/src/review/schemas.ts
// NOTE: NO index.ts in review/ folder - direct imports only!

import * as z from 'zod/v4';  // Zod 4 import!

export const IssueSchema = z.object({
  id: z.string().describe('Unique identifier'),
  file: z.string().describe('Path to the file'),
  line: z.int().positive().describe('Line number'),  // z.int() in Zod 4
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  category: z.enum(['bug', 'security', 'convention', 'performance']),
  message: z.string().describe('Description of the issue'),
  suggestion: z.string().optional().describe('Suggested fix'),
  conventionRef: z.string().optional().describe('Reference to convention file:line'),
  confidence: z.number().min(0).max(1).describe('Confidence 0-1')
}).describe('A single code review issue');

export const ReviewResultSchema = z.object({
  summary: z.string().describe('2-3 sentence summary'),
  decision: z.enum(['approve', 'request_changes', 'comment']),
  issues: z.array(IssueSchema)
}).describe('Complete review result');

// For Gemini API - MUST use OpenAPI 3.0 target!
export const IssueJSONSchema = z.toJSONSchema(IssueSchema, { target: 'openapi-3.0' });
export const ReviewResultJSONSchema = z.toJSONSchema(ReviewResultSchema, { target: 'openapi-3.0' });
```

```typescript
// packages/core/src/conventions/schemas.ts
// NOTE: NO index.ts in conventions/ folder - direct imports only!

import * as z from 'zod/v4';

export const CodeExampleSchema = z.object({
  file: z.string(),
  line: z.int().positive(),
  snippet: z.string()
});

export const ConventionPatternSchema = z.object({
  name: z.string(),
  style: z.string(),
  examples: z.array(CodeExampleSchema)
});

export const ProjectConventionsSchema = z.object({
  version: z.literal('1.0'),
  discoveredAt: z.string().datetime(),
  patterns: z.object({
    errorHandling: ConventionPatternSchema.optional(),
    naming: ConventionPatternSchema.optional(),
    testing: ConventionPatternSchema.optional(),
    imports: ConventionPatternSchema.optional()
  }),
  summary: z.string()
});

export const ProjectConventionsJSONSchema = z.toJSONSchema(ProjectConventionsSchema, { target: 'openapi-3.0' });
```

### 2.4 Gemini Integration (Functional Pattern)

```typescript
// packages/core/src/gemini/client.ts

import { GoogleGenAI, ApiError } from '@google/genai';
import * as z from 'zod/v4';
import { ok, err } from '../shared/result';        // direct import!
import type { Result } from '../shared/result';
import type { GeminiClient, GenerateOptions } from './types';  // direct import!

// Factory function - NO class!
export function createGeminiClient(
  apiKey: string,
  defaultModel = 'gemini-2.0-flash'
): GeminiClient {
  const client = new GoogleGenAI({ apiKey });

  return {
    async generate<T extends z.ZodType>(
      prompt: string,
      schema: T,
      options?: GenerateOptions
    ): Promise<Result<z.infer<T>>> {
      const modelId = options?.model ?? defaultModel;

      try {
        const response = await client.models.generateContent({
          model: modelId,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            // MUST use responseJsonSchema with OpenAPI 3.0 target!
            responseJsonSchema: z.toJSONSchema(schema, { target: 'openapi-3.0' }),
            temperature: options?.temperature ?? 0.2
          }
        });

        const parsed = schema.safeParse(JSON.parse(response.text ?? ''));
        if (!parsed.success) {
          return err({ code: 'SCHEMA_VALIDATION', message: parsed.error.message });
        }
        return ok(parsed.data);
      } catch (e) {
        if (e instanceof ApiError && e.status === 429) {
          return err({ code: 'RATE_LIMITED', message: e.message, cause: e });
        }
        return err({ code: 'API_ERROR', message: String(e), cause: e });
      }
    },

    async countTokens(content: string): Promise<number> {
      const response = await client.models.countTokens({
        model: defaultModel,
        contents: content
      });
      return response.totalTokens ?? 0;
    }
  };
}
```

---

## 3. Extension/Plugin Architecture (Post-Hackathon)

### 3.1 Hook System for Customization

```typescript
// packages/core/src/hooks.ts

export interface StargazerHooks {
  // Before review
  beforeReview?: (context: ReviewContext) => Promise<ReviewContext>;

  // Filter/modify issues
  filterIssues?: (issues: Issue[]) => Promise<Issue[]>;

  // Custom convention patterns
  customPatterns?: ConventionPattern[];

  // After review
  afterReview?: (result: ReviewResult) => Promise<ReviewResult>;
}

// Usage in core
export async function review(
  options: ReviewOptions,
  hooks?: StargazerHooks
): Promise<ReviewResult> {
  let context = options.context;

  if (hooks?.beforeReview) {
    context = await hooks.beforeReview(context);
  }

  // ... review logic ...

  if (hooks?.filterIssues) {
    result.issues = await hooks.filterIssues(result.issues);
  }

  return result;
}
```

### 3.2 Configuration File (.stargazer/config.ts)

```typescript
// .stargazer/config.ts (in user's project)

import { defineConfig } from '@stargazer/core';

export default defineConfig({
  // Model selection
  model: 'flash',

  // Noise control
  minSeverity: 'high',
  maxComments: 10,

  // Custom patterns to check
  customPatterns: [
    {
      name: 'no-console',
      prompt: 'Check for console.log statements',
      severity: 'low'
    }
  ],

  // Files to ignore
  ignore: ['**/generated/**', '**/*.test.ts'],

  // Custom hooks
  hooks: {
    filterIssues: async (issues) => {
      return issues.filter(i => !i.file.includes('legacy/'));
    }
  }
});
```

### 3.3 User Project Structure

```
my-project/
├── .stargazer/                      # Stargazer folder
│   ├── conventions.json             # Discovered conventions (auto-generated)
│   └── config.ts                    # Optional user config
├── src/
│   └── ...
└── package.json
```

---

## 4. Hosted App Architecture (Post-Hackathon)

### 4.1 GitHub App vs GitHub Action

| Aspect | GitHub Action | GitHub App |
|--------|---------------|------------|
| **Setup** | User creates workflow file | One-click install |
| **API Key** | User provides | We manage |
| **Billing** | User pays Gemini directly | We charge subscription |
| **Rate Limits** | User's limits | Our pooled limits |
| **Webhooks** | Per-workflow | Centralized |

**Recommendation**: GitHub Action for hackathon, GitHub App for hosted service.

### 4.2 Hosted Service Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                       stargazer.dev                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Next.js App                GitHub App                          │
│   ───────────                ──────────                          │
│   - Landing page             - Webhook receiver                  │
│   - Dashboard                - PR review trigger                 │
│   - Team management          - Comment posting                   │
│                                                                  │
│         │                           │                            │
│         └───────────────────────────┤                            │
│                                     ▼                            │
│                          ┌──────────────────┐                    │
│                          │   BullMQ Queue   │                    │
│                          └──────────────────┘                    │
│                                     │                            │
│                                     ▼                            │
│                          ┌──────────────────┐                    │
│                          │  @stargazer/core │                    │
│                          │   (same code!)   │                    │
│                          └──────────────────┘                    │
│                                     │                            │
│                                     ▼                            │
│                          ┌──────────────────┐                    │
│                          │   Gemini API     │                    │
│                          └──────────────────┘                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Tech Stack:
- Next.js 15 (App Router)
- PostgreSQL (users, repos, usage)
- Redis + BullMQ (job queue)
- Hetzner VPS + Coolify (~€10/month)
```

### 4.3 Pricing Model Options

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | 50 PRs/month, public repos only |
| **Pro** | $12/user/month | Unlimited PRs, private repos, priority |
| **Team** | $20/user/month | + Team analytics, custom rules, SSO |

---

## 5. Implementation Phases

### Phase 1: Hackathon MVP (Weeks 1-2)
- [ ] pnpm monorepo setup + Turborepo
- [ ] @stargazer/core: Gemini client + Zod schemas
- [ ] @stargazer/core: Convention discovery
- [ ] @stargazer/core: Review engine + noise filtering
- [ ] @stargazer/cli: `stargazer review`, `stargazer discover`
- [ ] @stargazer/action: Basic PR review
- [ ] @stargazer/action: `/review` comment trigger
- [ ] README + demo video

### Phase 2: Polish (Week 3)
- [ ] Testing on real repos (React, Python, Go)
- [ ] Error handling + edge cases
- [ ] Documentation
- [ ] GitHub Marketplace submission

### Phase 3: Hosted App (Post-Hackathon)
- [ ] GitHub App setup
- [ ] Next.js dashboard
- [ ] BullMQ job queue
- [ ] Stripe billing integration
- [ ] Team management

### Phase 4: Growth (Future)
- [ ] Multi-model support (Claude, GPT-4)
- [ ] Plugin marketplace
- [ ] IDE extensions (VS Code, JetBrains)
- [ ] Self-hosted enterprise edition

---

## 6. Decisions Made ✅

| Question | Decision | Rationale |
|----------|----------|-----------|
| **License** | MIT | Maximum adoption, like LangChain. We win on quality, not restrictions. |
| **Convention cache** | `.stargazer/conventions.json` | Clean root, space for future config files |
| **Hackathon focus** | CLI + Action only | Hosted app = post-hackathon |
| **Monetization** | TBD (post-hackathon) | Per-seat or usage-based, to be decided later |
| **Languages** | TypeScript/JavaScript first | Best for demo, expand later |

---

## 7. Detailed Implementation Code

### 7.0 packages/core/src/shared/result.ts (Foundation!)

```typescript
// packages/core/src/shared/result.ts
// NOTE: NO index.ts in shared/ folder - direct imports only!

// ============================================
// Result Type - Functional Error Handling
// ============================================

export type Result<T, E = ApiError> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: E };

// Simple error type - no branded names
export type ApiError = {
  readonly code: ErrorCode;
  readonly message: string;
  readonly cause?: unknown;
};

export type ErrorCode =
  | 'API_ERROR'           // Gemini API call failed
  | 'SCHEMA_VALIDATION'   // Zod validation failed
  | 'CONFIG_INVALID'      // Invalid configuration
  | 'GIT_ERROR'           // Git operation failed
  | 'RATE_LIMITED'        // API rate limit hit (429)
  | 'UNAUTHORIZED'        // API key invalid (401)
  | 'BAD_REQUEST'         // Malformed request (400)
  | 'EMPTY_RESPONSE'      // API returned empty response
  | 'TIMEOUT'             // Request timed out
  | 'FILE_NOT_FOUND';     // File doesn't exist

// ============================================
// Helper Functions
// ============================================

export const ok = <T>(data: T): Result<T, never> => ({ ok: true, data });

export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

export const isOk = <T, E>(result: Result<T, E>): result is { ok: true; data: T } =>
  result.ok;

export const isErr = <T, E>(result: Result<T, E>): result is { ok: false; error: E } =>
  !result.ok;

// ============================================
// Utility: Create error with code
// ============================================

export const createError = (
  code: ErrorCode,
  message: string,
  cause?: unknown
): ApiError => ({ code, message, cause });
```

### 7.1 packages/core/src/gemini/client.ts (Functional)

```typescript
// NO index.ts in gemini/ folder!
import { GoogleGenAI, ApiError } from '@google/genai';
import * as z from 'zod/v4';
import { ok, err } from '../shared/result';       // direct import!
import type { Result } from '../shared/result';
import type { GeminiClient, GenerateOptions, Model } from './types';
import { getModelId } from './models';

// Factory function - NO class!
export function createGeminiClient(
  apiKey: string,
  defaultModel: Model = 'gemini-2.0-flash'
): GeminiClient {
  const client = new GoogleGenAI({ apiKey });

  return {
    async generate<T extends z.ZodType>(
      prompt: string,
      schema: T,
      options?: GenerateOptions
    ): Promise<Result<z.infer<T>>> {
      const modelId = getModelId(options?.model ?? defaultModel);

      try {
        const response = await client.models.generateContent({
          model: modelId,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            // CRITICAL: Use responseJsonSchema with OpenAPI 3.0 target
            responseJsonSchema: z.toJSONSchema(schema, { target: 'openapi-3.0' }),
            temperature: options?.temperature ?? 0.2,
            maxOutputTokens: options?.maxTokens,
          },
        });

        const text = response.text;
        if (!text) {
          return err({ code: 'API_ERROR', message: 'Empty response from Gemini API' });
        }

        // Parse and validate with Zod
        const parsed = schema.safeParse(JSON.parse(text));
        if (!parsed.success) {
          return err({ code: 'SCHEMA_VALIDATION', message: parsed.error.message });
        }
        return ok(parsed.data);
      } catch (e) {
        // Handle rate limiting explicitly
        if (e instanceof ApiError && e.status === 429) {
          return err({ code: 'RATE_LIMITED', message: e.message, cause: e });
        }
        return err({ code: 'API_ERROR', message: String(e), cause: e });
      }
    },

    async generateText(
      prompt: string,
      options?: GenerateOptions
    ): Promise<Result<string>> {
      const modelId = getModelId(options?.model ?? defaultModel);

      try {
        const response = await client.models.generateContent({
          model: modelId,
          contents: prompt,
          config: {
            temperature: options?.temperature ?? 0.7,
          },
        });
        return ok(response.text ?? '');
      } catch (e) {
        return err({ code: 'API_ERROR', message: String(e), cause: e });
      }
    },

    async countTokens(content: string): Promise<number> {
      const response = await client.models.countTokens({
        model: getModelId(defaultModel),
        contents: content,
      });
      return response.totalTokens ?? 0;
    },
  };
}
```

### 7.2 packages/core/src/review/schemas.ts (Zod 4)

```typescript
// packages/core/src/review/schemas.ts
// NOTE: NO index.ts in review/ folder - direct imports only!

import * as z from 'zod/v4';  // Zod 4 import!

// ============================================
// Issue Schema
// ============================================

export const IssueSeveritySchema = z.enum(['critical', 'high', 'medium', 'low']);
export const IssueCategorySchema = z.enum(['bug', 'security', 'convention', 'performance']);

export const IssueSchema = z.object({
  id: z.string().describe('Unique identifier'),
  file: z.string().describe('Relative path to the file'),
  line: z.int().positive().describe('Line number in the file'),  // z.int() in Zod 4
  endLine: z.int().positive().optional().describe('End line for multi-line issues'),
  severity: IssueSeveritySchema.describe('How critical is this issue'),
  category: IssueCategorySchema.describe('Type of issue'),
  message: z.string().describe('Clear description of the issue'),
  suggestion: z.string().optional().describe('Suggested code fix'),
  conventionRef: z.string().optional().describe("Reference to convention, e.g. 'src/utils/errors.ts:15'"),
  confidence: z.number().min(0).max(1).describe('Confidence score 0-1'),
}).describe('A single code review issue');

export type Issue = z.infer<typeof IssueSchema>;
export type IssueSeverity = z.infer<typeof IssueSeveritySchema>;
export type IssueCategory = z.infer<typeof IssueCategorySchema>;

// ============================================
// Review Result Schema
// ============================================

export const ReviewDecisionSchema = z.enum(['approve', 'request_changes', 'comment']);

export const ReviewResultSchema = z.object({
  summary: z.string().describe('2-3 sentence summary of the PR'),
  decision: ReviewDecisionSchema.describe('Overall review decision'),
  issues: z.array(IssueSchema).describe('List of issues found'),
  positives: z.array(z.string()).optional().describe('Positive aspects of the code'),
}).describe('Complete PR review result');

export type ReviewResult = z.infer<typeof ReviewResultSchema>;
export type ReviewDecision = z.infer<typeof ReviewDecisionSchema>;

// ============================================
// JSON Schemas for Gemini API
// MUST use OpenAPI 3.0 target!
// ============================================

export const IssueJSONSchema = z.toJSONSchema(IssueSchema, { target: 'openapi-3.0' });
export const ReviewResultJSONSchema = z.toJSONSchema(ReviewResultSchema, { target: 'openapi-3.0' });
```

```typescript
// packages/core/src/conventions/schemas.ts
// NOTE: NO index.ts in conventions/ folder - direct imports only!

import * as z from 'zod/v4';

export const CodeExampleSchema = z.object({
  file: z.string().describe('File path'),
  line: z.int().positive().describe('Line number'),
  snippet: z.string().describe('Code snippet showing the pattern'),
  explanation: z.string().optional().describe('Why this is the convention'),
});

export const ConventionPatternSchema = z.object({
  name: z.string().describe('Pattern name'),
  style: z.string().describe('Description of the style'),
  examples: z.array(CodeExampleSchema).describe('Code examples'),
});

export const ProjectConventionsSchema = z.object({
  version: z.literal('1.0'),
  discoveredAt: z.string().datetime(),
  language: z.string().describe('Primary language: typescript, javascript, etc.'),
  patterns: z.object({
    errorHandling: ConventionPatternSchema.optional(),
    naming: ConventionPatternSchema.optional(),
    testing: ConventionPatternSchema.optional(),
    imports: ConventionPatternSchema.optional(),
  }),
  summary: z.string().describe('Human-readable summary of all conventions'),
}).describe('Project coding conventions');

export type ProjectConventions = z.infer<typeof ProjectConventionsSchema>;

// JSON Schema for Gemini - MUST use OpenAPI 3.0 target!
export const ProjectConventionsJSONSchema = z.toJSONSchema(ProjectConventionsSchema, { target: 'openapi-3.0' });
```

### 7.3 packages/core/src/conventions/discovery.ts

```typescript
import { GeminiClient } from "../gemini/client";
import {
  ProjectConventionsSchema,
  ProjectConventions,
} from "../gemini/schemas";
import { FileContext } from "../types";

export interface DiscoveryOptions {
  files: FileContext[];
  geminiClient: GeminiClient;
  maxSampleFiles?: number;
}

const DISCOVERY_PROMPT = `
You are analyzing a codebase to discover its coding conventions and patterns.

## Instructions

Analyze the provided code samples and extract the project's conventions for:

1. **Error Handling**: How are errors handled? try-catch, Result types, callbacks?
   - Is there a custom error class?
   - Are errors logged, rethrown, or wrapped?

2. **Naming Conventions**:
   - Variable naming (camelCase, snake_case, etc.)
   - Function naming
   - File naming
   - Constants naming

3. **Testing Patterns**:
   - What test framework is used?
   - Are tests colocated or in separate directories?
   - What's the test file naming convention?
   - describe/it blocks vs test() functions?

4. **Import Organization**:
   - Named imports vs default imports?
   - Are imports alphabetically ordered?
   - How are imports grouped (builtin, external, internal)?

For each pattern, provide:
- A clear description of the convention
- 2-3 specific code examples with file paths and line numbers
- Confidence level based on consistency across files

Be specific and reference actual files. If a pattern is inconsistent or unclear, note that.

## Code Samples

`;

export async function discoverConventions(
  options: DiscoveryOptions
): Promise<ProjectConventions> {
  const { files, geminiClient, maxSampleFiles = 20 } = options;

  // Select representative sample files
  const sampleFiles = selectRepresentativeFiles(files, maxSampleFiles);

  // Build the prompt with code samples
  const codeContext = sampleFiles
    .map(
      (f) => `### ${f.path}
\`\`\`${getLanguageFromPath(f.path)}
${f.content}
\`\`\``
    )
    .join("\n\n");

  const fullPrompt = DISCOVERY_PROMPT + codeContext;

  // Use Pro model for discovery (more accurate, one-time cost)
  const result = await geminiClient.generate(
    fullPrompt,
    ProjectConventionsSchema,
    { model: "pro", temperature: 0.1 }
  );

  // Add metadata
  return {
    ...result,
    version: "1.0",
    discoveredAt: new Date().toISOString(),
  };
}

function selectRepresentativeFiles(
  files: FileContext[],
  maxFiles: number
): FileContext[] {
  // Strategy: Select diverse files across different directories and types
  const byDirectory = new Map<string, FileContext[]>();

  for (const file of files) {
    const dir = file.path.split("/").slice(0, -1).join("/");
    if (!byDirectory.has(dir)) {
      byDirectory.set(dir, []);
    }
    byDirectory.get(dir)!.push(file);
  }

  const selected: FileContext[] = [];

  // Take up to 2 files from each directory
  for (const [_, dirFiles] of byDirectory) {
    // Prioritize: main files, index files, then others
    const sorted = dirFiles.sort((a, b) => {
      const aScore = getFileImportance(a.path);
      const bScore = getFileImportance(b.path);
      return bScore - aScore;
    });

    selected.push(...sorted.slice(0, 2));

    if (selected.length >= maxFiles) break;
  }

  return selected.slice(0, maxFiles);
}

function getFileImportance(path: string): number {
  if (path.includes("index.")) return 10;
  if (path.includes("main.")) return 9;
  if (path.includes("app.")) return 8;
  if (path.includes(".test.") || path.includes(".spec.")) return 7;
  if (path.includes("utils/") || path.includes("helpers/")) return 6;
  return 5;
}

function getLanguageFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    py: "python",
    go: "go",
    rs: "rust",
    rb: "ruby",
  };
  return langMap[ext ?? ""] ?? "";
}
```

### 7.4 packages/core/src/review/engine.ts

```typescript
import { GeminiClient } from "../gemini/client";
import {
  ReviewResult,
  ReviewResultSchema,
  ProjectConventions,
  Issue,
} from "../gemini/schemas";
import { FileContext, DiffHunk } from "../types";

export interface ReviewOptions {
  diff: string;
  changedFiles: FileContext[];
  contextFiles: FileContext[];
  conventions?: ProjectConventions;
  geminiClient: GeminiClient;
  config: ReviewConfig;
}

export interface ReviewConfig {
  minSeverity: "critical" | "high" | "medium" | "low";
  maxComments: number;
  categories: ("bug" | "security" | "convention" | "performance")[];
  model?: "flash" | "pro";
}

const REVIEW_PROMPT_TEMPLATE = `
You are an expert code reviewer. Review this pull request carefully.

## Your Task

1. **Find real issues** - bugs, security problems, performance issues
2. **Check conventions** - does the code follow the project's established patterns?
3. **Be specific** - reference exact lines and provide concrete suggestions
4. **Prioritize** - critical bugs > security > convention violations > style

## IMPORTANT Guidelines

- Only flag issues you are CONFIDENT about (confidence > 0.8)
- When flagging convention violations, reference the specific file:line that shows the correct pattern
- Provide actionable suggestions, not vague advice
- Don't flag issues in generated code, tests, or config files unless critical
- Focus on the diff - don't review unchanged code

{{CONVENTIONS_SECTION}}

## Context Files (for reference, don't review these)

{{CONTEXT_FILES}}

## Files Changed (REVIEW THESE)

{{CHANGED_FILES}}

## Diff to Review

{{DIFF}}

Review the changes and return your analysis.
`;

export async function reviewPullRequest(
  options: ReviewOptions
): Promise<ReviewResult> {
  const { diff, changedFiles, contextFiles, conventions, geminiClient, config } =
    options;

  // Build the prompt
  const prompt = buildReviewPrompt({
    diff,
    changedFiles,
    contextFiles,
    conventions,
  });

  // Call Gemini
  const rawResult = await geminiClient.generate(
    prompt,
    ReviewResultSchema,
    {
      model: config.model ?? "flash",
      temperature: 0.2,
    }
  );

  // Filter and process issues
  const filteredIssues = filterIssues(rawResult.issues, config);

  return {
    ...rawResult,
    issues: filteredIssues,
  };
}

function buildReviewPrompt(options: {
  diff: string;
  changedFiles: FileContext[];
  contextFiles: FileContext[];
  conventions?: ProjectConventions;
}): string {
  const { diff, changedFiles, contextFiles, conventions } = options;

  let prompt = REVIEW_PROMPT_TEMPLATE;

  // Add conventions section if available
  if (conventions) {
    const conventionsSection = `
## Project Conventions

${conventions.summary}

### Specific Patterns
${JSON.stringify(conventions.patterns, null, 2)}
`;
    prompt = prompt.replace("{{CONVENTIONS_SECTION}}", conventionsSection);
  } else {
    prompt = prompt.replace("{{CONVENTIONS_SECTION}}", "");
  }

  // Add context files
  const contextSection = contextFiles
    .map((f) => `### ${f.path}\n\`\`\`\n${f.content}\n\`\`\``)
    .join("\n\n");
  prompt = prompt.replace("{{CONTEXT_FILES}}", contextSection);

  // Add changed files
  const changedSection = changedFiles
    .map((f) => `### ${f.path}\n\`\`\`\n${f.content}\n\`\`\``)
    .join("\n\n");
  prompt = prompt.replace("{{CHANGED_FILES}}", changedSection);

  // Add diff
  prompt = prompt.replace("{{DIFF}}", diff);

  return prompt;
}

function filterIssues(issues: Issue[], config: ReviewConfig): Issue[] {
  const severityOrder = ["critical", "high", "medium", "low"];
  const minIndex = severityOrder.indexOf(config.minSeverity);

  return issues
    // Filter by severity
    .filter((issue) => {
      const issueIndex = severityOrder.indexOf(issue.severity);
      return issueIndex <= minIndex;
    })
    // Filter by category
    .filter((issue) => config.categories.includes(issue.category))
    // Filter by confidence
    .filter((issue) => issue.confidence >= 0.8)
    // Sort by severity (critical first)
    .sort((a, b) => {
      return severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity);
    })
    // Limit to max comments
    .slice(0, config.maxComments);
}
```

### 7.5 packages/core/src/context/selector.ts

```typescript
import { FileContext } from "../types";
import * as path from "path";

export interface ContextSelectionOptions {
  changedFiles: string[];
  allFiles: FileContext[];
  maxContextFiles?: number;
  maxTokens?: number;
}

export interface SelectedContext {
  changedFiles: FileContext[];
  relatedFiles: FileContext[];
  testFiles: FileContext[];
  conventionSamples: FileContext[];
}

const APPROX_TOKENS_PER_CHAR = 0.25;

export async function selectContext(
  options: ContextSelectionOptions
): Promise<SelectedContext> {
  const { changedFiles, allFiles, maxContextFiles = 20, maxTokens = 100000 } =
    options;

  const fileMap = new Map(allFiles.map((f) => [f.path, f]));

  // 1. Get changed files (always include)
  const changed = changedFiles
    .map((p) => fileMap.get(p))
    .filter((f): f is FileContext => f !== undefined);

  // 2. Find related files (imports/exports)
  const related = findRelatedFiles(changed, fileMap);

  // 3. Find test files
  const tests = findTestFiles(changedFiles, fileMap);

  // 4. Find convention samples
  const samples = findConventionSamples(allFiles);

  // Combine and respect token limits
  const allContext = [...changed, ...related, ...tests, ...samples];
  const deduplicated = deduplicateFiles(allContext);
  const trimmed = trimToTokenLimit(deduplicated, maxTokens);

  return {
    changedFiles: changed,
    relatedFiles: related.slice(0, 5),
    testFiles: tests.slice(0, 3),
    conventionSamples: samples.slice(0, 5),
  };
}

function findRelatedFiles(
  changedFiles: FileContext[],
  fileMap: Map<string, FileContext>
): FileContext[] {
  const related: FileContext[] = [];

  for (const file of changedFiles) {
    // Extract imports using regex (no AST parsing needed)
    const imports = extractImports(file.content);

    for (const importPath of imports) {
      // Resolve relative imports
      const resolvedPath = resolveImportPath(file.path, importPath);

      // Try to find the file (with various extensions)
      const extensions = ["", ".ts", ".tsx", ".js", ".jsx", "/index.ts", "/index.js"];
      for (const ext of extensions) {
        const fullPath = resolvedPath + ext;
        const found = fileMap.get(fullPath);
        if (found) {
          related.push(found);
          break;
        }
      }
    }

    // Also add sibling files (same directory)
    const dir = path.dirname(file.path);
    for (const [filePath, fileContext] of fileMap) {
      if (
        path.dirname(filePath) === dir &&
        filePath !== file.path &&
        !related.includes(fileContext)
      ) {
        related.push(fileContext);
      }
    }
  }

  return related;
}

function extractImports(content: string): string[] {
  const imports: string[] = [];

  // ES6 imports: import ... from './path'
  const es6Regex = /from\s+['"](\.[^'"]+)['"]/g;
  let match;
  while ((match = es6Regex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  // CommonJS: require('./path')
  const cjsRegex = /require\s*\(\s*['"](\.[^'"]+)['"]\s*\)/g;
  while ((match = cjsRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

function resolveImportPath(fromFile: string, importPath: string): string {
  const fromDir = path.dirname(fromFile);
  return path.join(fromDir, importPath);
}

function findTestFiles(
  changedFiles: string[],
  fileMap: Map<string, FileContext>
): FileContext[] {
  const tests: FileContext[] = [];

  for (const filePath of changedFiles) {
    // Common test file patterns
    const patterns = [
      filePath.replace(/\.([tj]sx?)$/, ".test.$1"),
      filePath.replace(/\.([tj]sx?)$/, ".spec.$1"),
      filePath.replace(/src\//, "__tests__/").replace(/\.([tj]sx?)$/, ".test.$1"),
      filePath.replace(/src\//, "tests/").replace(/\.([tj]sx?)$/, ".test.$1"),
    ];

    for (const pattern of patterns) {
      const testFile = fileMap.get(pattern);
      if (testFile) {
        tests.push(testFile);
        break;
      }
    }
  }

  return tests;
}

function findConventionSamples(allFiles: FileContext[]): FileContext[] {
  // Select files that are likely to show conventions
  const samples: FileContext[] = [];
  const categories = new Set<string>();

  for (const file of allFiles) {
    const category = categorizeFile(file.path);
    if (!categories.has(category) && samples.length < 10) {
      categories.add(category);
      samples.push(file);
    }
  }

  return samples;
}

function categorizeFile(filePath: string): string {
  if (filePath.includes("utils/") || filePath.includes("helpers/")) return "utils";
  if (filePath.includes("components/")) return "components";
  if (filePath.includes("hooks/")) return "hooks";
  if (filePath.includes("services/")) return "services";
  if (filePath.includes("api/")) return "api";
  if (filePath.includes("test") || filePath.includes("spec")) return "test";
  if (filePath.includes("types/")) return "types";
  return "other";
}

function deduplicateFiles(files: FileContext[]): FileContext[] {
  const seen = new Set<string>();
  return files.filter((f) => {
    if (seen.has(f.path)) return false;
    seen.add(f.path);
    return true;
  });
}

function trimToTokenLimit(
  files: FileContext[],
  maxTokens: number
): FileContext[] {
  let totalTokens = 0;
  const result: FileContext[] = [];

  for (const file of files) {
    const fileTokens = Math.ceil(file.content.length * APPROX_TOKENS_PER_CHAR);
    if (totalTokens + fileTokens > maxTokens) break;
    totalTokens += fileTokens;
    result.push(file);
  }

  return result;
}
```

### 7.6 packages/core/src/index.ts (Public API - ONLY BARREL!)

```typescript
// ============================================
// @stargazer/core - ONLY PUBLIC BARREL
// Direct imports from specific files (NO internal barrels!)
// ============================================

// Result type (functional error handling)
export { ok, err, isOk, isErr } from './shared/result';          // direct!
export type { Result, ApiError, ErrorCode } from './shared/result';

// Review types & functions
export type { ReviewResult, Issue, IssueSeverity, IssueCategory, ReviewContext } from './review/types';
export { IssueSchema, ReviewResultSchema } from './review/schemas';     // direct!
export { createReviewEngine } from './review/engine';                   // direct!
export { filterIssues, sortBySeverity } from './review/filter';         // direct!

// Convention types & functions
export type { ProjectConventions } from './conventions/types';
export { ProjectConventionsSchema } from './conventions/schemas';       // direct!
export { discoverConventions } from './conventions/discovery';          // direct!
export { loadConventions, saveConventions } from './conventions/cache'; // direct!

// Context types & functions
export type { FileContext, SelectedContext } from './context/types';
export { selectContext } from './context/selector';                     // direct!
export { getDiff, getChangedFiles } from './context/git';               // direct!

// Plugin types (Vite-style)
export type { StargazerPlugin, PluginFactory } from './plugins/types';
export { runHooks } from './plugins/hooks';                             // direct!

// Config types & functions
export type { StargazerConfig, ResolvedConfig } from './config/types';
export { defineConfig } from './config/define';                         // direct!
export { resolveConfig } from './config/resolve';                       // direct!
export { loadConfig } from './config/loader';                           // direct!
export { DEFAULT_CONFIG } from './config/defaults';                     // direct!

// Gemini client (for advanced usage)
export { createGeminiClient } from './gemini/client';                   // direct!
export type { GeminiClient, GenerateOptions, Model } from './gemini/types';

// Main facade
export { createStargazer } from './stargazer';                          // direct!
export type { Stargazer, StargazerOptions } from './stargazer';
```

### 7.6b packages/core/src/stargazer.ts (Main Facade - Functional!)

```typescript
// packages/core/src/stargazer.ts
// Factory function - NO class!

import { createGeminiClient } from './gemini/client';            // direct!
import type { GeminiClient } from './gemini/types';
import { createReviewEngine } from './review/engine';            // direct!
import type { ReviewResult, ReviewContext } from './review/types';
import { discoverConventions } from './conventions/discovery';   // direct!
import type { ProjectConventions } from './conventions/types';
import { resolveConfig } from './config/resolve';                // direct!
import type { StargazerConfig, ResolvedConfig } from './config/types';
import type { FileContext } from './context/types';              // direct!
import { ok } from './shared/result';                            // direct!
import type { Result } from './shared/result';

// Types
export interface StargazerOptions {
  readonly config?: StargazerConfig;
}

export interface Stargazer {
  readonly review: (context: ReviewContext) => Promise<Result<ReviewResult>>;
  readonly discover: (files: FileContext[]) => Promise<Result<ProjectConventions>>;
  readonly getConfig: () => ResolvedConfig;
  readonly getGeminiClient: () => GeminiClient;
}

// Factory function - returns Result<Stargazer>
export async function createStargazer(
  options: StargazerOptions = {}
): Promise<Result<Stargazer>> {
  // 1. Resolve config (may fail if no API key)
  const configResult = resolveConfig(options.config ?? null);
  if (!configResult.ok) return configResult;
  const config = configResult.data;

  // 2. Create Gemini client (lazy initialization)
  let geminiClient: GeminiClient | null = null;
  const getGeminiClient = (): GeminiClient => {
    if (!geminiClient) {
      geminiClient = createGeminiClient(config.apiKey, config.model);
    }
    return geminiClient;
  };

  // 3. Create review engine
  const reviewEngine = createReviewEngine(
    getGeminiClient(),
    config,
    config.plugins
  );

  // 4. Return public interface
  return ok({
    review: (ctx) => reviewEngine.review(ctx),
    discover: (files) => discoverConventions(getGeminiClient(), files, config.plugins),
    getConfig: () => config,
    getGeminiClient,
  });
}
```

### 7.7 packages/cli/src/commands/review.ts

```typescript
import { Command } from "commander";
import chalk from "chalk";
import { Stargazer, FileContext, loadConventions } from "@stargazer/core";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

export const reviewCommand = new Command("review")
  .description("Review local changes")
  .option("--staged", "Only review staged changes")
  .option("--base <branch>", "Compare against branch", "main")
  .option("--format <format>", "Output format: terminal, json, markdown", "terminal")
  .option("--model <model>", "Model to use: flash, pro", "flash")
  .option("--min-severity <severity>", "Minimum severity: critical, high, medium, low", "high")
  .action(async (options) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error(chalk.red("Error: GEMINI_API_KEY environment variable not set"));
      process.exit(1);
    }

    console.log(chalk.blue("🔭 Stargazer Code Review\n"));

    try {
      // Get diff
      const diff = getDiff(options.staged, options.base);
      if (!diff.trim()) {
        console.log(chalk.yellow("No changes to review"));
        return;
      }

      // Get changed files
      const changedFilePaths = getChangedFiles(options.staged, options.base);
      const changedFiles = await readFiles(changedFilePaths);

      console.log(chalk.gray(`Reviewing ${changedFiles.length} changed files...`));

      // Load conventions if available
      let conventions;
      const conventionsPath = ".stargazer/conventions.json";
      if (fs.existsSync(conventionsPath)) {
        conventions = await loadConventions(conventionsPath);
        console.log(chalk.gray("Using discovered conventions"));
      }

      // Initialize Stargazer
      const stargazer = new Stargazer({
        geminiApiKey: apiKey,
        model: options.model,
        minSeverity: options.minSeverity,
      });

      // Perform review
      const result = await stargazer.review({
        diff,
        changedFiles,
        conventions: conventions ?? undefined,
      });

      // Output results
      outputResults(result, options.format);
    } catch (error) {
      console.error(chalk.red(`Error: ${error instanceof Error ? error.message : error}`));
      process.exit(1);
    }
  });

function getDiff(staged: boolean, base: string): string {
  try {
    if (staged) {
      return execSync("git diff --staged", { encoding: "utf-8" });
    }
    return execSync(`git diff ${base}...HEAD`, { encoding: "utf-8" });
  } catch {
    return execSync("git diff", { encoding: "utf-8" });
  }
}

function getChangedFiles(staged: boolean, base: string): string[] {
  try {
    let output: string;
    if (staged) {
      output = execSync("git diff --staged --name-only", { encoding: "utf-8" });
    } else {
      output = execSync(`git diff ${base}...HEAD --name-only`, { encoding: "utf-8" });
    }
    return output.trim().split("\n").filter(Boolean);
  } catch {
    const output = execSync("git diff --name-only", { encoding: "utf-8" });
    return output.trim().split("\n").filter(Boolean);
  }
}

async function readFiles(paths: string[]): Promise<FileContext[]> {
  const files: FileContext[] = [];
  for (const filePath of paths) {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      files.push({ path: filePath, content });
    }
  }
  return files;
}

function outputResults(result: any, format: string): void {
  if (format === "json") {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Terminal output
  console.log("\n" + chalk.bold("Summary"));
  console.log(chalk.gray("─".repeat(50)));
  console.log(result.summary);

  console.log("\n" + chalk.bold(`Issues (${result.issues.length})`));
  console.log(chalk.gray("─".repeat(50)));

  if (result.issues.length === 0) {
    console.log(chalk.green("✓ No issues found"));
    return;
  }

  for (const issue of result.issues) {
    const severityColors = {
      critical: chalk.red,
      high: chalk.yellow,
      medium: chalk.cyan,
      low: chalk.gray,
    };
    const color = severityColors[issue.severity] || chalk.white;

    console.log(`\n${color(`[${issue.severity.toUpperCase()}]`)} ${chalk.bold(issue.file)}:${issue.line}`);
    console.log(`  ${issue.message}`);
    if (issue.suggestion) {
      console.log(chalk.green(`  → ${issue.suggestion}`));
    }
    if (issue.conventionRef) {
      console.log(chalk.gray(`  Based on: ${issue.conventionRef}`));
    }
  }

  console.log("\n" + chalk.gray("─".repeat(50)));
  console.log(`Decision: ${chalk.bold(result.decision)}`);
}
```

### 7.8 packages/action/src/index.ts

```typescript
import * as core from "@actions/core";
import * as github from "@actions/github";
import { Stargazer, loadConventions, FileContext } from "@stargazer/core";

async function run(): Promise<void> {
  try {
    // Get inputs
    const geminiApiKey = core.getInput("gemini-api-key", { required: true });
    const token = core.getInput("github-token", { required: true });
    const model = core.getInput("model") || "flash";
    const minSeverity = core.getInput("min-severity") || "high";
    const maxComments = parseInt(core.getInput("max-comments") || "10", 10);

    // Mask the API key
    core.setSecret(geminiApiKey);

    // Get PR context
    const context = github.context;
    if (!context.payload.pull_request) {
      core.info("Not a pull request event, skipping review");
      return;
    }

    const prNumber = context.payload.pull_request.number;
    const owner = context.repo.owner;
    const repo = context.repo.repo;

    core.info(`Reviewing PR #${prNumber}`);

    // Initialize GitHub client
    const octokit = github.getOctokit(token);

    // Get PR diff
    const { data: diff } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
      mediaType: { format: "diff" },
    });

    // Get changed files
    const { data: filesData } = await octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber,
    });

    const changedFiles: FileContext[] = [];
    for (const file of filesData) {
      if (file.status === "removed") continue;

      try {
        const { data: content } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: file.filename,
          ref: context.payload.pull_request.head.sha,
        });

        if ("content" in content) {
          changedFiles.push({
            path: file.filename,
            content: Buffer.from(content.content, "base64").toString("utf-8"),
          });
        }
      } catch (error) {
        core.warning(`Could not read file: ${file.filename}`);
      }
    }

    // Try to load conventions
    let conventions;
    try {
      conventions = await loadConventionsFromRepo(octokit, owner, repo, context.payload.pull_request.base.sha);
    } catch {
      core.info("No conventions file found, will review without conventions");
    }

    // Initialize Stargazer
    const stargazer = new Stargazer({
      geminiApiKey,
      model: model as "flash" | "pro",
      minSeverity: minSeverity as "critical" | "high" | "medium" | "low",
      maxComments,
    });

    // Perform review
    const result = await stargazer.review({
      diff: diff as unknown as string,
      changedFiles,
      conventions: conventions ?? undefined,
    });

    core.info(`Found ${result.issues.length} issues`);

    // Post review
    await postReview(octokit, owner, repo, prNumber, result, context.payload.pull_request.head.sha);

    // Create summary
    await core.summary
      .addHeading("Stargazer Review")
      .addRaw(result.summary)
      .addHeading("Issues", 3)
      .addTable([
        [{ data: "Severity", header: true }, { data: "File", header: true }, { data: "Message", header: true }],
        ...result.issues.map((issue) => [issue.severity, `${issue.file}:${issue.line}`, issue.message]),
      ])
      .write();

  } catch (error) {
    core.setFailed(`Action failed: ${error instanceof Error ? error.message : error}`);
  }
}

async function loadConventionsFromRepo(
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  repo: string,
  ref: string
) {
  const { data } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path: ".stargazer/conventions.json",
    ref,
  });

  if ("content" in data) {
    const content = Buffer.from(data.content, "base64").toString("utf-8");
    return JSON.parse(content);
  }

  return null;
}

async function postReview(
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  repo: string,
  prNumber: number,
  result: any,
  commitSha: string
) {
  const reviewEvent = result.decision === "approve"
    ? "APPROVE"
    : result.decision === "request_changes"
    ? "REQUEST_CHANGES"
    : "COMMENT";

  // Create review with inline comments
  const comments = result.issues.map((issue: any) => ({
    path: issue.file,
    line: issue.line,
    body: formatIssueComment(issue),
  }));

  await octokit.rest.pulls.createReview({
    owner,
    repo,
    pull_number: prNumber,
    commit_id: commitSha,
    event: reviewEvent,
    body: `## Stargazer Review\n\n${result.summary}`,
    comments,
  });
}

function formatIssueComment(issue: any): string {
  const emoji = {
    critical: "🚨",
    high: "⚠️",
    medium: "📝",
    low: "💡",
  }[issue.severity] || "📝";

  let comment = `${emoji} **${issue.severity.toUpperCase()}** (${issue.category})\n\n${issue.message}`;

  if (issue.suggestion) {
    comment += `\n\n**Suggestion:**\n${issue.suggestion}`;
  }

  if (issue.conventionRef) {
    comment += `\n\n_Based on: ${issue.conventionRef}_`;
  }

  return comment;
}

run();
```

### 7.9 packages/action/action.yml

```yaml
name: "Stargazer Code Review"
description: "AI code review with zero-config convention learning, powered by Gemini"
author: "Your Name"

branding:
  icon: "eye"
  color: "purple"

inputs:
  gemini-api-key:
    description: "Gemini API key"
    required: true
  github-token:
    description: "GitHub token for posting reviews"
    required: false
    default: ${{ github.token }}
  trigger:
    description: "Trigger mode: auto or on-demand (/review comment)"
    required: false
    default: "auto"
  model:
    description: "Model to use: flash or pro"
    required: false
    default: "flash"
  min-severity:
    description: "Minimum severity to report: critical, high, medium, low"
    required: false
    default: "high"
  max-comments:
    description: "Maximum comments per review"
    required: false
    default: "10"

outputs:
  decision:
    description: "Review decision: approve, request_changes, or comment"
  issues-count:
    description: "Number of issues found"
  summary:
    description: "Review summary"

runs:
  using: "node20"
  main: "dist/index.js"
```

---

## 8. Root Configuration Files

### 8.1 package.json (root)

```json
{
  "name": "stargazer",
  "private": true,
  "packageManager": "pnpm@9.15.0",
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "turbo": "^2.0.0",
    "typescript": "^5.7.0"
  }
}
```

### 8.2 pnpm-workspace.yaml

```yaml
packages:
  - "packages/*"
  - "apps/*"
```

### 8.3 turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env*local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "clean": {
      "cache": false
    }
  }
}
```

### 8.4 tsconfig.base.json (Bundler Mode!)

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    // Bundler mode - clean imports without .js extensions
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2022",

    // Strict settings
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,

    // Module handling
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,

    // Declarations (tsup handles bundling)
    "declaration": true,
    "declarationMap": true,

    // Don't emit - tsup does this
    "noEmit": true
  }
}
```

> **Note**: We use `bundler` mode which allows clean imports without `.js` extensions. TypeScript only type-checks, tsup handles the actual bundling.

---

## 9. Key Files to Create

```
stargazer/
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
├── README.md
├── LICENSE (MIT)
│
├── packages/
│   ├── core/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── types.ts
│   │       ├── gemini/
│   │       │   ├── client.ts
│   │       │   └── schemas.ts
│   │       ├── conventions/
│   │       │   ├── discovery.ts
│   │       │   └── cache.ts
│   │       ├── context/
│   │       │   └── selector.ts
│   │       └── review/
│   │           └── engine.ts
│   │
│   ├── cli/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── bin/stargazer.ts
│   │   └── src/
│   │       ├── index.ts
│   │       └── commands/
│   │           ├── review.ts
│   │           └── discover.ts
│   │
│   └── action/
│       ├── package.json
│       ├── tsconfig.json
│       ├── action.yml
│       └── src/
│           └── index.ts
│
└── examples/
    └── workflow.yml
```

---

## Sources

### Licensing & Business Models
- [Dual Licensing Explained](https://www.termsfeed.com/blog/dual-license-open-source-commercial/)
- [AGPL vs MIT Decision Guide](https://www.getmonetizely.com/articles/should-you-license-your-open-source-saas-under-agpl-or-mit-a-decision-guide-for-founders)
- [Open Core Model](https://en.wikipedia.org/wiki/Open-core_model)
- [AGPL License Considerations](https://www.opencoreventures.com/blog/agpl-license-is-a-non-starter-for-most-companies)

### Competitor Analysis
- [State of AI Code Review Tools 2025](https://www.devtoolsacademy.com/blog/state-of-ai-code-review-tools-2025/)
- [CodeRabbit Alternatives](https://www.qodo.ai/blog/coderabbit-alternatives/)
- [Open Source AI Code Review Assessment](https://www.happyassassin.net/posts/2025/12/16/a-half-assed-assessment-of-open-source-ai-code-review-tools/)

### Technical
- [GitHub Actions vs Apps](https://docs.github.com/en/actions/get-started/actions-vs-apps)
- [pnpm Monorepo Guide](https://jsdev.space/complete-monorepo-guide/)
- [Zod with LLMs](https://www.ai-engineer.io/tutorials/ai-sdk-structured-outputs-with-zod)
- [Plugin Architecture TypeScript](https://code.lol/post/programming/plugin-architecture/)
