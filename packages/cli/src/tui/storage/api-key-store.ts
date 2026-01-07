import { readFile, writeFile, chmod } from 'node:fs/promises';
import { ok, err, type Result } from '@stargazer/core';
import { getConfigPath, ensureStorageStructure } from './paths.js';

export type Provider = 'gemini' | 'glm';

interface StoredConfig {
  apiKey?: string;
  savedAt?: string;
  timeout?: number;
  provider?: Provider;
  selectedModel?: string;
}

const DEFAULT_TIMEOUT = 60000;
const DEFAULT_GEMINI_MODEL = 'gemini-3-flash-preview';
const DEFAULT_GLM_MODEL = 'glm-4-flash';

export async function getApiKey(): Promise<string | null> {
  const envKey = process.env['GEMINI_API_KEY'] || process.env['GOOGLE_API_KEY'];
  if (envKey) return envKey;

  try {
    const configPath = getConfigPath();
    const content = await readFile(configPath, 'utf-8');
    const config: StoredConfig = JSON.parse(content);
    return config.apiKey || null;
  } catch (e) {
    if (e instanceof Error && 'code' in e && (e as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    console.error('Error reading API key config:', e);
    return null;
  }
}

export async function saveApiKey(apiKey: string): Promise<Result<void>> {
  try {
    await ensureStorageStructure();
    const configPath = getConfigPath();

    let existingConfig: StoredConfig = {};
    try {
      const content = await readFile(configPath, 'utf-8');
      existingConfig = JSON.parse(content);
    } catch {
      // File doesn't exist yet, start fresh
    }

    const config: StoredConfig = {
      ...existingConfig,
      apiKey,
      savedAt: new Date().toISOString(),
    };

    await writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
    await chmod(configPath, 0o600);

    return ok(undefined);
  } catch (error) {
    return err({
      code: 'API_ERROR',
      message: `Failed to save API key: ${error}`,
    });
  }
}

export async function hasApiKey(): Promise<boolean> {
  const key = await getApiKey();
  return key !== null && key.length > 0;
}

export async function clearApiKey(): Promise<Result<void>> {
  try {
    const configPath = getConfigPath();
    await writeFile(configPath, JSON.stringify({}, null, 2), 'utf-8');
    return ok(undefined);
  } catch (error) {
    return err({
      code: 'API_ERROR',
      message: `Failed to clear API key: ${error}`,
    });
  }
}

export function maskApiKey(key: string): string {
  if (key.length <= 10) return '***';
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}

export async function getTimeout(): Promise<number> {
  try {
    const configPath = getConfigPath();
    const content = await readFile(configPath, 'utf-8');
    const config: StoredConfig = JSON.parse(content);
    return config.timeout ?? DEFAULT_TIMEOUT;
  } catch {
    return DEFAULT_TIMEOUT;
  }
}

export async function saveTimeout(timeout: number): Promise<Result<void>> {
  return saveConfigField('timeout', timeout);
}

// ═══════════════════════════════════════════════════════════════════════════
// Provider & Model Storage
// ═══════════════════════════════════════════════════════════════════════════

export async function getProvider(): Promise<Provider | undefined> {
  try {
    const configPath = getConfigPath();
    const content = await readFile(configPath, 'utf-8');
    const config: StoredConfig = JSON.parse(content);
    return config.provider;
  } catch {
    return undefined;
  }
}

export async function saveProvider(provider: Provider): Promise<Result<void>> {
  return saveConfigField('provider', provider);
}

export async function getSelectedModel(): Promise<string | undefined> {
  try {
    const configPath = getConfigPath();
    const content = await readFile(configPath, 'utf-8');
    const config: StoredConfig = JSON.parse(content);
    return config.selectedModel;
  } catch {
    return undefined;
  }
}

export async function saveSelectedModel(model: string): Promise<Result<void>> {
  return saveConfigField('selectedModel', model);
}

export function getDefaultModel(provider: Provider): string {
  return provider === 'gemini' ? DEFAULT_GEMINI_MODEL : DEFAULT_GLM_MODEL;
}

export function getSecondaryModel(provider: Provider): string {
  return provider === 'gemini' ? 'gemini-2.5-flash' : 'glm-4.5-flash';
}

// ═══════════════════════════════════════════════════════════════════════════
// Helper: Save a single config field while preserving others
// ═══════════════════════════════════════════════════════════════════════════

async function saveConfigField<K extends keyof StoredConfig>(
  field: K,
  value: StoredConfig[K],
): Promise<Result<void>> {
  try {
    await ensureStorageStructure();
    const configPath = getConfigPath();

    let existingConfig: StoredConfig = {};
    try {
      const content = await readFile(configPath, 'utf-8');
      existingConfig = JSON.parse(content);
    } catch {
      // File doesn't exist yet, start fresh
    }

    const config: StoredConfig = {
      ...existingConfig,
      [field]: value,
    };

    await writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
    await chmod(configPath, 0o600);

    return ok(undefined);
  } catch (error) {
    return err({
      code: 'API_ERROR',
      message: `Failed to save ${field}: ${error}`,
    });
  }
}
