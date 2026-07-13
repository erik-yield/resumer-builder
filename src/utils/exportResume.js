import { buildResumeFilename, downloadBlob } from './download.js';

export async function exportResume(resume, jobTitle, format = 'docx') {
  const filename = buildResumeFilename(jobTitle, format);

  if (format === 'pdf') {
    const { buildPdfBlob } = await import('./generatePdf.js');
    const blob = await buildPdfBlob(resume);
    downloadBlob(blob, filename);
  } else {
    const { buildDocxBlob } = await import('./generateDocx.js');
    const blob = await buildDocxBlob(resume);
    downloadBlob(blob, filename);
  }

  return filename;
}
