# Stargazer Monorepo - AI Agent Task Plan

> **Generated from:** `apps/lunamark/review.md`
> **Total Tasks:** 43
> **Implementer:** `@voitb`

---

## How to Use This File

AI agents should execute tasks in batch order. Each task includes:
- **Agent**: The specialist agent type to use
- **Status**: `[ ]` pending, `[x]` done
- **Files**: Target files for the task

---

## Task Status Summary

| Status | Count |
|--------|-------|
| Pending | 37 |
| Done | 6 |

---

## Batch 1: CLI & Core Package (PRIORITY)

**Execute First** - These tasks validate the core functionality.

### Agent: `@backend-developer`

| # | Status | Task | Files |
|---|--------|------|-------|
| 1.1 | [x] | Review CLI implementation - remove unneeded comments, prevent overengineering <!-- 2026-01-05 --> | `packages/cli/src/` |
| 1.2 | [x] | Write tests for CLI implementation (extend existing tests) <!-- 2026-01-05 --> | `packages/cli/src/output/terminal.test.ts` |
| 1.3 | [x] | Validate review command implementation <!-- 2026-01-05 --> | `packages/cli/src/commands/review.ts` |
| 1.4 | [x] | Validate terminal output implementation <!-- 2026-01-05 --> | `packages/cli/src/output/terminal.ts` |
| 1.5 | [x] | Validate core exports structure - created `review/types.ts` <!-- 2026-01-05 --> | `packages/core/src/index.ts` |
| 1.6 | [x] | Created separate types.ts with ReviewOptions, ReviewResult, Issue, Severity, Decision, Category <!-- 2026-01-05 --> | `packages/core/src/review/types.ts` |

**Context:**
```typescript
// Current exports to validate:
export { reviewDiff } from './review/review';
export type { ReviewOptions } from './review/review';
export type { ReviewResult, Issue, Severity, Decision } from './review/schemas';
```

**Exit codes:** 0=success, 1=issues found, 2=error

---

## Batch 2: Component Restructuring

**Run in parallel** - Three agents can work simultaneously.

### Agent: `@react-component-architect` (Kanban)

| # | Status | Task | Files |
|---|--------|------|-------|
| 2.1 | [ ] | Move kanban components to grouped files (shadcn pattern) | `apps/lunamark/packages/ui/components/kanban/` |
| 2.2 | [ ] | Review `src/components` for duplicates with `packages/ui` | `apps/lunamark/src/components/` vs `packages/ui/components/` |
| 2.3 | [ ] | Column-container clearance - group related components | `packages/ui/components/kanban/` |
| 2.4 | [ ] | Remove comments from `kanban/index.ts` | `packages/ui/components/kanban/index.ts` |

**Pattern:** Shadcn = related sub-components in same file with named exports.

### Agent: `@react-component-architect` (UI Library)

| # | Status | Task | Files |
|---|--------|------|-------|
| 3.1 | [ ] | Bring back SelectItem component for custom Select dropdowns | `packages/ui/components/select/` |
| 3.2 | [ ] | Remove duplicate selectable-button - use ToggleButton directly | `apps/lunamark/src/components/ui/selectable-button.tsx` |
| 3.3 | [ ] | Split form-field into smaller parts (FormDescription, FormError) | `packages/ui/components/form-field/` |
| 3.4 | [ ] | Improve button's SVG loader - create reusable Spinner component | `packages/ui/components/button/`, new `spinner/` |
| 3.5 | [ ] | Consider Avatar using Button from packages/ui internally | `packages/ui/components/avatar/` |

### Agent: `@tailwind-frontend-expert`

| # | Status | Task | Files |
|---|--------|------|-------|
| 7.1 | [ ] | Separate inline styles from `styles.css` - extract select, dropdown, scrollbar | `apps/lunamark/src/styles.css` |
| 7.2 | [ ] | Review `data-header` attribute usage - document or remove | `apps/lunamark/src/styles.css` |

**Pattern:** Custom scrollbar → `.custom-scrollbar` utility class.

---

## Batch 3: Code Cleanup

**Run in parallel** - Two agents can work simultaneously.

### Agent: `@code-reviewer`

