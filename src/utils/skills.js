export function normalizeSkills(skills) {
  if (!skills?.length) return [];
  if (typeof skills[0] === 'string') {
    return [{ id: 'skill-migrated', category: 'Technical Skills', items: skills.join(', ') }];
  }
  return skills.filter((s) => s.category?.trim() || s.items?.trim());
}

export function getSkillColumns(skills) {
  const normalized = normalizeSkills(skills);
  const mid = Math.ceil(normalized.length / 2);
  return {
    left: normalized.slice(0, mid),
    right: normalized.slice(mid),
  };
}

export function flattenSkillsText(skills) {
  return normalizeSkills(skills)
    .map((s) => `${s.category}: ${s.items}`)
    .join('\n');
}

export function hasSkills(skills) {
  return normalizeSkills(skills).some((s) => s.items?.trim());
}
