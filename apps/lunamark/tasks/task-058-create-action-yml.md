---
id: task-058
title: Create action.yml
status: done
priority: high
labels:
  - action
created: '2026-01-01'
order: 580
assignee: voitb
---
## Description

Create the GitHub Action metadata file.

## Acceptance Criteria

- [ ] Create `packages/action/action.yml`
- [ ] Define inputs (gemini-api-key, github-token)
- [ ] Configure branding
- [ ] Point to compiled entry point

## Implementation

**File**: `packages/action/action.yml`

```yaml
name: 'Stargazer AI Review'
description: 'AI-powered code review using Google Gemini'
author: 'Stargazer Team'

branding:
  icon: 'star'
  color: 'purple'

inputs:
  gemini-api-key:
    description: 'Google Gemini API key'
    required: true

  github-token:
    description: 'GitHub token for posting comments'
    required: false
    default: ${{ github.token }}

  min-severity:
    description: 'Minimum severity to report (critical, high, medium, low)'
    required: false
    default: 'low'

  max-issues:
    description: 'Maximum number of issues to report'
    required: false
    default: '20'

outputs:
  issues-count:
    description: 'Number of issues found'

  decision:
    description: 'Review decision (approve, request_changes, comment)'

runs:
  using: 'node20'
  main: 'dist/index.js'
```

## Test

```bash
# Validate YAML syntax
cat packages/action/action.yml | yq .
```

Valid YAML that defines a GitHub Action.
