export const LINK_PRESETS = [
  { label: 'GitHub', placeholder: 'https://github.com/username' },
  { label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
  { label: 'Portfolio', placeholder: 'https://yourportfolio.com' },
  { label: 'Website', placeholder: 'https://example.com' },
];

export function normalizeLinks(links) {
  if (!Array.isArray(links)) return [];
  return links.filter((link) => link.label?.trim() || link.url?.trim());
}

export function formatLinkText(link) {
  const label = link.label?.trim();
  const url = link.url?.trim();
  if (!url) return label || '';
  if (!label) return url;
  return `${label}: ${url}`;
}

export function getContactParts(resume) {
  const parts = [resume.email, resume.phone, resume.location].filter(Boolean);
  normalizeLinks(resume.links).forEach((link) => {
    const text = formatLinkText(link);
    if (text) parts.push(text);
  });
  return parts;
}

export function getContactLine(resume) {
  return getContactParts(resume).join(' | ');
}
