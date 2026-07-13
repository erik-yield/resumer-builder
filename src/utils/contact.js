export function getLinkIconType(link) {
  const label = (link.label || '').toLowerCase();
  const url = (link.url || '').toLowerCase();

  if (label.includes('github') || url.includes('github.com')) return 'github';
  if (label.includes('linkedin') || url.includes('linkedin.com')) return 'linkedin';
  if (label.includes('portfolio') || label.includes('website') || label.includes('site')) return 'website';
  if (url.includes('twitter.com') || url.includes('x.com') || label.includes('twitter')) return 'twitter';
  if (url.includes('gitlab.com') || label.includes('gitlab')) return 'gitlab';
  return 'link';
}

export function formatLinkForExport(link) {
  return link.url?.trim() || '';
}

export function getContactDisplay(resume) {
  return {
    textParts: [resume.email, resume.phone, resume.location].filter(Boolean),
    links: normalizeLinks(resume.links).filter((l) => l.url?.trim()),
  };
}

export const LINK_PRESETS = [
  { label: 'GitHub', icon: 'github', placeholder: 'https://github.com/username' },
  { label: 'LinkedIn', icon: 'linkedin', placeholder: 'https://linkedin.com/in/username' },
  { label: 'Portfolio', icon: 'website', placeholder: 'https://yourportfolio.com' },
  { label: 'Website', icon: 'website', placeholder: 'https://example.com' },
];

export function normalizeLinks(links) {
  if (!Array.isArray(links)) return [];
  return links.filter((link) => link.label?.trim() || link.url?.trim());
}

export function formatLinkText(link) {
  return formatLinkForExport(link);
}

export function getContactParts(resume) {
  const { textParts, links } = getContactDisplay(resume);
  const linkUrls = links.map(formatLinkForExport).filter(Boolean);
  return [...textParts, ...linkUrls];
}

export function getContactLine(resume) {
  return getContactParts(resume).join(' | ');
}
