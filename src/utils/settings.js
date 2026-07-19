const STORAGE_KEY = 'resume-writer-settings';

export const PROVIDERS = {
  openrouter: {
    id: 'openrouter',
    label: 'OpenRouter',
    defaultModel: 'google/gemini-2.0-flash-001',
    models: [
      'google/gemini-2.0-flash-001',
      'google/gemini-2.5-flash-preview',
      'google/gemini-flash-1.5',
      'anthropic/claude-3.5-haiku',
    ],
    keyPlaceholder: 'sk-or-v1-...',
    keyLabel: 'OpenRouter API Key',
  },
  gemini: {
    id: 'gemini',
    label: 'Google Gemini',
    defaultModel: 'gemini-2.0-flash',
    models: [
      'gemini-2.0-flash',
      'gemini-2.5-flash',
      'gemini-1.5-flash',
      'gemini-2.5-pro',
    ],
    keyPlaceholder: 'AIza...',
    keyLabel: 'Gemini API Key',
  },
};

export const DEFAULT_PROVIDER = 'openrouter';
export const DEFAULT_MODEL = PROVIDERS.openrouter.defaultModel;
export const DEFAULT_GEMINI_MODEL = PROVIDERS.gemini.defaultModel;
export const MODEL_SUGGESTIONS = PROVIDERS.openrouter.models;

const DEFAULT_SETTINGS = {
  provider: DEFAULT_PROVIDER,
  apiKey: '',
  geminiApiKey: '',
  model: DEFAULT_MODEL,
  geminiModel: DEFAULT_GEMINI_MODEL,
};

export function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const provider =
        parsed.provider === 'gemini' || parsed.provider === 'openrouter'
          ? parsed.provider
          : DEFAULT_PROVIDER;
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        provider,
        geminiApiKey: parsed.geminiApiKey || '',
        geminiModel: parsed.geminiModel || DEFAULT_GEMINI_MODEL,
        model: parsed.model || DEFAULT_MODEL,
      };
    }
  } catch {
    /* use default */
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function getActiveApiKey(settings) {
  if (settings.provider === 'gemini') {
    return settings.geminiApiKey?.trim() || '';
  }
  return settings.apiKey?.trim() || '';
}

export function getActiveModel(settings) {
  if (settings.provider === 'gemini') {
    return settings.geminiModel?.trim() || DEFAULT_GEMINI_MODEL;
  }
  return settings.model?.trim() || DEFAULT_MODEL;
}

export function isApiReady(settings) {
  return Boolean(getActiveApiKey(settings));
}

export function getProviderLabel(provider) {
  return PROVIDERS[provider]?.label || PROVIDERS.openrouter.label;
}
