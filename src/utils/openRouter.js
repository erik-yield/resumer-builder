import { DEFAULT_MODEL } from './settings.js';
import { buildTailorMessages, parseTailoredContent } from './llmShared.js';

export async function generateWithOpenRouter(jobDescription, resume, settings) {
  const apiKey = settings.apiKey?.trim();
  if (!apiKey) {
    throw new Error('OpenRouter API key is required. Add it in Settings.');
  }

  const model = settings.model?.trim() || DEFAULT_MODEL;
  const { systemPrompt, userPrompt } = buildTailorMessages(jobDescription, resume);

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
        { role: 'system', content: systemPrompt },
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
  return parseTailoredContent(content, resume);
}
