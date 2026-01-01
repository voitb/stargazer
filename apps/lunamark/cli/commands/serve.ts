import { Command } from 'commander'
import { spawn } from 'node:child_process'
import * as path from 'node:path'
import * as fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Start the Lunamark Kanban board server
 *
 * Sets LUNAMARK_TASKS_DIR environment variable and spawns the Vite dev server.
 * Optionally opens the browser automatically.
 */
export const serveCommand = new Command('serve')
  .description('Start the Kanban board server')
  .option('-p, --port <number>', 'Port number', '3000')
  .option('-d, --dir <path>', 'Tasks directory', './tasks')
  .option('--open', 'Open browser automatically', false)
  .action(async (options) => {
    const tasksDir = path.resolve(process.cwd(), options.dir)

    // Ensure tasks directory exists
    if (!fs.existsSync(tasksDir)) {
      fs.mkdirSync(tasksDir, { recursive: true })
      console.log(`Created tasks directory: ${tasksDir}`)
    }

    console.log(`
  🌙 Lunamark

  Tasks: ${tasksDir}
  URL:   http://localhost:${options.port}

  Press Ctrl+C to stop
    `)

    // Find the app root (two levels up from cli/commands/)
    const appDir = path.resolve(__dirname, '..', '..')

    // Spawn the Vite dev server
    const child = spawn('pnpm', ['dev', '--port', options.port], {
      cwd: appDir,
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        LUNAMARK_TASKS_DIR: tasksDir,
      },
    })

    // Open browser if requested
    if (options.open) {
      setTimeout(async () => {
        const { default: open } = await import('open')
        await open(`http://localhost:${options.port}`)
      }, 2000)
    }

    // Forward exit code
    child.on('close', (code) => process.exit(code ?? 0))

    // Handle Ctrl+C gracefully
    process.on('SIGINT', () => {
      child.kill('SIGINT')
    })
  })
