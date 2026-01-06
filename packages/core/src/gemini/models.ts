export const MODELS = [
  'gemini-3-pro-preview',
  'gemini-3-pro-image-preview',
  'gemini-3-flash-preview',
  'gemini-2.5-pro',
  'gemini-2.5-pro-preview-tts',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash-image',
  'gemini-2.5-flash-preview-09-2025',
  'gemini-2.5-flash-lite-preview-09-2025',
  'gemini-2.5-flash-native-audio-preview-12-2025',
  'gemini-2.5-flash-preview-tts',
  'gemini-2.0-flash',
  'gemini-2.0-flash-001',
  'gemini-2.0-flash-exp',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash-lite-001',
  'gemini-2.0-flash-preview-image-generation',
] as const;

export type Model = (typeof MODELS)[number];

export const DEFAULT_MODEL: Model = 'gemini-3-flash-preview';
