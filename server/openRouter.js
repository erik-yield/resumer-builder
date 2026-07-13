import { externalFetch } from './network.js';

const ATS_SYSTEM_PROMPT = `You are an expert ATS resume optimizer specializing in Workday parsing requirements.

Your task: Tailor ONLY the Professional Summary and Work Experience bullet points to maximize keyword match with the job description.

STRICT RULES — DO NOT CHANGE:
- Name, email, phone, location
- Education (school, degree, dates)
- Certifications (names, dates)
- Job titles, company names, employment dates
- Years of experience references tied to fixed dates

YOU MUST REWRITE:
- Professional Summary (3-5 lines, front-load JD keywords)
- Experience bullet points for each role (4-6 bullets per recent role, 3-4 for older roles)

ATS OPTIMIZATION RULES:
1. Mirror exact terms from the job description (e.g., "AWS", "Terraform", "Kubernetes", "CI/CD")
2. Use bullet formula: [Action] + [Tool/Tech from JD] + [Scope] → [Quantified Impact]
3. Include both acronyms and full forms when relevant (e.g., "AWS (Amazon Web Services)")
4. Quantify achievements with %, $, time saved, users, scale where plausible based on existing content
5. Front-load strongest keyword matches in summary and most recent 1-2 roles
6. Context beats keyword stuffing — weave keywords into achievement bullets naturally
7. Target 70%+ keyword overlap with the job description

Return ONLY valid JSON with this exact structure:
{
  "summary": "rewritten professional summary",
  "experience": [
    {
      "id": "same id from input",
      "bullets": ["bullet 1", "bullet 2", ...]
    }
  ]
}`;

export async function generateTailoredContent(jobDescription, resume) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    throw new Error('OPENROUTER_API_KEY is not set. Add your key to the .env file.');
  }

  const model = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001';

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

CURRENT RESUME DATA TO TAILOR:
Professional Summary: ${resume.summary}

Work Experience:
${JSON.stringify(experiencePayload, null, 2)}

Skills (for keyword reference only — do NOT return skills in output): ${resume.skills.join(', ')}

Rewrite the summary and experience bullets for maximum Workday ATS ranking. Return JSON only.`;

  const response = await externalFetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://127.0.0.1:5173',
      'X-Title': 'Resume Writer',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: ATS_SYSTEM_PROMPT },
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

  return {
    summary: parsed.summary || resume.summary,
    experience: tailoredExperience,
  };
}
