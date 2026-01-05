export const MODELS = [
  'gemini-3-flash-preview',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
] as const;

export type Model = (typeof MODELS)[number];

export const DEFAULT_MODEL: Model = 'gemini-3-flash-preview';
