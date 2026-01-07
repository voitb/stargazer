import { homedir } from 'node:os';
import { join } from 'node:path';
import { mkdir } from 'node:fs/promises';

export function getStargazerDir(): string {
  return join(homedir(), '.stargazer');
}

export function getSessionsDir(): string {
  return join(getStargazerDir(), 'sessions');
}

export function getSessionDir(sessionId: string): string {
  return join(getSessionsDir(), sessionId);
}

export function getSessionIndexPath(): string {
  return join(getSessionsDir(), 'index.json');
}

export function getConfigPath(): string {
  return join(getStargazerDir(), 'config.json');
}

export async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

export async function ensureStorageStructure(): Promise<void> {
  await ensureDir(getStargazerDir());
  await ensureDir(getSessionsDir());
}
