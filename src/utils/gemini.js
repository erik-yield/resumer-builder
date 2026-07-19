import { DEFAULT_GEMINI_MODEL } from './settings.js';
import { buildTailorMessages, parseTailoredContent } from './llmShared.js';

export async function generateWithGemini(jobDescription, resume, settings) {
  const apiKey = settings.geminiApiKey?.trim();
  if (!apiKey) {
    throw new Error('Gemini API key is required. Add it in Settings.');
  }

  const model = settings.geminiModel?.trim() || DEFAULT_GEMINI_MODEL;
  const { systemPrompt, userPrompt } = buildTailorMessages(jobDescription, resume);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim();

  if (!content) {
    const blockReason = data.promptFeedback?.blockReason;
    if (blockReason) {
      throw new Error(`Gemini blocked the request (${blockReason}).`);
    }
    throw new Error('No response from Gemini.');
  }

  return parseTailoredContent(content, resume);
}
