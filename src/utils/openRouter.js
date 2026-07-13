import { flattenSkillsText } from './skills.js';
import { EUROPEAN_ATS_MASTER_PROMPT } from './masterPrompt.js';

export async function generateTailoredContent(jobDescription, resume, settings) {
  const apiKey = settings.apiKey?.trim();
  if (!apiKey) {
    throw new Error('OpenRouter API key is required. Add it in Settings.');
  }

  const model = settings.model?.trim() || 'google/gemini-2.0-flash-001';

  const experiencePayload = resume.experience.map((exp) => ({
    id: exp.id,
    title: exp.title,
    company: exp.company,
    startDate: exp.startDate,
    endDate: exp.endDate,
    currentBullets: exp.bullets,
  }));

  const userPrompt = `JOB DESCRIPTION:
${jobDescription}

CANDIDATE BACKGROUND (fixed — do not change titles, companies, or dates):
Name: ${resume.name}
Location: ${resume.location}
Professional Title (rewrite for JD): ${resume.professionalTitle || ''}

Current Summary:
${resume.summary}

Current Skills:
${flattenSkillsText(resume.skills)}

Work Experience:
${JSON.stringify(experiencePayload, null, 2)}

Education: ${JSON.stringify(resume.education)}
Certifications: ${JSON.stringify(resume.certifications)}

Apply the European ATS master rules. Tailor professionalTitle, summary, skills categories/items, and experience bullets for maximum ATS ranking against this job description. Return JSON only.`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Resume Writer',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: EUROPEAN_ATS_MASTER_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('No response from Gemini.');
  }

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Failed to parse AI response as JSON.');
    parsed = JSON.parse(jsonMatch[0]);
  }

  const tailoredExperience = resume.experience.map((exp) => {
    const match = parsed.experience?.find((e) => e.id === exp.id);
    return {
      ...exp,
      bullets: match?.bullets?.length ? match.bullets : exp.bullets,
    };
  });

  const tailoredSkills = Array.isArray(parsed.skills) && parsed.skills.length
    ? parsed.skills.map((skill, i) => ({
        id: resume.skills[i]?.id || `skill-gen-${Date.now()}-${i}`,
        category: skill.category || `Category ${i + 1}`,
        items: skill.items || '',
      }))
    : resume.skills;

  return {
    professionalTitle: parsed.professionalTitle || resume.professionalTitle || '',
    summary: parsed.summary || resume.summary,
    skills: tailoredSkills,
    experience: tailoredExperience,
  };
}
