import env from '../../config/env';

const MODELS = [
  'minimax/minimax-m2.5:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-4-31b-it:free',
];

export const callOpenRouter = async (prompt: string): Promise<string> => {
  let lastError: Error | null = null;

  for (const model of MODELS) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': env.CLIENT_URL,
          'X-Title': 'PingForge',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1024,
        }),
      });

      if (response.status === 429) {
        lastError = new Error(`${model} rate limited`);
        continue;
      }

      if (!response.ok) {
        const errorBody = await response.text();
        lastError = new Error(`OpenRouter error ${response.status}: ${errorBody}`);
        continue;
      }

      const data: any = await response.json();
      const text = data?.choices?.[0]?.message?.content;

      if (!text) {
        lastError = new Error(`${model} returned empty response`);
        continue;
      }

      return text.trim();
    } catch (err) {
      lastError = err as Error;
      continue;
    }
  }

  throw lastError || new Error('All OpenRouter models failed');
};
