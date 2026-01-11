import { readFile, writeFile, chmod } from 'node:fs/promises';
import { ok, err, type Result } from '@stargazer/core';
import { getConfigPath, ensureStorageStructure } from './paths.js';
import { type Provider, DEFAULT_TIMEOUT, getDefaultModel, getSecondaryModel } from '../config/defaults.js';

export type { Provider };
export { getDefaultModel, getSecondaryModel };

interface StoredConfig {
  apiKey?: string;
  savedAt?: string;
  timeout?: number;
  provider?: Provider;
  selectedModel?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Config Reading Helper
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Read a single field from the config file with a default value.
 * Reduces code duplication across getter functions.
 */
async function readConfigField<K extends keyof StoredConfig>(
  field: K,
  defaultValue: StoredConfig[K],
): Promise<StoredConfig[K]> {
  try {
    const configPath = getConfigPath();
    const content = await readFile(configPath, 'utf-8');
    const config: StoredConfig = JSON.parse(content);
    return config[field] ?? defaultValue;
  } catch {
    return defaultValue;
  }
}

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
    // Silent fail - unexpected config read errors should not spam output
    // The null return signals the error condition to callers
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
  // DEFAULT_TIMEOUT guarantees non-undefined return
  return (await readConfigField('timeout', DEFAULT_TIMEOUT)) ?? DEFAULT_TIMEOUT;
}

export async function saveTimeout(timeout: number): Promise<Result<void>> {
  return saveConfigField('timeout', timeout);
}

// ═══════════════════════════════════════════════════════════════════════════
// Provider & Model Storage
// ═══════════════════════════════════════════════════════════════════════════

export async function getProvider(): Promise<Provider | undefined> {
  return readConfigField('provider', undefined);
}

export async function saveProvider(provider: Provider): Promise<Result<void>> {
  return saveConfigField('provider', provider);
}

export async function getSelectedModel(): Promise<string | undefined> {
  return readConfigField('selectedModel', undefined);
}

export async function saveSelectedModel(model: string): Promise<Result<void>> {
  return saveConfigField('selectedModel', model);
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
