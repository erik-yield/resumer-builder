import { useState } from 'react';
import { MODEL_SUGGESTIONS, DEFAULT_MODEL } from '../utils/settings';

export default function SettingsModal({ settings, onSave, onClose }) {
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [model, setModel] = useState(settings.model || DEFAULT_MODEL);
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    onSave({ apiKey: apiKey.trim(), model: model.trim() || DEFAULT_MODEL });
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
          Your API key is stored only in this browser (localStorage). It is sent directly to OpenRouter.
        </p>

        <label className="field">
          <span className="field-label">OpenRouter API Key</span>
          <div className="input-with-action">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              autoComplete="off"
            />
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowKey(!showKey)}>
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>

        <label className="field">
          <span className="field-label">Model name</span>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder={DEFAULT_MODEL}
            list="model-suggestions"
          />
          <datalist id="model-suggestions">
            {MODEL_SUGGESTIONS.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
          <span className="field-hint">e.g. google/gemini-2.0-flash-001</span>
        </label>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={!apiKey.trim()}>
            Save settings
          </button>
        </div>
      </div>
    </div>
  );
}
