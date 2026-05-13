import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Sparkles, Copy, Check, Loader2, Mail, ExternalLink } from 'lucide-react';
import { aiApi, campaignApi, leadApi, outreachApi } from '../api';
import { useAuthStore } from '../store/index.ts';
import type { Campaign, Lead } from '../types';
import './Pages.css';

export default function Outreach() {
  const [type, setType] = useState('cold_email');
  const [tone, setTone] = useState('professional');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [selectedLead, setSelectedLead] = useState<string>('');
  const [context, setContext] = useState({ name: '', company: '', title: '', notes: '' });
  const [additional, setAdditional] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const replacePlaceholders = (content: string): string => {
    const name = user?.name || '';
    const email = user?.email || '';
    const title = user?.title || '';
    const company = user?.company || '';
    const phone = user?.phone || '';
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

  const { data: campaigns } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => (await campaignApi.list()).data,
  });

  const { data: leads } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => (await leadApi.list()).data,
  });

  const trackMutation = useMutation({
    mutationFn: ({ campaignId, leadId }: { campaignId: string; leadId?: string }) => 
      campaignApi.trackSent(campaignId, leadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    }
  });

  useEffect(() => {
    if (selectedLead && leads) {
      const lead = leads.find(l => l._id === selectedLead);
      if (lead) {
        setContext({
          name: lead.name,
          company: lead.company || '',
          title: lead.title || '',
          notes: lead.notes || '',
        });
      }
    }
  }, [selectedLead, leads]);

  const handleGenerate = async () => {
    setLoading(true);
    setResult('');
    try {
      const res = await aiApi.generate({
        type, tone,
        leadId: selectedLead || undefined,
        leadContext: context.name ? context : undefined,
        additionalContext: additional || undefined,
      });
      setResult(replacePlaceholders(res.data.content));
      
      // Auto-track if campaign is selected
      if (selectedCampaign) {
        trackMutation.mutate({ campaignId: selectedCampaign, leadId: selectedLead || undefined });
      }
    } catch {
      setResult('Failed to generate. Please check your AI configuration.');
    }
    setLoading(false);
  };

  const [sendLoading, setSendLoading] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [error, setError] = useState('');

  const sendMutation = useMutation({
    mutationFn: (data: { to: string; subject: string; content: string; campaignId?: string; leadId?: string }) => 
      outreachApi.sendEmail(data),
    onSuccess: () => {
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 3000);
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to send email. Check your SMTP settings.');
      setTimeout(() => setError(''), 5000);
    }
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = async () => {
    const lead = leads?.find(l => l._id === selectedLead);
    const toEmail = lead?.email || context.name; // Fallback to name if email not found, though validator might fail
    
    if (!toEmail || !toEmail.includes('@')) {
      setError('Recipient email is missing or invalid.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    sendMutation.mutate({
      to: toEmail,
      subject: `Outreach from PingForge`,
      content: result,
      campaignId: selectedCampaign || undefined,
      leadId: selectedLead || undefined
    });
  };

  const handleSendLinkedIn = () => {
    const lead = leads?.find(l => l._id === selectedLead);
    // LinkedIn doesn't have a reliable "send message" URL with body, but we can open the profile
    const linkedinUrl = lead?.linkedinUrl || `https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(context.name + ' ' + context.company)}`;
    
    // Copy result to clipboard first for easy pasting
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    window.open(linkedinUrl, '_blank');
  };

  return (
    <div className="page outreach-page">
      <div className="outreach-grid">
        <div className="outreach-config card">
          <h3 className="font-semibold" style={{ marginBottom: 20 }}>Configure Message</h3>

          <div className="form-group">
            <label className="label">Link to Campaign</label>
            <select className="input" value={selectedCampaign} onChange={e => setSelectedCampaign(e.target.value)}>
              <option value="">No Campaign (Tracking Disabled)</option>
              {campaigns?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="label">Select Lead</label>
            <select className="input" value={selectedLead} onChange={e => setSelectedLead(e.target.value)}>
              <option value="">Manual Entry</option>
              {leads?.map(l => <option key={l._id} value={l._id}>{l.name} {l.company ? `(${l.company})` : ''}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="label">Message Type</label>
            <select className="input" value={type} onChange={e => setType(e.target.value)}>
              <option value="cold_email">Cold Email</option>
              <option value="linkedin_dm">LinkedIn DM</option>
              <option value="follow_up">Follow Up</option>
              <option value="investor">Investor Pitch</option>
              <option value="partnership">Partnership</option>
            </select>
          </div>

          <div className="form-group">
            <label className="label">Tone</label>
            <select className="input" value={tone} onChange={e => setTone(e.target.value)}>
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="direct">Direct</option>
              <option value="startup">Startup</option>
              <option value="concise">Concise</option>
            </select>
          </div>

          <div className="form-group"><label className="label">Recipient Name</label><input className="input" value={context.name} onChange={e => setContext({ ...context, name: e.target.value })} placeholder="Jane Doe" /></div>
          <div className="form-group"><label className="label">Company</label><input className="input" value={context.company} onChange={e => setContext({ ...context, company: e.target.value })} placeholder="Acme Inc" /></div>
          <div className="form-group"><label className="label">Title</label><input className="input" value={context.title} onChange={e => setContext({ ...context, title: e.target.value })} placeholder="VP of Sales" /></div>
          <div className="form-group"><label className="label">Additional Context</label><textarea className="input" rows={3} value={additional} onChange={e => setAdditional(e.target.value)} placeholder="Any extra info for the AI..." /></div>

          <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} onClick={handleGenerate} disabled={loading}>
            {loading ? <Loader2 size={16} className="spinning" /> : <><Sparkles size={16} /> Generate</>}
          </button>
        </div>

        <div className="outreach-result">
          <div className="result-header">
            <h3 className="font-semibold">Generated Message</h3>
            {result && (
              <div className="result-actions" style={{ display: 'flex', gap: 8 }}>
                {error && <span className="text-xs" style={{ color: 'var(--danger)', alignSelf: 'center' }}>{error}</span>}
                <button className="btn btn-secondary btn-sm" onClick={handleCopy}>
                  {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                </button>
                <button className="btn btn-secondary btn-sm" style={{ color: '#0077b5' }} onClick={handleSendLinkedIn}>
                  <ExternalLink size={14} /> Open LinkedIn
                </button>
                <button className="btn btn-primary btn-sm" onClick={handleSendEmail} disabled={sendMutation.isPending}>
                  {sendMutation.isPending ? <Loader2 size={14} className="spinning" /> : sendSuccess ? <><Check size={14} /> Sent!</> : <><Mail size={14} /> Send Email</>}
                </button>
              </div>
            )}
          </div>
          <div className="result-body card">
            {loading ? (
              <div className="result-loading"><Loader2 size={24} className="spinning" /><p className="text-secondary">Generating your message...</p></div>
            ) : result ? (
              <motion.pre className="result-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{result}</motion.pre>
            ) : (
              <p className="text-secondary" style={{ textAlign: 'center', padding: 40 }}>Configure your message and click Generate to create AI-powered outreach.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
