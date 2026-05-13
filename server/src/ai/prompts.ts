export const buildOutreachPrompt = (
  type: string,
  tone: string,
  lead?: { name?: string; company?: string; title?: string; notes?: string },
  additionalContext?: string,
  sender?: { name?: string; title?: string; company?: string; email?: string; phone?: string }
): string => {
  const leadInfo = lead
    ? `Recipient: ${lead.name || 'Unknown'}${lead.company ? ` at ${lead.company}` : ''}${lead.title ? ` (${lead.title})` : ''}${lead.notes ? `\nNotes: ${lead.notes}` : ''}`
    : 'No specific recipient information provided.';

  const senderInfo = sender
    ? `Sender (you): ${sender.name || ''}${sender.title ? `, ${sender.title}` : ''}${sender.company ? ` at ${sender.company}` : ''}${sender.email ? ` | ${sender.email}` : ''}${sender.phone ? ` | ${sender.phone}` : ''}`
    : '';

  const typeMap: Record<string, string> = {
    cold_email: 'a cold outreach email to introduce yourself and propose value',
    linkedin_dm: 'a concise LinkedIn direct message for professional networking',
    follow_up: 'a follow-up message referencing previous communication',
    investor: 'an investor outreach email pitching your startup',
    partnership: 'a partnership proposal email exploring mutual collaboration',
  };

  return `You are an expert business development writer. Write ${typeMap[type] || 'a professional outreach message'}.

Tone: ${tone}
${leadInfo}
${senderInfo ? senderInfo + '\n' : ''}${additionalContext ? `Additional context: ${additionalContext}` : ''}

Requirements:
- Keep it concise (under 200 words for emails, under 100 for LinkedIn DMs)
- Include a clear, specific call to action
- Be genuine, not salesy
- Personalize based on the recipient's information when available
- For emails, include a subject line on the first line prefixed with "Subject: "
- Sign the message with the sender's actual name, title, company, email and phone — do NOT use placeholders like [Your Name] or [Phone Number]. Use the real values provided above.

Write only the message, no explanations or meta-commentary.`;
};

export const buildFollowUpPrompt = (
  lead: { name?: string; company?: string },
  previousMessage: string,
  tone: string,
  sender?: { name?: string; title?: string; company?: string; email?: string; phone?: string }
): string => {
  const senderInfo = sender
    ? `Sender (you): ${sender.name || ''}${sender.title ? `, ${sender.title}` : ''}${sender.company ? ` at ${sender.company}` : ''}${sender.email ? ` | ${sender.email}` : ''}${sender.phone ? ` | ${sender.phone}` : ''}`
    : '';

  return `You are an expert at writing follow-up messages. Write a follow-up to the previous message below.

Recipient: ${lead.name || 'Unknown'}${lead.company ? ` at ${lead.company}` : ''}
Tone: ${tone}
${senderInfo ? senderInfo + '\n' : ''}Previous message:
${previousMessage}

Requirements:
- Reference the previous message naturally
- Add new value or a different angle
- Keep it shorter than the original (under 150 words)
- Include a clear call to action
- Don't be pushy or desperate
- Sign with the sender's actual name, title, company, email and phone — do NOT use placeholders.

Write only the message, no explanations.`;
};

export const buildOperatorPrompt = (
  userMessage: string,
  conversationHistory?: Array<{ role: string; content: string }>
): string => {
  const historyText = conversationHistory
    ?.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n') || '';

  return `You are PingForge AI Operator, an expert assistant for sales outreach and lead management. You help users craft messages, strategize outreach campaigns, analyze leads, and optimize their sales pipeline.

${historyText ? `Conversation history:\n${historyText}\n` : ''}
User: ${userMessage}

Respond helpfully and concisely. If the user asks you to write a message, write it directly. If they ask for strategy advice, be specific and actionable. Keep responses under 300 words unless the user asks for detailed analysis.`;
};

export const buildMemorySummaryPrompt = (
  interactions: Array<{ role: string; content: string; at: Date }>
): string => {
  const interactionText = interactions
    .map(i => `[${i.at.toISOString().split('T')[0]}] ${i.role}: ${i.content}`)
    .join('\n');

  return `Summarize the following interaction history into a concise relationship summary. Extract key points, detected tone of the relationship, and suggest the next best action.

Interactions:
${interactionText}

Respond in this exact JSON format:
{
  "summary": "2-3 sentence relationship summary",
  "tone": "detected relationship tone (e.g., warm, professional, cold)",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "nextSuggestedAction": "specific next step recommendation"
}`;
};
