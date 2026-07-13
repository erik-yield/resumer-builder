const STEPS = [
  'Analyzing job description…',
  'Extracting ATS keywords…',
  'Rewriting summary & bullets…',
  'Building Workday .docx…',
];

export default function LoadingOverlay({ phase }) {
  const index = Math.min(phase, STEPS.length - 1);

  return (
    <div className="loading-overlay">
      <div className="loading-card">
        <div className="spinner" />
        <p className="loading-title">Tailoring your resume</p>
        <p className="loading-step">{STEPS[index]}</p>
        <div className="loading-progress">
          {STEPS.map((step, i) => (
            <div key={step} className={`progress-dot ${i <= index ? 'active' : ''}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
