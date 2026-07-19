import { useState } from 'react';
import {
  PROVIDERS,
  DEFAULT_PROVIDER,
  DEFAULT_MODEL,
  DEFAULT_GEMINI_MODEL,
} from '../utils/settings';

export default function SettingsModal({ settings, onSave, onClose }) {
  const [provider, setProvider] = useState(settings.provider || DEFAULT_PROVIDER);
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [geminiApiKey, setGeminiApiKey] = useState(settings.geminiApiKey || '');
  const [model, setModel] = useState(settings.model || DEFAULT_MODEL);
  const [geminiModel, setGeminiModel] = useState(settings.geminiModel || DEFAULT_GEMINI_MODEL);
  const [showKey, setShowKey] = useState(false);

  const isGemini = provider === 'gemini';
  const providerMeta = PROVIDERS[provider] || PROVIDERS.openrouter;
  const activeKey = isGemini ? geminiApiKey : apiKey;
  const activeModel = isGemini ? geminiModel : model;
  const setActiveKey = isGemini ? setGeminiApiKey : setApiKey;
  const setActiveModel = isGemini ? setGeminiModel : setModel;

  const handleProviderChange = (next) => {
    setProvider(next);
    setShowKey(false);
  };

  const handleSave = () => {
    onSave({
      provider,
      apiKey: apiKey.trim(),
      geminiApiKey: geminiApiKey.trim(),
      model: model.trim() || DEFAULT_MODEL,
      geminiModel: geminiModel.trim() || DEFAULT_GEMINI_MODEL,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settings</h2>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <p className="modal-desc">
          Your API keys are stored only in this browser (localStorage). They are sent directly to the
          selected provider.
        </p>

        <div className="field">
          <span className="field-label">Provider</span>
          <div className="provider-toggle" role="group" aria-label="LLM provider">
            {Object.values(PROVIDERS).map((p) => (
              <button
                key={p.id}
                type="button"
                className={`provider-option ${provider === p.id ? 'active' : ''}`}
                onClick={() => handleProviderChange(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <label className="field">
          <span className="field-label">{providerMeta.keyLabel}</span>
          <div className="input-with-action">
            <input
              type={showKey ? 'text' : 'password'}
              value={activeKey}
              onChange={(e) => setActiveKey(e.target.value)}
              placeholder={providerMeta.keyPlaceholder}
              autoComplete="off"
            />
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowKey(!showKey)}>
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
          {isGemini && (
            <span className="field-hint">
              Get a key from{' '}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">
                Google AI Studio
              </a>
            </span>
          )}
        </label>

        <label className="field">
          <span className="field-label">Model name</span>
          <input
            type="text"
            value={activeModel}
            onChange={(e) => setActiveModel(e.target.value)}
            placeholder={providerMeta.defaultModel}
            list={`model-suggestions-${provider}`}
          />
          <datalist id={`model-suggestions-${provider}`}>
            {providerMeta.models.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
          <span className="field-hint">e.g. {providerMeta.defaultModel}</span>
        </label>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={!activeKey.trim()}>
            Save settings
          </button>
        </div>
      </div>
    </div>
  );
}
