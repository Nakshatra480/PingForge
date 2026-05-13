import { callOpenRouter } from './providers/openrouter';
import { getCached, setCache, createCacheKey } from './cache';
import env from '../config/env';
import AppError from '../lib/app-error';

export const routeAIRequest = async (prompt: string): Promise<string> => {
  const cacheKey = createCacheKey(prompt);
  const cached = getCached(cacheKey);
  if (cached) return cached;

  if (!env.OPENROUTER_API_KEY) {
    throw new AppError('AI service unavailable. No OpenRouter API key configured.', 503, 'AI_UNAVAILABLE');
  }

  try {
    const result = await callOpenRouter(prompt);
    setCache(cacheKey, result);
    return result;
  } catch (err) {
    console.error('OpenRouter failed:', (err as Error).message);
    throw new AppError('AI generation failed. Please try again.', 503, 'AI_FAILED');
  }
};