| # | Status | Task | Files |
|---|--------|------|-------|
| 4.1 | [ ] | Remove unnecessary comments from `use-controllable-state.ts` | `packages/ui/hooks/use-controllable-state/` |
| 4.2 | [ ] | Remove unnecessary comments from `use-exit-animation.ts` | `packages/ui/hooks/use-exit-animation/` |
| 4.3 | [ ] | Clean `use-focus-trap` - remove verbose comments, simplify tests | `packages/ui/hooks/use-focus-trap/` |
| 4.4 | [ ] | Clean `use-theme` - remove over-engineered tests | `packages/ui/hooks/use-theme/` |
| 4.5 | [ ] | Remove unnecessary comments from `packages/ui/index.ts` | `packages/ui/index.ts` |
| 4.6 | [ ] | Validate tokens usage and correctness | `packages/ui/tokens/` |
| 4.7 | [ ] | Validate `create-context.ts` utility implementation | `packages/ui/utils/create-context.ts` |
| 4.8 | [ ] | Clean dropdown tests - consider global `setup()` function | `packages/ui/components/dropdown/` |

**Principle:** Comments should only exist where logic isn't self-evident.

### Agent: `@documentation-specialist`

| # | Status | Task | Files |
|---|--------|------|-------|
| 9.1 | [ ] | Mark done tasks in `/tasks/` directory (32 done, need implementer) | `apps/lunamark/tasks/task-*.md` |
| 9.2 | [ ] | Add `implementer: voitb` to all completed task frontmatter | `apps/lunamark/tasks/task-*.md` |
| 9.3 | [ ] | Validate task-preview-dialog implementation | `apps/lunamark/src/components/task-preview-dialog/` |

**Frontmatter format:**
```yaml
---
title: Task Title
status: done
implementer: voitb
---
```

---

## Batch 4: Testing & Validation

**Run in parallel** - Testing and validation can happen simultaneously.

### Agent: `@react-component-architect` (Testing)

| # | Status | Task | Files |
|---|--------|------|-------|
| 5.1 | [ ] | Add tests for Select component + validate implementation | `packages/ui/components/select/` |
| 5.2 | [ ] | Add tests for Textarea component | `packages/ui/components/textarea/` |
| 5.3 | [ ] | Add tests for Toggle - reconsider grouping with ToggleButton | `packages/ui/components/toggle/` |
| 5.4 | [ ] | Add tests for ToggleGroup - put context inside toggle-group file | `packages/ui/components/toggle-group/` |
| 5.5 | [ ] | Add tests for Tooltip - put context inside tooltip file | `packages/ui/components/tooltip/` |
| 5.6 | [ ] | Add tests for Popover + validate implementation | `packages/ui/components/popover/` |
| 5.7 | [ ] | Add tests for StatPill + validate implementation | `packages/ui/components/stat-pill/` |
| 5.8 | [ ] | Consolidate multi-select-chip tests - remove redundant tests | `packages/ui/components/multi-select-chips/` |
| 5.9 | [ ] | Validate vitest setup configuration | `apps/lunamark/vitest.setup.ts` |

**Testing pattern:** Use `userEvent.setup()`, test ARIA roles, keyboard navigation.

### Agent: `@react-component-architect` (Validation + Research)

| # | Status | Task | Files | Research |
|---|--------|------|-------|----------|
| 6.1 | [ ] | Validate Checkbox indeterminate `dataState` - check if useEffect needed | `packages/ui/components/checkbox/` | React: "You Might Not Need an Effect" |
| 6.2 | [ ] | Validate Combobox - multiple useRefs, useControllableStates, overengineering? | `packages/ui/components/combobox/` | Consider render props, reuse Input |
| 6.3 | [ ] | Validate Dialog - remove useCallbacks, add `closeOnOutsideClick` prop | `packages/ui/components/dialog/` | React Compiler handles memoization |
| 6.4 | [ ] | Validate Dropdown implementation - same concerns as combobox | `packages/ui/components/dropdown/` | |
| 6.5 | [ ] | Research `"use client"` directive - needed for all components? | All `packages/ui/components/` | Next.js/RSC best practices |
| 6.6 | [ ] | Reconsider merging filter-group into filter-bar (shadcn pattern) | `packages/ui/components/filter-bar/`, `filter-group/` | |
| 6.7 | [ ] | Validate header-logo as reusable component for packages/ui | `apps/lunamark/src/components/header/header-logo.tsx` | |

