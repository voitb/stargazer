/**
 * Command Registry
 *
 * Defines all available slash commands and their handlers.
 */

import type { Screen } from '../../../state/navigation-context.js';

export interface CommandContext {
  navigate: (screen: Screen) => void;
  clearMessages: () => Promise<void>;
  addSystemMessage: (content: string) => Promise<void>;
  closeSession: () => void;
  projectPath: string;
}

export interface Command {
  name: string;
  aliases: string[];
  description: string;
  usage: string;
  handler: (args: string[], context: CommandContext) => Promise<string | void>;
}

/**
 * All available commands
 */
export const commands: Command[] = [
  {
    name: 'help',
    aliases: ['h', '?'],
    description: 'Show all available commands',
    usage: '/help',
    handler: async () => {
      const commandList = commands
        .map(cmd => `  /${cmd.name.padEnd(12)} ${cmd.description}`)
        .join('\n');
      return `Available commands:\n\n${commandList}\n\nType /command for more info.`;
    },
  },
  {
    name: 'clear',
    aliases: ['c'],
    description: 'Clear conversation history',
    usage: '/clear',
    handler: async (_, ctx) => {
      await ctx.clearMessages();
      return 'Conversation cleared.';
    },
  },
  {
    name: 'review',
    aliases: ['r'],
    description: 'Run code review',
    usage: '/review [staged|unstaged]',
    handler: async (args) => {
      const type = args[0] === 'unstaged' ? 'unstaged' : 'staged';
      // This will be handled by the chat screen
      return `__COMMAND__:review:${type}`;
    },
  },
  {
    name: 'settings',
    aliases: ['s', 'config'],
    description: 'Open settings',
    usage: '/settings',
    handler: async (_, ctx) => {
      ctx.navigate('settings');
    },
  },
  {
    name: 'theme',
    aliases: ['t'],
    description: 'Change theme (dark/light)',
    usage: '/theme [dark|light]',
    handler: async (args) => {
      if (!args[0] || !['dark', 'light'].includes(args[0])) {
        return 'Usage: /theme dark or /theme light';
      }
      // This will be handled by the chat screen
      return `__COMMAND__:theme:${args[0]}`;
    },
  },
  {
    name: 'model',
    aliases: ['m'],
    description: 'Switch LLM model',
    usage: '/model [model-name]',
    handler: async (args) => {
      if (!args[0]) {
        return 'Available models: gemini-1.5-pro, gemini-1.5-flash, gemini-2.0-flash-exp';
      }
      return `__COMMAND__:model:${args[0]}`;
    },
  },
  {
    name: 'exit',
    aliases: ['quit', 'q'],
    description: 'Exit to main menu',
    usage: '/exit',
    handler: async (_, ctx) => {
      ctx.closeSession();
    },
  },
  {
    name: 'sessions',
    aliases: ['history'],
    description: 'View session history',
    usage: '/sessions',
    handler: async (_, ctx) => {
      ctx.navigate('history');
    },
  },
];

/**
 * Find command by name or alias
 */
export function findCommand(name: string): Command | undefined {
  const normalized = name.toLowerCase();
  return commands.find(
    cmd => cmd.name === normalized || cmd.aliases.includes(normalized)
  );
}

/**
 * Get command suggestions for autocomplete
 */
export function getCommandSuggestions(partial: string): Command[] {
  const lower = partial.toLowerCase();
  return commands.filter(
    cmd =>
      cmd.name.startsWith(lower) ||
      cmd.aliases.some(alias => alias.startsWith(lower))
  );
}

/**
 * Get all commands (for display)
 */
export function getAllCommands(): readonly Command[] {
  return commands;
}
