import { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { Select } from '@inkjs/ui';
import { useAppContext } from '../state/app-context.js';
import {
  saveSelectedModel,
  getDefaultModel,
  getProvider,
  type Provider,
} from '../storage/api-key-store.js';

// ═══════════════════════════════════════════════════════════════════════════
// GEMINI MODELS - Google AI
// ═══════════════════════════════════════════════════════════════════════════
const GEMINI_MODELS = [
  // === FREE TIER (Recommended) ===
  { label: '⚡ Gemini 3 Flash Preview (Recommended, Free)', value: 'gemini-3-flash-preview' },
  { label: '🚀 Gemini 2.5 Flash (Free)', value: 'gemini-2.5-flash' },
  { label: '💨 Gemini 2.5 Flash Lite (Free, Lightweight)', value: 'gemini-2.5-flash-lite' },
  { label: '⚡ Gemini 2.0 Flash (Free)', value: 'gemini-2.0-flash' },
  { label: '💨 Gemini 2.0 Flash Lite (Free, Lightweight)', value: 'gemini-2.0-flash-lite' },

  // === PAID TIER ===
  { label: '💎 Gemini 3 Pro Preview (Paid)', value: 'gemini-3-pro-preview' },
  { label: '💎 Gemini 2.5 Pro (Paid)', value: 'gemini-2.5-pro' },

  // === EXPERIMENTAL/PREVIEW ===
  { label: '🧪 Gemini 2.5 Pro Experimental (Free)', value: 'gemini-2.5-pro-exp-03-25' },
  { label: '🖼️ Gemini 3 Pro Image Preview (Paid)', value: 'gemini-3-pro-image-preview' },
  { label: '🖼️ Gemini 2.5 Flash Image (Free)', value: 'gemini-2.5-flash-image' },
  { label: '🔊 Gemini 2.5 Flash Native Audio (Free)', value: 'gemini-2.5-flash-native-audio-preview-12-2025' },
  { label: '🗣️ Gemini 2.5 Flash TTS (Free)', value: 'gemini-2.5-flash-preview-tts' },
  { label: '🗣️ Gemini 2.5 Pro TTS (Paid)', value: 'gemini-2.5-pro-preview-tts' },
];

// ═══════════════════════════════════════════════════════════════════════════
// GLM MODELS - ZhipuAI
// ═══════════════════════════════════════════════════════════════════════════
const GLM_MODELS = [
  // === LATEST (GLM-4.7) ===
  { label: '🌟 GLM-4.7 (Latest Flagship, 200K context)', value: 'glm-4.7' },

  // === GLM-4.5 Series ===
  { label: '💎 GLM-4.5 (Premium)', value: 'glm-4.5' },
  { label: '✈️ GLM-4.5-Air (Lightweight)', value: 'glm-4.5-air' },
  { label: '⚡ GLM-4.5-AirX (Fast Air)', value: 'glm-4.5-airx' },
  { label: '🚀 GLM-4.5-Flash (Fast)', value: 'glm-4.5-flash' },

  // === GLM-4 Series ===
  { label: '💎 GLM-4-Plus (Premium)', value: 'glm-4-plus' },
  { label: '📚 GLM-4-Long (Long Context)', value: 'glm-4-long' },
  { label: '✈️ GLM-4-Air (Lightweight)', value: 'glm-4-air' },
  { label: '⚡ GLM-4-AirX (Fast Air)', value: 'glm-4-airx' },
  { label: '🚀 GLM-4-Flash (Recommended, Fast & Free)', value: 'glm-4-flash' },
  { label: '⚡ GLM-4-FlashX (Ultra-fast)', value: 'glm-4-flashx' },

  // === Vision Models ===
  { label: '👁️ GLM-4.6V (Vision, 106B)', value: 'glm-4.6v' },
  { label: '👁️ GLM-4.6V-Flash (Vision Fast, 9B)', value: 'glm-4.6v-flash' },
];

export function ModelSelectScreen() {
  const { navigate } = useAppContext();
  const [provider, setProvider] = useState<Provider>('gemini');

  // Load saved provider on mount
  useEffect(() => {
    getProvider().then(p => setProvider(p || 'gemini'));
  }, []);

  const models = provider === 'gemini' ? GEMINI_MODELS : GLM_MODELS;
  const defaultModel = getDefaultModel(provider);

  const handleSelect = async (value: string) => {
    await saveSelectedModel(value);
    navigate('home');
  };

  const handleSkip = async () => {
    await saveSelectedModel(defaultModel);
    navigate('home');
  };

  useInput((input, key) => {
    if (key.escape) {
      handleSkip();
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>Select AI Model</Text>
      <Text dimColor>
        Provider: {provider === 'gemini' ? 'Google Gemini' : 'ZhipuAI GLM'}
      </Text>
      <Text dimColor>
        Press ESC to use default ({defaultModel})
      </Text>
      <Box marginTop={1}>
        <Select options={models} onChange={handleSelect} />
      </Box>
    </Box>
  );
}
