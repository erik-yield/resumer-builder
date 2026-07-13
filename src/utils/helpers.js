export function isResumeReady(resume) {
  return Boolean(
    resume.name?.trim() &&
    resume.name !== 'Your Full Name' &&
    resume.email?.trim() &&
    resume.experience?.length > 0 &&
    resume.experience.some((e) => e.title?.trim() && e.bullets?.some((b) => b.trim()))
  );
}

export function countJdWords(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function extractJobTitle(jd) {
  const lines = jd.split('\n').map((l) => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 5)) {
    if (/engineer|developer|architect|analyst|manager|specialist|lead|consultant/i.test(line)) {
      return line.slice(0, 60);
    }
  }
  return lines[0]?.slice(0, 60) || 'Resume';
}

export function loadJdHistory() {
  try {
    return JSON.parse(localStorage.getItem('resume-writer-jd-history') || '[]');
  } catch {
    return [];
  }
}

export function saveJdToHistory(jd) {
  if (!jd.trim()) return;
  const title = extractJobTitle(jd);
  const history = loadJdHistory().filter((h) => h.text !== jd.trim());
  history.unshift({ title, text: jd.trim(), date: new Date().toISOString() });
  localStorage.setItem('resume-writer-jd-history', JSON.stringify(history.slice(0, 8)));
}
