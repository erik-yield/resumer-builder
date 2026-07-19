import { useState, useEffect, useCallback, useRef } from 'react';
import ResumeEditor from './components/ResumeEditor';
import JobDescriptionPanel from './components/JobDescriptionPanel';
import ResumePreview from './components/ResumePreview';
import StepIndicator from './components/StepIndicator';
import Toast from './components/Toast';
import LoadingOverlay from './components/LoadingOverlay';
import SettingsModal from './components/SettingsModal';
import { loadResume, saveResume, mergeTailoredContent, defaultResume } from './data/defaultResume';
import { loadSettings, saveSettings, isApiReady, getActiveModel, getProviderLabel } from './utils/settings';
import { generateTailoredContent } from './utils/llm';
import { exportResume } from './utils/exportResume';
import { loadDownloadFormat, saveDownloadFormat } from './utils/download';
import { isResumeReady, extractJobTitle, saveJdToHistory } from './utils/helpers';
import './App.css';

export default function App() {
  const [resume, setResume] = useState(loadResume);
  const [settings, setSettings] = useState(loadSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [error, setError] = useState('');
  const [lastFilename, setLastFilename] = useState('');
  const [savedFlash, setSavedFlash] = useState(false);
  const [previousResume, setPreviousResume] = useState(null);
  const [justGenerated, setJustGenerated] = useState(false);
  const [toast, setToast] = useState(null);
  const [downloadFormat, setDownloadFormat] = useState(loadDownloadFormat);
  const previewRef = useRef(null);
  const isFirstSave = useRef(true);

  const apiReady = isApiReady(settings);
  const resumeReady = isResumeReady(resume);
  const jdReady = jobDescription.trim().length > 80;
  const currentStep = justGenerated ? 3 : jdReady ? 2 : resumeReady ? 2 : 1;

  useEffect(() => {
    saveResume(resume);
    if (isFirstSave.current) {
      isFirstSave.current = false;
      return;
    }
    setSavedFlash(true);
    const t = setTimeout(() => setSavedFlash(false), 1500);
    return () => clearTimeout(t);
  }, [resume]);

  useEffect(() => {
    if (!apiReady) setShowSettings(true);
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const handleSettingsSave = (next) => {
    setSettings(next);
    saveSettings(next);
    showToast('Settings saved');
  };

  const handleResumeChange = useCallback((updated) => {
    setResume(updated);
    setLastFilename('');
    setJustGenerated(false);
  }, []);

  const advanceLoading = (phase, delay) =>
    new Promise((r) => {
      setLoadingPhase(phase);
      setTimeout(r, delay);
    });

  const downloadResume = useCallback(async (resumeData) => {
    const jobTitle = extractJobTitle(jobDescription);
    const filename = await exportResume(resumeData, jobTitle, downloadFormat);
    setLastFilename(filename);
    return filename;
  }, [jobDescription, downloadFormat]);

  const handleDownloadFormatChange = (format) => {
    setDownloadFormat(format);
    saveDownloadFormat(format);
  };

  const handleGenerate = useCallback(async () => {
    if (!apiReady) {
      setShowSettings(true);
      setError(`Add your ${getProviderLabel(settings.provider)} API key in Settings.`);
      showToast('Add your API key in Settings', 'error');
      return;
    }
    if (!resumeReady) {
      setError('Fill in your name, email, and at least one experience role with bullets.');
      showToast('Complete your base resume first', 'error');
      return;
    }
    if (!jdReady) {
      setError('Paste a full job description (at least 80 characters).');
      return;
    }

    setLoading(true);
    setLoadingPhase(0);
    setError('');
    setLastFilename('');
    setPreviousResume(structuredClone(resume));

    try {
      await advanceLoading(0, 600);
      await advanceLoading(1, 800);

      const data = await generateTailoredContent(jobDescription, resume, settings);

      await advanceLoading(2, 500);
      const tailored = mergeTailoredContent(resume, data);
      setResume(tailored);
      setJustGenerated(true);
      saveJdToHistory(jobDescription);

      await advanceLoading(3, 400);
      const filename = await downloadResume(tailored);

      showToast(`Downloaded ${filename}`);
      previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
      setPreviousResume(null);
    } finally {
      setLoading(false);
    }
  }, [apiReady, resumeReady, jdReady, jobDescription, resume, settings, downloadResume, showToast]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !loading && jdReady && apiReady) {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleGenerate, loading, jdReady, apiReady]);

  const handleDownload = async () => {
    setError('');
    setLastFilename('');
    setLoading(true);
    setLoadingPhase(3);
    try {
      const filename = await downloadResume(resume);
      showToast(`Downloaded ${filename}`);
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUndo = () => {
    if (previousResume) {
      setResume(previousResume);
      setPreviousResume(null);
      setJustGenerated(false);
      showToast('Reverted to previous version');
    }
  };

  const handleResetResume = () => {
    if (window.confirm('Reset resume to default template? This cannot be undone.')) {
      setResume(structuredClone(defaultResume));
      setPreviousResume(null);
      setJustGenerated(false);
      showToast('Resume reset to template');
    }
  };

  return (
    <div className="app">
      {loading && <LoadingOverlay phase={loadingPhase} />}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={handleSettingsSave}
          onClose={() => setShowSettings(false)}
        />
      )}

      <header className="app-header">
        <div>
          <h1>Resume Writer</h1>
          <p>Tailor your resume for Workday ATS with Gemini</p>
        </div>
        <div className="header-actions">
          {savedFlash && <span className="save-badge">Saved</span>}
          <button
            type="button"
            className={`btn btn-secondary btn-sm ${!apiReady ? 'btn-attention' : ''}`}
            onClick={() => setShowSettings(true)}
          >
            Settings
          </button>
          <div className="header-badge">Workday · .docx</div>
        </div>
      </header>

      <StepIndicator step={currentStep} resumeReady={resumeReady} jdReady={jdReady} />

      <main className="app-grid view-split">
        <div className="column-edit">
          <ResumeEditor
            resume={resume}
            onChange={handleResumeChange}
            onReset={handleResetResume}
            resumeReady={resumeReady}
          />
          <JobDescriptionPanel
            jobDescription={jobDescription}
            onJobDescriptionChange={(v) => {
              setJobDescription(v);
              setJustGenerated(false);
            }}
            onGenerate={handleGenerate}
            onDownload={handleDownload}
            onOpenSettings={() => setShowSettings(true)}
            downloadFormat={downloadFormat}
            onDownloadFormatChange={handleDownloadFormatChange}
            loading={loading}
            lastFilename={lastFilename}
            error={error}
            apiReady={apiReady}
            resumeReady={resumeReady}
            onUndo={handleUndo}
            canUndo={Boolean(previousResume)}
            justGenerated={justGenerated}
            modelName={getActiveModel(settings)}
            providerLabel={getProviderLabel(settings.provider)}
          />
        </div>
        <div className="column-preview" ref={previewRef}>
          <ResumePreview resume={resume} onChange={handleResumeChange} />
        </div>
      </main>
    </div>
  );
}
