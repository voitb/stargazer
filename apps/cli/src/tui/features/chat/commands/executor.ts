/**
 * Command Executor
 *
 * Parses and executes slash commands.
 */

import { findCommand, type CommandContext } from './registry.js';

export interface ExecuteResult {
  success: boolean;
  output?: string;
  error?: string;
}

/**
 * Parse command input into name and arguments
 */
export function parseCommand(input: string): { name: string; args: string[] } {
  const parts = input.slice(1).trim().split(/\s+/);
  const name = parts[0]?.toLowerCase() ?? '';
  const args = parts.slice(1);
  return { name, args };
}

/**
 * Execute a slash command
 *
 * @param input - Full command string (e.g., "/review staged")
 * @param context - Command execution context
 * @returns Execution result with output or error
 */
export async function executeCommand(
  input: string,
  context: CommandContext
): Promise<ExecuteResult> {
  const { name, args } = parseCommand(input);

  if (!name) {
    return {
      success: false,
      error: 'No command specified. Type /help for available commands.',
    };
  }

  const command = findCommand(name);

  if (!command) {
    return {
      success: false,
      error: `Unknown command: /${name}. Type /help for available commands.`,
    };
  }

  try {
    const output = await command.handler(args, context);
    return {
      success: true,
      output: output ?? undefined,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Command failed',
    };
  }
}

/**
 * Check if input is a command
 */
export function isCommand(input: string): boolean {
  return input.startsWith('/') && input.length > 1;
}
