import { useState } from 'react';
import { hasSkills } from '../utils/skills';
import { LINK_PRESETS, normalizeLinks, getLinkIconType } from '../utils/contact';
import SocialIcon from './SocialIcon';

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

function SectionCard({ title, onRemove, children }) {
  return (
    <div className="card">
      <div className="card-header">
        <strong>{title}</strong>
        {onRemove && (
          <button type="button" className="btn-remove" onClick={onRemove}>
            Remove
          </button>
        )}
      </div>
      {children}
    </div>
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

  const removeEducation = (index) => {
    if (!window.confirm('Remove this education entry?')) return;
    onChange({
      ...resume,
      education: resume.education.filter((_, i) => i !== index),
    });
  };

  const clearEducation = () => {
    if (!resume.education.length) return;
    if (!window.confirm('Remove all education entries?')) return;
    onChange({ ...resume, education: [] });
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

  const removeCert = (index) => {
    if (!window.confirm('Remove this certification?')) return;
    onChange({
      ...resume,
      certifications: resume.certifications.filter((_, i) => i !== index),
    });
  };

  const clearCerts = () => {
    if (!resume.certifications.length) return;
    if (!window.confirm('Remove all certifications?')) return;
    onChange({ ...resume, certifications: [] });
  };

  const addSkillCategory = () => {
    onChange({
      ...resume,
      skills: [
        ...resume.skills,
        { id: `skill-${Date.now()}`, category: '', items: '' },
      ],
    });
  };

  const updateSkill = (index, field, value) => {
    const skills = [...resume.skills];
    skills[index] = { ...skills[index], [field]: value };
    onChange({ ...resume, skills });
  };

  const removeSkill = (index) => {
    onChange({
      ...resume,
      skills: resume.skills.filter((_, i) => i !== index),
    });
  };

  const clearSkills = () => {
    if (!resume.skills.length) return;
    if (!window.confirm('Remove all skill categories?')) return;
    onChange({ ...resume, skills: [] });
  };

  const clearSummary = () => {
    if (!resume.summary?.trim()) return;
    if (!window.confirm('Clear professional summary?')) return;
    onChange({ ...resume, summary: '' });
  };

  const clearProfessionalTitle = () => {
    if (!resume.professionalTitle?.trim()) return;
    onChange({ ...resume, professionalTitle: '' });
  };

  const clearLinks = () => {
    if (!resume.links?.length) return;
    if (!window.confirm('Remove all links?')) return;
    onChange({ ...resume, links: [] });
  };

  const addLink = (preset) => {
    onChange({
      ...resume,
      links: [
        ...(resume.links || []),
        {
          id: `link-${Date.now()}`,
          label: preset?.label || '',
          url: '',
        },
      ],
    });
  };

  const updateLink = (index, field, value) => {
    const links = [...(resume.links || [])];
    links[index] = { ...links[index], [field]: value };
    onChange({ ...resume, links });
  };

  const removeLink = (index) => {
    onChange({
      ...resume,
      links: (resume.links || []).filter((_, i) => i !== index),
    });
  };

  const tabStatus = {
    contact: Boolean(resume.name?.trim() && resume.email?.trim()),
    summary: Boolean(resume.summary?.trim()),
    skills: hasSkills(resume.skills),
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
            <Field label="Location" value={resume.location} onChange={(v) => update('location', v)} placeholder="City, Country" />
            <Field
              label="Professional Title"
              value={resume.professionalTitle || ''}
              onChange={(v) => update('professionalTitle', v)}
              placeholder="Senior Engineer | React, Node.js | Cloud Architecture"
              hint="Format: Role | Technologies | Specialization — tailored per job on generate"
            />
            {resume.professionalTitle?.trim() && (
              <button type="button" className="btn btn-ghost btn-sm section-clear-btn" onClick={clearProfessionalTitle}>
                Remove professional title
              </button>
            )}

            <div className="contact-links-section">
              <div className="contact-links-header">
                <span className="field-label">Links</span>
                <div className="link-presets">
                  {LINK_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      className="btn btn-ghost btn-sm link-preset-btn"
                      onClick={() => addLink(preset)}
                      title={`Add ${preset.label}`}
                    >
                      <SocialIcon type={preset.icon || getLinkIconType(preset)} size={14} />
                    </button>
                  ))}
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm link-preset-btn"
                    onClick={() => addLink()}
                    title="Add custom link"
                  >
                    <SocialIcon type="link" size={14} />
                  </button>
                  {(resume.links || []).length > 0 && (
                    <button type="button" className="btn btn-ghost btn-sm btn-remove-inline" onClick={clearLinks}>
                      Remove all links
                    </button>
                  )}
                </div>
              </div>

              {normalizeLinks(resume.links).length === 0 && (
                <p className="field-hint">Add GitHub, LinkedIn, portfolio, or any custom link.</p>
              )}

              <div className="stack">
                {(resume.links || []).map((link, i) => (
                  <SectionCard
                    key={link.id}
                    title={
                      <span className="link-card-title">
                        <SocialIcon type={getLinkIconType(link)} size={14} />
                        {link.label || `Link ${i + 1}`}
                      </span>
                    }
                    onRemove={() => removeLink(i)}
                  >
                    <Field
                      label="Label"
                      value={link.label}
                      onChange={(v) => updateLink(i, 'label', v)}
                      placeholder="GitHub"
                    />
                    <Field
                      label="URL"
                      value={link.url}
                      onChange={(v) => updateLink(i, 'url', v)}
                      placeholder="https://github.com/username"
                    />
                  </SectionCard>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === 'summary' && (
          <>
            <div className="section-toolbar">
              {resume.summary?.trim() && (
                <button type="button" className="btn btn-ghost btn-sm btn-remove-inline" onClick={clearSummary}>
                  Clear summary
                </button>
              )}
            </div>
            <Field
              label="Professional Summary"
              value={resume.summary}
              onChange={(v) => update('summary', v)}
              multiline
              rows={6}
              hint="Gemini rewrites this for each job description (European ATS rules)"
            />
          </>
        )}

        {tab === 'skills' && (
          <div className="stack">
            <div className="section-toolbar">
              <p className="field-hint skills-hint">
                Categories are tailored per job on generate. Add comma-separated skills per category.
              </p>
              {resume.skills.length > 0 && (
                <button type="button" className="btn btn-ghost btn-sm btn-remove-inline" onClick={clearSkills}>
                  Remove all categories
                </button>
              )}
            </div>
            {resume.skills.map((skill, i) => (
              <SectionCard
                key={skill.id}
                title={skill.category || `Category ${i + 1}`}
                onRemove={() => removeSkill(i)}
              >
                <Field
                  label="Category"
                  value={skill.category}
                  onChange={(v) => updateSkill(i, 'category', v)}
                  placeholder="Frontend"
                />
                <Field
                  label="Skills (comma-separated)"
                  value={skill.items}
                  onChange={(v) => updateSkill(i, 'items', v)}
                  multiline
                  rows={3}
                  placeholder="React, TypeScript, JavaScript, ..."
                />
              </SectionCard>
            ))}
            <button type="button" className="btn btn-ghost" onClick={addSkillCategory}>
              + Add category
            </button>
          </div>
        )}

        {tab === 'experience' && (
          <div className="stack">
            {resume.experience.map((exp, i) => (
              <SectionCard
                key={exp.id}
                title={exp.title || exp.company || `Role ${i + 1}`}
                onRemove={() => removeExperience(i)}
              >
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
              </SectionCard>
            ))}
            <button type="button" className="btn btn-ghost" onClick={addExperience}>
              + Add Experience
            </button>
          </div>
        )}

        {tab === 'education' && (
          <div className="stack">
            <div className="section-toolbar">
              {resume.education.length > 0 && (
                <button type="button" className="btn btn-ghost btn-sm btn-remove-inline" onClick={clearEducation}>
                  Remove all education
                </button>
              )}
            </div>
            {resume.education.map((edu, i) => (
              <SectionCard
                key={edu.id}
                title={edu.degree || edu.school || `Education ${i + 1}`}
                onRemove={() => removeEducation(i)}
              >
                <Field label="Degree" value={edu.degree} onChange={(v) => updateEducation(i, 'degree', v)} />
                <Field label="Field of Study" value={edu.field} onChange={(v) => updateEducation(i, 'field', v)} />
                <Field label="School" value={edu.school} onChange={(v) => updateEducation(i, 'school', v)} />
                <Field label="Date" value={edu.date} onChange={(v) => updateEducation(i, 'date', v)} placeholder="May 2018" />
              </SectionCard>
            ))}
            <button type="button" className="btn btn-ghost" onClick={addEducation}>
              + Add Education
            </button>
          </div>
        )}

        {tab === 'certs' && (
          <div className="stack">
            <div className="section-toolbar">
              {resume.certifications.length > 0 && (
                <button type="button" className="btn btn-ghost btn-sm btn-remove-inline" onClick={clearCerts}>
                  Remove all certifications
                </button>
              )}
            </div>
            {resume.certifications.map((cert, i) => (
              <SectionCard
                key={cert.id}
                title={cert.name || `Certification ${i + 1}`}
                onRemove={() => removeCert(i)}
              >
                <Field label="Certification Name" value={cert.name} onChange={(v) => updateCert(i, 'name', v)} />
                <Field label="Date" value={cert.date} onChange={(v) => updateCert(i, 'date', v)} />
              </SectionCard>
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
