import { defineConfig } from './src/lib/config'

/**
 * Lunamark Configuration
 *
 * This file configures the Lunamark task board.
 * Paths are relative to this file's location.
 */
export default defineConfig({
  // Directory containing task markdown files
  tasksDir: './tasks',

  // Enable file watching for real-time sync
  watch: true,
})
