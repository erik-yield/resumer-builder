import { useState, useEffect, useCallback, useRef } from 'react';
import ResumeEditor from './components/ResumeEditor';
import JobDescriptionPanel from './components/JobDescriptionPanel';
import ResumePreview from './components/ResumePreview';
import StepIndicator from './components/StepIndicator';
import Toast from './components/Toast';
import LoadingOverlay from './components/LoadingOverlay';
import { loadResume, saveResume, mergeTailoredContent, defaultResume } from './data/defaultResume';
import { apiGet, apiPost } from './utils/api';
import { isResumeReady, extractJobTitle, saveJdToHistory } from './utils/helpers';
import './App.css';

export default function App() {
  const [resume, setResume] = useState(loadResume);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [error, setError] = useState('');
  const [savedPath, setSavedPath] = useState('');
  const [apiReady, setApiReady] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [previousResume, setPreviousResume] = useState(null);
  const [justGenerated, setJustGenerated] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeView, setActiveView] = useState('split');
  const previewRef = useRef(null);
  const isFirstSave = useRef(true);

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
    apiGet('/api/health')
      .then((r) => r.json())
      .then((d) => setApiReady(d.hasApiKey))
      .catch(() => setApiReady(false));
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const handleResumeChange = useCallback((updated) => {
    setResume(updated);
    setSavedPath('');
    setJustGenerated(false);
  }, []);

  const advanceLoading = (phase, delay) =>
    new Promise((r) => {
      setLoadingPhase(phase);
      setTimeout(r, delay);
    });

  const downloadResume = useCallback(async (resumeData) => {
    const jobTitle = extractJobTitle(jobDescription);
    const res = await apiPost('/api/download', { resume: resumeData, jobTitle });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Download failed');
    }

    const saved = res.headers.get('X-Saved-Path');
    if (saved) setSavedPath(saved);

    const blob = await res.blob();
    const disposition = res.headers.get('Content-Disposition') || '';
    const match = disposition.match(/filename="(.+)"/);
    const filename = match?.[1] || `Resume_${jobTitle.replace(/\s+/g, '_')}.docx`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    return filename;
  }, [jobDescription]);

  const handleGenerate = useCallback(async () => {
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
    setSavedPath('');
    setPreviousResume(structuredClone(resume));

    try {
      await advanceLoading(0, 600);
      await advanceLoading(1, 800);

      const res = await apiPost('/api/tailor', { jobDescription, resume });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');

      await advanceLoading(2, 500);
      const tailored = mergeTailoredContent(resume, data);
      setResume(tailored);
      setJustGenerated(true);
      saveJdToHistory(jobDescription);

      await advanceLoading(3, 400);
      const filename = await downloadResume(tailored);

      showToast(`Resume saved as ${filename}`);
      previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
      setPreviousResume(null);
    } finally {
      setLoading(false);
    }
  }, [resumeReady, jdReady, jobDescription, resume, downloadResume, showToast]);

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
    setSavedPath('');
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

      <header className="app-header">
        <div>
          <h1>Resume Writer</h1>
          <p>Tailor your resume for Workday ATS with Gemini</p>
        </div>
        <div className="header-actions">
          {savedFlash && <span className="save-badge">Saved</span>}
          <div className="header-badge">Workday · .docx</div>
        </div>
      </header>

      <StepIndicator step={currentStep} resumeReady={resumeReady} jdReady={jdReady} />

      <div className="view-toggle">
        <button
          type="button"
          className={activeView === 'edit' ? 'active' : ''}
          onClick={() => setActiveView('edit')}
        >
          Edit
        </button>
        <button
          type="button"
          className={activeView === 'split' ? 'active' : ''}
          onClick={() => setActiveView('split')}
        >
          Split
        </button>
        <button
          type="button"
          className={activeView === 'preview' ? 'active' : ''}
          onClick={() => setActiveView('preview')}
        >
          Preview
        </button>
      </div>

      <main className={`app-grid view-${activeView}`}>
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
            loading={loading}
            savedPath={savedPath}
            error={error}
            apiReady={apiReady}
            resumeReady={resumeReady}
            onUndo={handleUndo}
            canUndo={Boolean(previousResume)}
            justGenerated={justGenerated}
          />
        </div>
        <div className="column-preview" ref={previewRef}>
          <ResumePreview resume={resume} onChange={handleResumeChange} />
        </div>
      </main>
    </div>
  );
}
