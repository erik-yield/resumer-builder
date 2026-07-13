import { useState } from 'react';

function Field({ label, value, onChange, multiline = false, rows = 3, placeholder, hint }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

function BulletEditor({ bullets, onChange }) {
  const update = (index, value) => {
    const next = [...bullets];
    next[index] = value;
    onChange(next);
  };

  const add = () => onChange([...bullets, '']);
  const remove = (index) => onChange(bullets.filter((_, i) => i !== index));

  const moveUp = (index) => {
    if (index === 0) return;
    const next = [...bullets];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  };

  return (
    <div className="bullet-editor">
      {bullets.map((bullet, i) => (
        <div key={i} className="bullet-row">
          <div className="bullet-controls">
            <button type="button" className="btn-icon-sm" onClick={() => moveUp(i)} disabled={i === 0} title="Move up">
              ↑
            </button>
          </div>
          <textarea
            value={bullet}
            onChange={(e) => update(i, e.target.value)}
            rows={2}
            placeholder="Action + Tool + Scope → Impact"
          />
          <button type="button" className="btn-icon" onClick={() => remove(i)} title="Remove">
            ×
          </button>
        </div>
      ))}
      <button type="button" className="btn btn-ghost btn-sm" onClick={add}>
        + Add bullet
      </button>
    </div>
  );
}

export default function ResumeEditor({ resume, onChange, onReset, resumeReady }) {
  const [tab, setTab] = useState('contact');

  const update = (field, value) => onChange({ ...resume, [field]: value });

  const updateExperience = (index, field, value) => {
    const experience = [...resume.experience];
    experience[index] = { ...experience[index], [field]: value };
    onChange({ ...resume, experience });
  };

  const addExperience = () => {
    onChange({
      ...resume,
      experience: [
        ...resume.experience,
        {
          id: `exp-${Date.now()}`,
          title: '',
          company: '',
          startDate: '',
          endDate: '',
          bullets: [''],
        },
      ],
    });
    setTab('experience');
  };

  const removeExperience = (index) => {
    if (!window.confirm('Remove this role?')) return;
    onChange({
      ...resume,
      experience: resume.experience.filter((_, i) => i !== index),
    });
  };

  const updateEducation = (index, field, value) => {
    const education = [...resume.education];
    education[index] = { ...education[index], [field]: value };
    onChange({ ...resume, education });
  };

  const addEducation = () => {
    onChange({
      ...resume,
      education: [
        ...resume.education,
        { id: `edu-${Date.now()}`, degree: '', field: '', school: '', date: '' },
      ],
    });
  };

  const updateCert = (index, field, value) => {
    const certifications = [...resume.certifications];
    certifications[index] = { ...certifications[index], [field]: value };
    onChange({ ...resume, certifications });
  };

  const addCert = () => {
    onChange({
      ...resume,
      certifications: [
        ...resume.certifications,
        { id: `cert-${Date.now()}`, name: '', date: '' },
      ],
    });
  };

  const tabStatus = {
    contact: Boolean(resume.name?.trim() && resume.email?.trim()),
    summary: Boolean(resume.summary?.trim()),
    skills: resume.skills?.length > 0,
    experience: resume.experience?.some((e) => e.title && e.bullets?.some((b) => b.trim())),
    education: resume.education?.some((e) => e.degree && e.school),
    certs: resume.certifications?.length > 0,
  };

  const tabs = [
    { id: 'contact', label: 'Contact' },
    { id: 'summary', label: 'Summary' },
    { id: 'skills', label: 'Skills' },
    { id: 'experience', label: 'Experience' },
    { id: 'education', label: 'Education' },
    { id: 'certs', label: 'Certs' },
  ];

  return (
    <div className="panel editor-panel">
      <div className="panel-top">
        <div>
          <h2>Base Resume</h2>
          <p className="panel-desc">
            Set once — only Summary & bullets change per job.
          </p>
        </div>
        <div className="panel-top-actions">
          {resumeReady && <span className="status-pill status-ok">Ready</span>}
          <button type="button" className="btn btn-ghost btn-sm" onClick={onReset}>
            Reset
          </button>
        </div>
      </div>

      <div className="tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab ${tab === t.id ? 'active' : ''} ${tabStatus[t.id] ? 'filled' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            {tabStatus[t.id] && <span className="tab-dot" />}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {tab === 'contact' && (
          <>
            <Field label="Full Name" value={resume.name} onChange={(v) => update('name', v)} placeholder="John Smith" />
            <Field label="Email" value={resume.email} onChange={(v) => update('email', v)} placeholder="john@email.com" />
            <Field label="Phone" value={resume.phone} onChange={(v) => update('phone', v)} placeholder="(555) 123-4567" />
            <Field label="Location" value={resume.location} onChange={(v) => update('location', v)} placeholder="City, State" />
          </>
        )}

        {tab === 'summary' && (
          <Field
            label="Professional Summary"
            value={resume.summary}
            onChange={(v) => update('summary', v)}
            multiline
            rows={6}
            hint="Gemini rewrites this for each job description"
          />
        )}

        {tab === 'skills' && (
          <Field
            label="Skills (comma-separated)"
            value={resume.skills.join(', ')}
            onChange={(v) =>
              update(
                'skills',
                v.split(',').map((s) => s.trim()).filter(Boolean)
              )
            }
            multiline
            rows={4}
            hint="These stay fixed — add JD keywords here manually if needed"
          />
        )}

        {tab === 'experience' && (
          <div className="stack">
            {resume.experience.map((exp, i) => (
              <div key={exp.id} className="card">
                <div className="card-header">
                  <strong>{exp.title || exp.company || `Role ${i + 1}`}</strong>
                  <button type="button" className="btn-icon" onClick={() => removeExperience(i)}>
                    ×
                  </button>
                </div>
                <Field label="Job Title" value={exp.title} onChange={(v) => updateExperience(i, 'title', v)} />
                <Field label="Company" value={exp.company} onChange={(v) => updateExperience(i, 'company', v)} />
                <div className="row-2">
                  <Field label="Start Date" value={exp.startDate} onChange={(v) => updateExperience(i, 'startDate', v)} placeholder="Jan 2022" />
                  <Field label="End Date" value={exp.endDate} onChange={(v) => updateExperience(i, 'endDate', v)} placeholder="Present" />
                </div>
                <label className="field">
                  <span className="field-label">Bullets — tailored per JD</span>
                  <BulletEditor
                    bullets={exp.bullets}
                    onChange={(bullets) => updateExperience(i, 'bullets', bullets)}
                  />
                </label>
              </div>
            ))}
            <button type="button" className="btn btn-ghost" onClick={addExperience}>
              + Add Experience
            </button>
          </div>
        )}

        {tab === 'education' && (
          <div className="stack">
            {resume.education.map((edu, i) => (
              <div key={edu.id} className="card">
                <Field label="Degree" value={edu.degree} onChange={(v) => updateEducation(i, 'degree', v)} />
                <Field label="Field of Study" value={edu.field} onChange={(v) => updateEducation(i, 'field', v)} />
                <Field label="School" value={edu.school} onChange={(v) => updateEducation(i, 'school', v)} />
                <Field label="Date" value={edu.date} onChange={(v) => updateEducation(i, 'date', v)} placeholder="May 2018" />
              </div>
            ))}
            <button type="button" className="btn btn-ghost" onClick={addEducation}>
              + Add Education
            </button>
          </div>
        )}

        {tab === 'certs' && (
          <div className="stack">
            {resume.certifications.map((cert, i) => (
              <div key={cert.id} className="card">
                <Field label="Certification Name" value={cert.name} onChange={(v) => updateCert(i, 'name', v)} />
                <Field label="Date" value={cert.date} onChange={(v) => updateCert(i, 'date', v)} />
              </div>
            ))}
            <button type="button" className="btn btn-ghost" onClick={addCert}>
              + Add Certification
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
