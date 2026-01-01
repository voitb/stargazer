import { Command } from 'commander'
import * as path from 'node:path'
import * as fs from 'node:fs'

/**
 * Initialize a tasks directory with sample tasks
 *
 * Creates the directory structure and sample markdown tasks
 * to help users get started quickly.
 */
export const initCommand = new Command('init')
  .description('Initialize a tasks directory with sample tasks')
  .option('-d, --dir <path>', 'Tasks directory', './tasks')
  .option('-f, --force', 'Overwrite existing tasks', false)
  .action(async (options) => {
    const tasksDir = path.resolve(process.cwd(), options.dir)

    // Check if directory exists with tasks
    if (fs.existsSync(tasksDir)) {
      const files = fs.readdirSync(tasksDir)
      const hasMarkdown = files.some((f) => f.endsWith('.md'))

      if (hasMarkdown && !options.force) {
        console.log(`
  Tasks directory already contains .md files: ${tasksDir}

  Use --force to overwrite, or specify a different directory with --dir
        `)
        return
      }
    }

    // Create directory
    fs.mkdirSync(tasksDir, { recursive: true })

    // Sample tasks to create
    const today = new Date().toISOString().split('T')[0]
    const sampleTasks = [
      {
        filename: 'task-welcome-to-lunamark.md',
        content: `---
id: task-welcome
title: Welcome to Lunamark
status: done
priority: medium
labels:
  - docs
  - tutorial
assignee: null
created: ${today}
due: null
order: 10
---

## Getting Started

Welcome to Lunamark! 🌙

This is your first task. Lunamark is a **markdown-based Kanban** tool designed for developers.

### Key Features

- **Drag and drop** tasks between columns
- **Click on a card** to edit task details
- **Files are your database** - each task is a \`.md\` file
- **Git-friendly** - track changes with version control
- **Edit anywhere** - use VS Code, vim, or any text editor

### Try It Out

1. Drag this card to "In Progress"
2. Click on a task to edit it
3. Create a new task with the "+ Add Task" button
`,
      },
      {
        filename: 'task-create-your-first.md',
        content: `---
id: task-first
title: Create your first task
status: todo
priority: high
labels:
  - tutorial
assignee: null
created: ${today}
due: null
order: 20
---

## Instructions

1. Click the **+ Add Task** button in any column
2. Fill in the title and details
3. Click **Create Task**

Your task will be saved as a markdown file in the \`tasks/\` directory!

### Task Format

Each task has:
- **Title** - shown on the card
- **Status** - which column it's in
- **Priority** - low, medium, high, or critical
- **Labels** - for categorization
- **Due date** - optional deadline
- **Content** - markdown description (what you're reading!)
`,
      },
      {
        filename: 'task-explore-features.md',
        content: `---
id: task-explore
title: Explore the features
status: in-progress
priority: medium
labels:
  - tutorial
  - feature
assignee: null
created: ${today}
due: null
order: 30
---

## Features to Try

### Real-time Sync
Edit a \`.md\` file directly in your editor - the board updates automatically!

### Priority Badges
Tasks show color-coded priority badges:
- 🔵 Low (gray)
- 🟢 Medium (blue)
- 🟠 High (orange)
- 🔴 Critical (red)

### Labels
Add labels to categorize your tasks. They appear as colored tags on cards.

### Due Dates
Set due dates to track deadlines. They appear on the card footer.
`,
      },
    ]

    // Write sample tasks
    for (const task of sampleTasks) {
      const filePath = path.join(tasksDir, task.filename)
      fs.writeFileSync(filePath, task.content, 'utf-8')
    }

    console.log(`
  ✅ Initialized Lunamark tasks directory

  Location: ${tasksDir}
  Created ${sampleTasks.length} sample tasks

  Next steps:
    lunamark serve --dir ${options.dir}    Start the Kanban board
    lunamark list --dir ${options.dir}     View tasks in terminal
    `)
  })
