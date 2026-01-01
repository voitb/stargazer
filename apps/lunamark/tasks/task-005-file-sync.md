---
id: task-005
title: Add file synchronization
status: in-progress
priority: medium
labels:
  - backend
  - sync
created: '2025-01-16'
order: 20
---
## Description

Implement bi-directional sync between the UI and markdown files using chokidar and Server-Sent Events.

## Acceptance Criteria

- [ ] Watch tasks directory for changes
- [ ] Broadcast changes via SSE
- [ ] Auto-refresh board on external edits
