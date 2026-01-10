/**
 * File Search Utilities
 *
 * Provides file traversal and fuzzy search for the @ file tagging feature.
 */

import { readdir, stat, readFile } from 'node:fs/promises';
import { join, relative, extname } from 'node:path';

/**
 * Directories to ignore during file search
 */
const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  '.next',
  '.nuxt',
  '.svelte-kit',
  'dist',
  'build',
  'out',
  'coverage',
  '__pycache__',
  '.cache',
  '.vscode',
  '.idea',
  'vendor',
  'target',
]);

/**
 * File extensions to ignore
 */
const IGNORED_EXTENSIONS = new Set([
  '.lock',
  '.log',
  '.map',
  '.min.js',
  '.min.css',
  '.d.ts.map',
  '.tsbuildinfo',
]);

/**
 * Binary file extensions (skip preview)
 */
const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.mp3', '.mp4', '.wav', '.avi', '.mov',
  '.zip', '.tar', '.gz', '.rar', '.7z',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  '.exe', '.dll', '.so', '.dylib',
]);

export interface FileMatch {
  /** Absolute path to the file */
  path: string;
  /** Path relative to the project root */
  relativePath: string;
  /** File or directory name */
  name: string;
  /** Whether this is a directory */
  isDirectory: boolean;
  /** File size in bytes (files only) */
  size?: number;
}

/**
 * Get all files in a directory recursively
 *
 * @param rootPath - Root directory to search from
 * @param maxDepth - Maximum directory depth to traverse
 * @returns Array of file matches
 */
export async function getAllFiles(
  rootPath: string,
  maxDepth: number = 5
): Promise<FileMatch[]> {
  const files: FileMatch[] = [];

  async function traverse(currentPath: string, depth: number): Promise<void> {
    if (depth > maxDepth) return;

    try {
      const entries = await readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(currentPath, entry.name);
        const relativePath = relative(rootPath, fullPath);

        // Skip hidden files and directories
        if (entry.name.startsWith('.')) continue;

        // Skip ignored directories
        if (entry.isDirectory() && IGNORED_DIRS.has(entry.name)) continue;

        // Skip ignored extensions
        const ext = extname(entry.name).toLowerCase();
        if (!entry.isDirectory() && IGNORED_EXTENSIONS.has(ext)) continue;

        files.push({
          path: fullPath,
          relativePath,
          name: entry.name,
          isDirectory: entry.isDirectory(),
        });

        // Recurse into directories
        if (entry.isDirectory()) {
          await traverse(fullPath, depth + 1);
        }
      }
    } catch {
      // Permission denied or other error - skip directory
    }
  }

  await traverse(rootPath, 0);
  return files;
}

/**
 * Fuzzy search files by path
 *
 * @param files - Array of file matches to search
 * @param query - Search query
 * @param limit - Maximum results to return
 * @returns Filtered and sorted array of matches
 */
export function fuzzySearchFiles(
  files: readonly FileMatch[],
  query: string,
  limit: number = 20
): FileMatch[] {
  if (!query) {
    return files.slice(0, limit);
  }

  const lower = query.toLowerCase();

  // Score each file based on match quality
  const scored = files
    .map(file => {
      const searchString = file.relativePath.toLowerCase();
      let score = 0;

      // Exact match gets highest score
      if (searchString === lower) {
        score = 1000;
      }
      // Filename exact match
      else if (file.name.toLowerCase() === lower) {
        score = 900;
      }
      // Starts with query
      else if (searchString.startsWith(lower)) {
        score = 800 - searchString.length;
      }
      // Filename starts with query
      else if (file.name.toLowerCase().startsWith(lower)) {
        score = 700 - file.name.length;
      }
      // Contains query
      else if (searchString.includes(lower)) {
        score = 600 - searchString.indexOf(lower);
      }
      // Fuzzy match: all characters appear in order
      else {
        let queryIndex = 0;
        let matchScore = 0;
        for (let i = 0; i < searchString.length && queryIndex < lower.length; i++) {
          if (searchString[i] === lower[queryIndex]) {
            matchScore += 10;
            queryIndex++;
          }
        }
        if (queryIndex === lower.length) {
          score = matchScore;
        }
      }

      return { file, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(({ file }) => file);
}

/**
 * Get file preview (first N lines)
 *
 * @param filePath - Path to the file
 * @param maxLines - Maximum lines to return
 * @returns Preview string or null for binary files
 */
export async function getFilePreview(
  filePath: string,
  maxLines: number = 10
): Promise<string | null> {
  const ext = extname(filePath).toLowerCase();

  // Don't preview binary files
  if (BINARY_EXTENSIONS.has(ext)) {
    return null;
  }

  try {
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n').slice(0, maxLines);
    const hasMore = content.split('\n').length > maxLines;
    return lines.join('\n') + (hasMore ? '\n...' : '');
  } catch {
    return null;
  }
}

/**
 * Read file content for including in context
 *
 * @param filePath - Path to the file
 * @param maxSize - Maximum size in bytes (default 50KB)
 * @returns File content or truncated content
 */
export async function readFileForContext(
  filePath: string,
  maxSize: number = 50_000
): Promise<string> {
  const ext = extname(filePath).toLowerCase();

  if (BINARY_EXTENSIONS.has(ext)) {
    throw new Error(`Cannot read binary file: ${filePath}`);
  }

  try {
    const stats = await stat(filePath);

    if (stats.size > maxSize) {
      const content = await readFile(filePath, 'utf-8');
      return content.slice(0, maxSize) + '\n\n... (file truncated)';
    }

    return await readFile(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`Could not read file: ${filePath}`);
  }
}

/**
 * Check if a file is a text file that can be previewed
 */
export function isTextFile(filePath: string): boolean {
  const ext = extname(filePath).toLowerCase();
  return !BINARY_EXTENSIONS.has(ext);
}
