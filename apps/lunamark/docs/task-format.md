# Task Format Specification

Lunamark uses markdown files with YAML frontmatter as the source of truth for tasks. This document defines the required and optional fields.

## Basic Structure

Each task is a single `.md` file with this structure:

```markdown
---
id: task-001
title: Implement user authentication
status: in-progress
priority: high
labels: [backend, security]
assignee: john
created: 2025-01-15
due: 2025-01-30
order: 10
---

## Description

The task description in markdown...

## Acceptance Criteria

- [ ] First criterion
- [ ] Second criterion
```

## Frontmatter Fields

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier. Format: `task-{date}-{nanoid}` or custom |
| `title` | string | Task title displayed on the card |
| `status` | enum | Current column: `todo`, `in-progress`, `review`, `done` |

### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `priority` | enum | `medium` | Task priority: `low`, `medium`, `high`, `critical` |
| `labels` | string[] | `[]` | Tags for filtering and organization |
| `assignee` | string | - | Person responsible for the task |
| `created` | string | auto | ISO date when task was created |
| `due` | string | - | ISO date for deadline |
| `order` | number | `0` | Position within column (lower = higher) |

## Field Details

### Status Values

| Status | Description | Default Column Title |
|--------|-------------|---------------------|
| `todo` | Not started | Backlog |
| `in-progress` | Currently working | In Progress |
| `review` | Awaiting review | Review |
| `done` | Completed | Done |

### Priority Values

| Priority | Description | Visual Indicator |
|----------|-------------|------------------|
| `low` | Nice to have | Gray badge |
| `medium` | Normal priority | Blue badge |
| `high` | Important | Orange badge |
| `critical` | Urgent/blocking | Red badge |

### Order Field

The `order` field determines position within a column. Lower values appear higher.

**Best Practice**: Use gap-based ordering (10, 20, 30...) to allow insertions without reordering all tasks.

```yaml
order: 10   # First task
order: 20   # Second task
order: 15   # Inserted between first and second
```

## File Naming Convention

Recommended format: `{id}-{slug}.md`

```
tasks/
├── task-001-implement-auth.md
├── task-002-fix-login-bug.md
└── task-003-add-unit-tests.md
```

**Slug generation**: Derived from title, lowercase, hyphens instead of spaces.

## Markdown Body

The markdown body (everything after frontmatter) is the task description. It supports:

- Full GitHub-Flavored Markdown (GFM)
- Task lists (`- [ ]` and `- [x]`)
- Code blocks with syntax highlighting
- Tables, links, images
- Headings for organization

### Recommended Sections

```markdown
## Description

What needs to be done and why.

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2

## Technical Notes

Implementation details, links to relevant code.

## References

- [Related PR](#)
- [Design doc](#)
```

## Examples

### Minimal Task

```markdown
---
id: task-001
title: Fix login button color
status: todo
---

The login button should be blue, not green.
```

### Full Task

```markdown
---
id: task-2025-01-15-a1b2c3
title: Implement JWT authentication
status: in-progress
priority: high
labels: [backend, security, auth]
assignee: alice
created: 2025-01-15
due: 2025-01-30
order: 10
---

## Description

Implement JWT-based authentication to replace session cookies.
This will enable stateless authentication for our API.

## Acceptance Criteria

- [ ] Login endpoint returns JWT token
- [ ] Refresh token endpoint works
- [ ] Protected routes validate JWT
- [ ] Token expiration is configurable
- [ ] Unit tests cover auth flow

## Technical Notes

- Use `jose` library for JWT handling
- Store refresh tokens in HttpOnly cookies
- Access tokens expire in 15 minutes

## References

- [JWT Best Practices](https://auth0.com/blog/jwt-security-best-practices/)
- [Design doc](./docs/auth-design.md)
```

## Validation

Lunamark validates frontmatter using Zod schemas. Invalid files are:

1. Shown with a warning badge in the UI
2. Logged to console with specific validation errors
3. Still displayed (with available data) to allow fixing

### Common Validation Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `id is required` | Missing `id` field | Add unique `id` |
| `Invalid status` | Typo in status | Use: todo, in-progress, review, done |
| `Invalid priority` | Typo in priority | Use: low, medium, high, critical |
| `Invalid date format` | Wrong date format | Use ISO format: `2025-01-15` |

## Parsing Library

Lunamark uses [gray-matter](https://www.npmjs.com/package/gray-matter) for parsing:

```typescript
import matter from 'gray-matter';

const { data, content } = matter(fileContent);
// data = frontmatter as object
// content = markdown body
```

## Bi-directional Sync

When you drag a task to a new column:

1. Lunamark reads the current file
2. Updates the `status` (and optionally `order`) in frontmatter
3. Writes the file back, preserving markdown body formatting
4. File watcher notifies other clients of the change

This ensures your markdown files are always the source of truth.
