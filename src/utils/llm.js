import { generateWithOpenRouter } from './openRouter.js';
import { generateWithGemini } from './gemini.js';

export async function generateTailoredContent(jobDescription, resume, settings) {
  if (settings.provider === 'gemini') {
    return generateWithGemini(jobDescription, resume, settings);
  }
  return generateWithOpenRouter(jobDescription, resume, settings);
}
