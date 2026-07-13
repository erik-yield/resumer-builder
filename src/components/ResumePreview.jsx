import { useState } from 'react';
import { getSkillColumns, normalizeSkills } from '../utils/skills';

function EditableBlock({ value, onSave, multiline = false, className = '' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const startEdit = () => {
    setDraft(value);
    setEditing(true);
  };

  const save = () => {
    onSave(draft);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className={`editable-block editing ${className}`}>
        {multiline ? (
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={4} autoFocus />
        ) : (
          <input value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus />
        )}
        <div className="edit-actions">
          <button type="button" className="btn btn-primary btn-sm" onClick={save}>Save</button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={cancel}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`editable-block ${className}`} onClick={startEdit} title="Click to edit">
      {value || <span className="placeholder">Click to add…</span>}
      <span className="edit-hint">Edit</span>
    </div>
  );
}

export default function ResumePreview({ resume, onChange }) {
  const updateSummary = (summary) => onChange({ ...resume, summary });

  const updateBullet = (expIndex, bulletIndex, text) => {
    const experience = resume.experience.map((exp, i) => {
      if (i !== expIndex) return exp;
      const bullets = [...exp.bullets];
      bullets[bulletIndex] = text;
      return { ...exp, bullets };
    });
    onChange({ ...resume, experience });
  };

  const skillColumns = getSkillColumns(normalizeSkills(resume.skills));
  const skillRowCount = Math.max(skillColumns.left.length, skillColumns.right.length);

  return (
    <div className="panel preview-panel">
      <div className="panel-top">
        <div>
          <h2>Live Preview</h2>
          <p className="panel-desc">Click summary or bullets to edit inline. Fixed sections stay locked.</p>
        </div>
      </div>

      <div className="resume-preview">
        <header className="resume-header">
          <h1>{resume.name || 'Your Name'}</h1>
          <p className="resume-contact">
            {[resume.email, resume.phone, resume.location].filter(Boolean).join(' | ')}
          </p>
        </header>

        <section className="preview-section editable-section">
          <h3>Professional Summary</h3>
          <EditableBlock value={resume.summary} onSave={updateSummary} multiline />
        </section>

        <section className="preview-section locked-section">
          <h3>Skills</h3>
          <div className="skills-grid">
            <div className="skills-column">
              {skillColumns.left.map((skill) => (
                <div key={skill.id} className="skill-category">
                  <strong>{skill.category}:</strong> {skill.items}
                </div>
              ))}
            </div>
            <div className="skills-column">
              {skillColumns.right.map((skill) => (
                <div key={skill.id} className="skill-category">
                  <strong>{skill.category}:</strong> {skill.items}
                </div>
              ))}
            </div>
          </div>
          {!skillRowCount && <p>—</p>}
        </section>

        <section className="preview-section">
          <h3>Work Experience</h3>
          {resume.experience.map((exp, expIndex) => (
            <div key={exp.id} className="exp-block">
              <div className="exp-title-row locked">
                <strong>{exp.title || 'Job Title'}</strong>
                <span className="exp-company">{exp.company}</span>
              </div>
              <div className="exp-dates locked">
                {exp.startDate} – {exp.endDate}
              </div>
              <ul className="editable-bullets">
                {exp.bullets.filter(Boolean).map((b, i) => (
                  <li key={i}>
                    <EditableBlock
                      value={b}
                      onSave={(text) => updateBullet(expIndex, i, text)}
                      className="bullet-edit"
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {resume.education?.length > 0 && (
          <section className="preview-section locked-section">
            <h3>Education</h3>
            {resume.education.map((edu) => (
              <div key={edu.id} className="edu-block">
                <strong>
                  {edu.degree}
                  {edu.field ? ` in ${edu.field}` : ''}
                </strong>
                <span> — {edu.school}</span>
                <div className="exp-dates">{edu.date}</div>
              </div>
            ))}
          </section>
        )}

        {resume.certifications?.length > 0 && (
          <section className="preview-section locked-section">
            <h3>Certifications</h3>
            <ul className="cert-list">
              {resume.certifications.map((cert) => (
                <li key={cert.id}>
                  {cert.name}
                  {cert.date ? ` — ${cert.date}` : ''}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
