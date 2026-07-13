const STORAGE_KEY = 'resume-writer-settings';

export const DEFAULT_MODEL = 'google/gemini-2.0-flash-001';

export const MODEL_SUGGESTIONS = [
  'google/gemini-2.0-flash-001',
  'google/gemini-2.5-flash-preview',
  'google/gemini-flash-1.5',
  'anthropic/claude-3.5-haiku',
];

export function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    /* use default */
  }
  return { apiKey: '', model: DEFAULT_MODEL };
}

export function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function isApiReady(settings) {
  return Boolean(settings.apiKey?.trim());
}
