export default function StepIndicator({ step, resumeReady, jdReady }) {
  const steps = [
    { id: 1, label: 'Fill resume', done: resumeReady },
    { id: 2, label: 'Paste job description', done: jdReady },
    { id: 3, label: 'Generate & download', done: false },
  ];

  return (
    <div className="step-indicator">
      {steps.map((s, i) => (
        <div key={s.id} className={`step-item ${step >= s.id ? 'active' : ''} ${s.done ? 'done' : ''}`}>
          <div className="step-circle">
            {s.done ? '✓' : s.id}
          </div>
          <span className="step-label">{s.label}</span>
          {i < steps.length - 1 && <div className="step-line" />}
        </div>
      ))}
    </div>
  );
}
