#!/usr/bin/env node
import { Command } from 'commander'
import { serveCommand } from './commands/serve.js'
import { initCommand } from './commands/init.js'
import { listCommand } from './commands/list.js'

const program = new Command()
  .name('lunamark')
  .description('Markdown-based Kanban task management for developers')
  .version('0.1.0')

program.addCommand(serveCommand)
program.addCommand(initCommand)
program.addCommand(listCommand)

program.parse()
