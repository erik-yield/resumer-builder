import { useState } from 'react';
import { countJdWords, loadJdHistory } from '../utils/helpers';

export default function JobDescriptionPanel({
  jobDescription,
  onJobDescriptionChange,
  onGenerate,
  onDownload,
  onOpenSettings,
  loading,
  lastFilename,
  error,
  apiReady,
  resumeReady,
  onUndo,
  canUndo,
  justGenerated,
  modelName,
}) {
  const [showHistory, setShowHistory] = useState(false);
  const history = loadJdHistory();
  const wordCount = countJdWords(jobDescription);
  const charCount = jobDescription.length;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) onJobDescriptionChange(text);
    } catch {
      /* clipboard denied */
    }
  };

  return (
    <div className="panel jd-panel">
      <div className="panel-top">
        <div>
          <h2>Job Description</h2>
          <p className="panel-desc">
            Paste the JD — Gemini rewrites Summary & Experience bullets only.
          </p>
        </div>
        {justGenerated && <span className="status-pill status-generated">Tailored</span>}
      </div>

      {!apiReady && (
        <div className="alert alert-warn">
          Open <button type="button" className="link-btn" onClick={onOpenSettings}>Settings</button> and add your OpenRouter API key.
        </div>
      )}

      {apiReady && (
        <div className="model-badge">
          Model: <code>{modelName}</code>
        </div>
      )}

      {!resumeReady && (
        <div className="alert alert-warn">
          Complete your name, email, and at least one experience role before generating.
        </div>
      )}

      <div className="jd-toolbar">
        <button type="button" className="btn btn-ghost btn-sm" onClick={handlePaste}>
          Paste from clipboard
        </button>
        {jobDescription && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onJobDescriptionChange('')}>
            Clear
          </button>
        )}
        {history.length > 0 && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? 'Hide history' : `History (${history.length})`}
          </button>
        )}
        <span className="jd-stats">{wordCount} words · {charCount} chars</span>
      </div>

      {showHistory && (
        <div className="jd-history">
          {history.map((item, i) => (
            <button
              key={i}
              type="button"
              className="history-item"
              onClick={() => {
                onJobDescriptionChange(item.text);
                setShowHistory(false);
              }}
            >
              <strong>{item.title}</strong>
              <span>{new Date(item.date).toLocaleDateString()}</span>
            </button>
          ))}
        </div>
      )}

      <textarea
        className="jd-textarea"
        value={jobDescription}
        onChange={(e) => onJobDescriptionChange(e.target.value)}
        placeholder="Paste the full job description here…&#10;&#10;Include requirements, responsibilities, and tech stack for best keyword matching."
        rows={12}
      />

      <div className="action-bar">
        <div className="action-row">
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={onGenerate}
            disabled={loading || !jobDescription.trim() || !apiReady}
          >
            {loading ? 'Working…' : 'Generate ATS Resume'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onDownload} disabled={loading}>
            Download .docx
          </button>
          {canUndo && (
            <button type="button" className="btn btn-secondary" onClick={onUndo} disabled={loading}>
              Undo tailor
            </button>
          )}
        </div>
        <span className="shortcut-hint">Ctrl + Enter to generate</span>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {lastFilename && (
        <div className="alert alert-success">
          Downloaded: <code>{lastFilename}</code>
        </div>
      )}
    </div>
  );
}
