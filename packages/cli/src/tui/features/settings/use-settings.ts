import { useState, useEffect, useCallback } from 'react';
import {
  getApiKey,
  clearApiKey,
  maskApiKey,
  getTimeout,
  saveTimeout,
  getProvider,
  getSelectedModel,
  type Provider,
} from '../../storage/api-key-store.js';

export type SettingsModal = 'none' | 'timeout' | 'confirm-clear';

export interface UseSettingsReturn {
  // State
  keyStatus: string;
  timeoutValue: number;
  currentProvider: Provider | undefined;
  currentModel: string | undefined;
  modal: SettingsModal;
  // Actions
  showTimeoutModal: () => void;
  showConfirmClearModal: () => void;
  closeModal: () => void;
  handleTimeoutSelect: (value: string) => Promise<void>;
  handleConfirmClear: () => Promise<{ success: boolean }>;
  // Derived
  providerDisplayName: string;
  modelDisplayName: string;
}

/**
 * Get display name for a provider.
 */
function getProviderDisplayName(provider: Provider | undefined): string {
  if (!provider) return 'Not configured';
  return provider === 'gemini' ? 'Google Gemini' : 'ZhipuAI GLM';
}

/**
 * Format model name for display (truncate if too long).
 */
function formatModelName(model: string | undefined): string {
  if (!model) return 'Not selected';
  if (model.length > 30) {
    return model.slice(0, 27) + '...';
  }
  return model;
}

/**
 * Hook for managing settings screen state and actions.
 */
export function useSettings(): UseSettingsReturn {
  const [keyStatus, setKeyStatus] = useState<string>('Checking...');
  const [timeoutValue, setTimeoutValue] = useState<number>(60000);
  const [currentProvider, setCurrentProvider] = useState<Provider | undefined>(undefined);
  const [currentModel, setCurrentModel] = useState<string | undefined>(undefined);
  const [modal, setModal] = useState<SettingsModal>('none');

  // Load all settings on mount
  useEffect(() => {
    Promise.all([getApiKey(), getTimeout(), getProvider(), getSelectedModel()])
      .then(([key, timeout, provider, model]) => {
        setKeyStatus(key ? `Configured (${maskApiKey(key)})` : 'Not configured');
        setTimeoutValue(timeout);
        setCurrentProvider(provider);
        setCurrentModel(model);
      })
      .catch(() => setKeyStatus('Error loading settings'));
  }, []);

  const showTimeoutModal = useCallback(() => setModal('timeout'), []);
  const showConfirmClearModal = useCallback(() => setModal('confirm-clear'), []);
  const closeModal = useCallback(() => setModal('none'), []);

  const handleTimeoutSelect = useCallback(async (value: string) => {
    if (value === 'cancel') {
      setModal('none');
      return;
    }
    const timeout = parseInt(value, 10);
    await saveTimeout(timeout);
    setTimeoutValue(timeout);
    setModal('none');
  }, []);

  const handleConfirmClear = useCallback(async () => {
    const result = await clearApiKey();
    if (result.ok) {
      return { success: true };
    }
    setKeyStatus('Error clearing key');
    return { success: false };
  }, []);

  return {
    // State
    keyStatus,
    timeoutValue,
    currentProvider,
    currentModel,
    modal,
    // Actions
    showTimeoutModal,
    showConfirmClearModal,
    closeModal,
    handleTimeoutSelect,
    handleConfirmClear,
    // Derived
    providerDisplayName: getProviderDisplayName(currentProvider),
    modelDisplayName: formatModelName(currentModel),
  };
}
