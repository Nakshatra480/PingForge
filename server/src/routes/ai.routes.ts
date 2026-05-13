import { Router, Request, Response } from 'express';
import asyncHandler from '../lib/async-handler';
import authenticate from '../middleware/auth';
import { aiLimiter } from '../middleware/rate-limiter';
import { generateSchema, operatorSchema } from '../lib/validators/ai.validators';
import { routeAIRequest } from '../ai/router';
import { buildOutreachPrompt, buildFollowUpPrompt, buildOperatorPrompt } from '../ai/prompts';
import Lead from '../models/lead.model';
import User from '../models/user.model';
import env from '../config/env';

const router = Router();

router.use(authenticate);
router.use(aiLimiter);

// Helper to replace any remaining AI placeholders with real user data
const replacePlaceholders = (content: string, user: any): string => {
  const name = user.name || '';
  const email = user.email || '';
  const title = (user as any).title || '';
  const company = (user as any).company || '';
  const phone = (user as any).phone || '';
  return content
    .replace(/\[Your Name\]/gi, name).replace(/\[Name\]/gi, name)
    .replace(/\[Your Title\]/gi, title).replace(/\[Title\]/gi, title).replace(/\[Your Position\]/gi, title).replace(/\[Position\]/gi, title)
    .replace(/\[Your Company\]/gi, company).replace(/\[Company\]/gi, company).replace(/\[Company Name\]/gi, company)
    .replace(/\[Your Contact Information\]/gi, [name, title, company, email, phone].filter(Boolean).join(' | '))
    .replace(/\[Your Email\]/gi, email).replace(/\[Email Address\]/gi, email).replace(/\[Email\]/gi, email)
    .replace(/\[Your Phone\]/gi, phone).replace(/\[Phone Number\]/gi, phone).replace(/\[Phone\]/gi, phone).replace(/\[Mobile\]/gi, phone)
    .replace(/\[Your LinkedIn\]/gi, '').replace(/\[LinkedIn\]/gi, '')
    .replace(/\[Your Website\]/gi, '').replace(/\[Website\]/gi, '');
};

router.post('/generate', asyncHandler(async (req: Request, res: Response) => {
  const data = generateSchema.parse(req.body);

  // Fetch sender profile to include in prompt
  const userProfile = await User.findById(req.user!.id).lean() as any;
  const sender = userProfile ? {
    name: userProfile.name,
    title: userProfile.title,
    company: userProfile.company,
    email: userProfile.email,
    phone: userProfile.phone,
  } : undefined;

  let leadContext = data.leadContext;
  if (data.leadId && !leadContext) {
    const lead = await Lead.findOne({ _id: data.leadId, userId: req.user!.id })
      .select('name company title notes')
      .lean();
    if (lead) {
      leadContext = { name: lead.name, company: lead.company, title: lead.title, notes: lead.notes };
    }
  }

  let prompt: string;
  if (data.type === 'follow_up' && data.previousMessage) {
    prompt = buildFollowUpPrompt(
      { name: leadContext?.name, company: leadContext?.company },
      data.previousMessage,
      data.tone,
      sender
    );
  } else {
    prompt = buildOutreachPrompt(data.type, data.tone, leadContext, data.additionalContext, sender);
  }

  let result = await routeAIRequest(prompt);
  // Safety fallback: replace any remaining placeholders
  if (userProfile) result = replacePlaceholders(result, userProfile);

  res.json({ success: true, data: { content: result, type: data.type, tone: data.tone } });
}));

// Streaming operator endpoint using SSE
router.post('/operator/stream', authenticate, aiLimiter, async (req: Request, res: Response) => {
  try {
    const data = operatorSchema.parse(req.body);
    const prompt = buildOperatorPrompt(data.message, data.conversationHistory);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', env.CLIENT_URL);
    res.flushHeaders();

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': env.CLIENT_URL,
        'X-Title': 'PingForge',
      },
      body: JSON.stringify({
        model: 'minimax/minimax-m2.5:free',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 600,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      res.write(`data: ${JSON.stringify({ error: 'AI service error' })}\n\n`);
      res.end();
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') {
          res.write('data: [DONE]\n\n');
          continue;
        }
        try {
          const parsed = JSON.parse(payload);
          const token = parsed?.choices?.[0]?.delta?.content;
          if (token) {
            res.write(`data: ${JSON.stringify({ token })}\n\n`);
          }
        } catch { /* skip malformed chunks */ }
      }
    }

    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: (err as Error).message })}\n\n`);
    res.end();
  }
});

// Non-streaming fallback
router.post('/operator', asyncHandler(async (req: Request, res: Response) => {
  const data = operatorSchema.parse(req.body);
  const prompt = buildOperatorPrompt(data.message, data.conversationHistory);
  const result = await routeAIRequest(prompt);
  res.json({ success: true, data: { response: result } });
}));

export default router;
