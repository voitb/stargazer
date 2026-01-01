---
id: task-002
title: Implement task parser
status: done
priority: high
labels:
  - backend
  - core
created: '2025-01-15'
order: 10
---
## Description

Create the task parser that reads markdown files with YAML frontmatter and converts them to Task objects.

## Technical Notes

- Use gray-matter for frontmatter parsing
- Validate with Zod schemas
- Handle parsing errors gracefully
