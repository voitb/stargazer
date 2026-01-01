import * as fs from 'node:fs'
import * as path from 'node:path'
import { z } from 'zod'
import { ColumnConfigSchema, DEFAULT_COLUMNS } from '@/schemas/task'

/**
 * User-provided configuration (what goes in lunamark.config.ts)
 *
 * This schema defines what users can configure in their config file.
 * Paths are relative to the config file location, not process.cwd().
 */
export const LunamarkUserConfigSchema = z.object({
  /** Directory containing task markdown files (relative to config or absolute) */
  tasksDir: z.string().default('./tasks'),

  /** Enable file watching for real-time sync (Phase 3) */
  watch: z.boolean().default(true),

  /** Custom column configuration (overrides defaults) */
  columns: z.array(ColumnConfigSchema).optional(),
})

export type LunamarkUserConfig = z.infer<typeof LunamarkUserConfigSchema>

/**
 * Resolved configuration with derived fields
 *
 * This extends the user config with computed values needed at runtime.
 * The configDir is used to resolve relative paths correctly in monorepos.
 */
export const LunamarkConfigSchema = LunamarkUserConfigSchema.extend({
  /** Directory containing the config file (used for relative path resolution) */
  configDir: z.string(),
})

export type LunamarkConfig = z.infer<typeof LunamarkConfigSchema>

/**
 * Helper for defining config with type safety
 *
 * Use this in your lunamark.config.ts for autocomplete and validation.
 *
 * @example
 * ```ts
 * // lunamark.config.ts
 * import { defineConfig } from './src/lib/config'
 *
 * export default defineConfig({
 *   tasksDir: './my-tasks',
 *   watch: true,
 * })
 * ```
 */
export function defineConfig(config: Partial<LunamarkUserConfig>): LunamarkUserConfig {
  return LunamarkUserConfigSchema.parse(config)
}

/**
 * Config file names to search for (in order of priority)
 */
const CONFIG_FILES = ['lunamark.config.ts', 'lunamark.config.js', 'lunamark.config.mjs']

/**
 * Find the config file by walking up from a starting directory
 *
 * @param startDir - Directory to start searching from
 * @param maxDepth - Maximum directories to traverse upward
 * @returns Path to config file or null if not found
 */
export function findConfigFile(startDir: string = process.cwd(), maxDepth = 10): string | null {
  let currentDir = startDir
  let depth = 0

  while (depth < maxDepth) {
    for (const configFile of CONFIG_FILES) {
      const configPath = path.join(currentDir, configFile)
      if (fs.existsSync(configPath)) {
        return configPath
      }
    }

    const parentDir = path.dirname(currentDir)
    if (parentDir === currentDir) {
      // Reached filesystem root
      break
    }

    currentDir = parentDir
    depth++
  }

  return null
}

/**
 * Load config from a file path
 *
 * Note: This is a synchronous operation. For TypeScript config files,
 * you may need to use a bundler or tsx to load them.
 */
async function loadConfigFile(configPath: string): Promise<LunamarkUserConfig> {
  try {
    // Dynamic import works for both .ts (with tsx/vite) and .js/.mjs
    const module = await import(configPath)
    const config = module.default || module

    return LunamarkUserConfigSchema.parse(config)
  } catch (error) {
    console.warn(`[Lunamark] Failed to load config from ${configPath}:`, error)
    return LunamarkUserConfigSchema.parse({})
  }
}

/**
 * Resolve the full configuration
 *
 * Resolution priority (highest to lowest):
 * 1. Overrides passed to this function (CLI args)
 * 2. Environment variables (LUNAMARK_TASKS_DIR)
 * 3. Config file (lunamark.config.ts)
 * 4. Default values
 *
 * @param overrides - Optional overrides (e.g., from CLI arguments)
 * @returns Fully resolved configuration
 */
export async function resolveConfig(
  overrides?: Partial<LunamarkUserConfig>
): Promise<LunamarkConfig> {
  // Find config file
  const configPath = findConfigFile()
  const configDir = configPath ? path.dirname(configPath) : process.cwd()

  // Load config from file if it exists
  let fileConfig: LunamarkUserConfig = LunamarkUserConfigSchema.parse({})
  if (configPath) {
    fileConfig = await loadConfigFile(configPath)
  }

  // Apply environment variable overrides
  const envTasksDir = process.env.LUNAMARK_TASKS_DIR

  // Merge configs with priority: overrides > env > file > defaults
  const mergedConfig: LunamarkUserConfig = {
    ...fileConfig,
    ...(envTasksDir ? { tasksDir: envTasksDir } : {}),
    ...overrides,
  }

  // Validate and add configDir
  return LunamarkConfigSchema.parse({
    ...mergedConfig,
    configDir,
  })
}

/**
 * Synchronous version of resolveConfig for use in contexts
 * where async is not available (e.g., some server function handlers)
 *
 * This version only uses environment variables and defaults,
 * not the config file (which requires async import).
 */
export function resolveConfigSync(overrides?: Partial<LunamarkUserConfig>): LunamarkConfig {
  // Find config file for configDir resolution
  const configPath = findConfigFile()
  const configDir = configPath ? path.dirname(configPath) : process.cwd()

  // Use environment variable and defaults only
  const envTasksDir = process.env.LUNAMARK_TASKS_DIR

  const config: LunamarkUserConfig = {
    ...LunamarkUserConfigSchema.parse({}),
    ...(envTasksDir ? { tasksDir: envTasksDir } : {}),
    ...overrides,
  }

  return LunamarkConfigSchema.parse({
    ...config,
    configDir,
  })
}

/**
 * Resolve the tasks directory path from config
 *
 * Handles both absolute and relative paths correctly in monorepos.
 * Relative paths are resolved from the config file location, not process.cwd().
 *
 * @param config - Resolved configuration
 * @returns Absolute path to tasks directory
 */
export function getTasksDir(config: LunamarkConfig): string {
  const { tasksDir, configDir } = config

  // Absolute paths are used as-is
  if (path.isAbsolute(tasksDir)) {
    return tasksDir
  }

  // Relative paths resolve from config file location (app root)
  // NOT process.cwd() which may be monorepo root
  return path.resolve(configDir, tasksDir)
}

/**
 * Get the column configuration, using custom or default columns
 */
export function getColumns(config: LunamarkConfig) {
  return config.columns || DEFAULT_COLUMNS
}
