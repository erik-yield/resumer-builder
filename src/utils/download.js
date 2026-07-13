export const DOWNLOAD_FORMATS = ['docx', 'pdf'];

export function loadDownloadFormat() {
  try {
    const saved = localStorage.getItem('resume-writer-download-format');
    if (DOWNLOAD_FORMATS.includes(saved)) return saved;
  } catch {
    /* use default */
  }
  return 'docx';
}

export function saveDownloadFormat(format) {
  if (DOWNLOAD_FORMATS.includes(format)) {
    localStorage.setItem('resume-writer-download-format', format);
  }
}

export function buildResumeFilename(jobTitle, format) {
  const safeTitle = (jobTitle || 'Resume')
    .replace(/[^a-zA-Z0-9\s-_]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 50) || 'Resume';
  const timestamp = new Date().toISOString().slice(0, 10);
  const ext = format === 'pdf' ? 'pdf' : 'docx';
  return `Resume_${safeTitle}_${timestamp}.${ext}`;
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
