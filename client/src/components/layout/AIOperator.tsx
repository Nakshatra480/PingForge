import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Loader2, Trash2 } from 'lucide-react';
import { marked } from 'marked';
import { useUIStore } from '../../store/index.ts';
import { useAuthStore } from '../../store/index.ts';
import './AIOperator.css';

// Configure marked for clean output
marked.setOptions({ breaks: true, gfm: true } as any);

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  'Write a follow-up for a cold lead',
  'Help me craft an investor pitch DM',
  'What makes a good cold email subject line?',
  'Tips for improving reply rates',
];

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

function MarkdownContent({ content, streaming }: { content: string; streaming?: boolean }) {
  const html = marked.parse(content) as string;
  return (
    <div
      className={`md-content ${streaming ? 'md-streaming' : ''}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function AIOperator() {
  const { aiOperatorOpen, setAIOperatorOpen } = useUIStore();
  const { token } = useAuthStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (aiOperatorOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [aiOperatorOpen]);

  useEffect(() => () => { abortRef.current?.abort(); }, []);

  const handleSend = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || loading) return;

    const userMsg: ChatMessage = { role: 'user', content };
    const history = [...messages];
    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '' }]);
    setInput('');
    setLoading(true);

    abortRef.current = new AbortController();

    try {
      const response = await fetch(`${BASE_URL}/ai/operator/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: content,
          conversationHistory: history.slice(-10),
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok || !response.body) throw new Error(`Server error ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value, { stream: true }).split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') break;
          try {
            const parsed = JSON.parse(payload);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.token) {
              accumulated += parsed.token;
              const snap = accumulated;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: snap };
                return updated;
              });
            }
          } catch (e: any) { if (e.message) throw e; }
        }
      }

      if (!accumulated) {
        setMessages(prev => {
          const u = [...prev];
          u[u.length - 1] = { role: 'assistant', content: 'No response received. Please try again.' };
          return u;
        });
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setMessages(prev => {
        const u = [...prev];
        u[u.length - 1] = { role: 'assistant', content: `Sorry, something went wrong: ${err.message}` };
        return u;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    abortRef.current?.abort();
    setMessages([]);
    setLoading(false);
  };

  if (!aiOperatorOpen) return null;

  return (
    <div className="ai-operator">
      <div className="ai-operator-header">
        <div className="ai-operator-title">
          <Bot size={18} />
          <span>AI Operator</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {messages.length > 0 && (
            <button className="btn-icon" onClick={handleClear} title="Clear chat">
              <Trash2 size={16} />
            </button>
          )}
          <button className="btn-icon" onClick={() => setAIOperatorOpen(false)} aria-label="Close">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="ai-operator-messages">
        {messages.length === 0 && (
          <div className="ai-operator-empty">
            <Bot size={32} className="text-tertiary" />
            <p>Your AI outreach strategist. Ask about leads, campaigns, and messaging.</p>
            <div className="ai-suggestions">
              {SUGGESTIONS.map(s => (
                <button key={s} className="ai-suggestion" onClick={() => handleSend(s)} disabled={loading}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => {
          const isLastAssistant = msg.role === 'assistant' && i === messages.length - 1;
          const isStreaming = isLastAssistant && loading;
          return (
            <div key={i} className={`ai-msg ${msg.role}`}>
              {msg.role === 'assistant' && (
                <div className="ai-msg-avatar"><Bot size={14} /></div>
              )}
              <div className={`ai-msg-bubble ${msg.role}`}>
                {msg.role === 'user' ? (
                  <span className="user-text">{msg.content}</span>
                ) : isStreaming && !msg.content ? (
                  <div className="ai-thinking"><span /><span /><span /></div>
                ) : (
                  <MarkdownContent content={msg.content} streaming={isStreaming} />
                )}
              </div>
            </div>
          );
        })}

        <div ref={endRef} />
      </div>

      <div className="ai-operator-input">
        <input
          ref={inputRef}
          className="input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Ask anything..."
          disabled={loading}
        />
        <button
          className="btn btn-primary btn-icon"
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
        >
          {loading ? <Loader2 size={16} className="spinning" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}