**Note:** Use context7 and websearch for research tasks.

---

## Batch 5: Routing Hook

**Requires research** - Use context7 for TanStack Router best practices.

### Agent: `@react-component-architect` (with context7)

| # | Status | Task | Files | Research |
|---|--------|------|-------|----------|
| 8.1 | [ ] | Create custom routing hook for `/routes/index.tsx` - extract logic | `apps/lunamark/src/routes/index.tsx`, new `src/hooks/use-routing.ts` | TanStack Router docs |

---

## Agent Reference

| Agent | Specialty | Used In |
|-------|-----------|---------|
| `@backend-developer` | CLI, Node.js, testing | Batch 1 |
| `@react-component-architect` | React components, hooks, patterns | Batch 2, 4, 5 |
| `@tailwind-frontend-expert` | Tailwind CSS, styling | Batch 2 |
| `@code-reviewer` | Code cleanup, best practices | Batch 3 |
| `@documentation-specialist` | Docs, task management | Batch 3 |

---

## File Map

```
packages/cli/src/
├── commands/review.ts        # 1.3
├── commands/review.test.ts   # 1.2
├── output/terminal.ts        # 1.4
└── index.ts                  # 1.1

packages/core/src/
├── index.ts                  # 1.5
└── review/                   # 1.6

packages/ui/
├── components/
│   ├── avatar/               # 3.5
│   ├── button/               # 3.4
│   ├── checkbox/             # 6.1
│   ├── combobox/             # 6.2
│   ├── dialog/               # 6.3
│   ├── dropdown/             # 4.8, 6.4
│   ├── filter-bar/           # 6.6
│   ├── filter-group/         # 6.6
│   ├── form-field/           # 3.3
│   ├── kanban/               # 2.1, 2.3, 2.4
│   ├── multi-select-chips/   # 5.8
│   ├── popover/              # 5.6
│   ├── select/               # 3.1, 5.1
│   ├── stat-pill/            # 5.7
│   ├── textarea/             # 5.2
│   ├── toggle/               # 5.3
│   ├── toggle-group/         # 5.4
│   └── tooltip/              # 5.5
├── hooks/
│   ├── use-controllable-state/  # 4.1
│   ├── use-exit-animation/      # 4.2
│   ├── use-focus-trap/          # 4.3
│   └── use-theme/               # 4.4
├── tokens/                   # 4.6
├── utils/create-context.ts   # 4.7
└── index.ts                  # 4.5

apps/lunamark/
├── src/
│   ├── components/
│   │   ├── header/           # 6.7
│   │   ├── task-preview-dialog/  # 9.3
│   │   └── ui/selectable-button.tsx  # 3.2
│   ├── routes/index.tsx      # 8.1
│   └── styles.css            # 7.1, 7.2
├── tasks/                    # 9.1, 9.2
└── vitest.setup.ts           # 5.9
```

---

## Execution Commands

```bash
# Run all agents for a batch
# Batch 1 (priority - run first):
claude "Execute TASKS.md Batch 1 using @backend-developer"

# Batch 2 (parallel):
claude "Execute TASKS.md Batch 2 tasks 2.1-2.4 using @react-component-architect"
claude "Execute TASKS.md Batch 2 tasks 3.1-3.5 using @react-component-architect"
claude "Execute TASKS.md Batch 2 tasks 7.1-7.2 using @tailwind-frontend-expert"

# Batch 3 (parallel):
claude "Execute TASKS.md Batch 3 tasks 4.1-4.8 using @code-reviewer"
claude "Execute TASKS.md Batch 3 tasks 9.1-9.3 using @documentation-specialist"

# Batch 4 (parallel):
claude "Execute TASKS.md Batch 4 tasks 5.1-5.9 using @react-component-architect"
claude "Execute TASKS.md Batch 4 tasks 6.1-6.7 using @react-component-architect with context7"

# Batch 5:
claude "Execute TASKS.md Batch 5 task 8.1 using @react-component-architect with context7"
```

---

## Progress Tracking

When completing a task, update this file:
1. Change `[ ]` to `[x]`
2. Add completion date as comment: `[x] Task name <!-- 2026-01-05 -->`
3. Update Task Status Summary counts
