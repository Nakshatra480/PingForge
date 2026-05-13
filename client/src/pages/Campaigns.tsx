import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Loader2, Play, Pause } from 'lucide-react';
import { campaignApi } from '../api';
import type { Campaign } from '../types';
import './Pages.css';

const statusColors: Record<string, string> = {
  draft: 'badge-neutral', active: 'badge-green', paused: 'badge-amber', completed: 'badge-blue',
};

export default function Campaigns() {
  const [showModal, setShowModal] = useState(false);
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => { const res = await campaignApi.list({ limit: 50 }); return res.data; },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Campaign> }) => campaignApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['campaigns'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => campaignApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['campaigns'] }),
  });

  return (
    <div className="page">
      <div className="page-header">
        <h2 className="text-lg font-semibold">All Campaigns</h2>
        <button className="btn btn-primary" onClick={() => { setEditCampaign(null); setShowModal(true); }}>
          <Plus size={16} /> New Campaign
        </button>
      </div>

      {isLoading ? (
        <div className="page-loading"><Loader2 size={24} className="spinning" /></div>
      ) : (
        <div className="card-grid">
          {(data as Campaign[] | undefined)?.length ? (data as Campaign[]).map((c, i) => (
            <motion.div key={c._id} className="campaign-card card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="campaign-card-header">
                <h3 className="font-semibold">{c.name}</h3>
                <span className={`badge ${statusColors[c.status]}`}>{c.status}</span>
              </div>
              {c.description && <p className="text-sm text-secondary">{c.description}</p>}
              <div className="campaign-stats">
                <div className="campaign-stat"><span className="stat-num">{c.targetCount}</span><span className="text-xs text-tertiary">Targets</span></div>
                <div className="campaign-stat"><span className="stat-num">{c.sentCount}</span><span className="text-xs text-tertiary">Sent</span></div>
                <div className="campaign-stat"><span className="stat-num">{c.replyCount}</span><span className="text-xs text-tertiary">Replies</span></div>
                <div className="campaign-stat"><span className="stat-num">{c.sentCount > 0 ? Math.round((c.replyCount / c.sentCount) * 100) : 0}%</span><span className="text-xs text-tertiary">Rate</span></div>
              </div>
              <div className="campaign-actions">
                {c.status === 'draft' && <button className="btn btn-primary btn-sm" onClick={() => updateMutation.mutate({ id: c._id, data: { status: 'active' } })}><Play size={14} /> Launch</button>}
                {c.status === 'active' && <button className="btn btn-secondary btn-sm" onClick={() => updateMutation.mutate({ id: c._id, data: { status: 'paused' } })}><Pause size={14} /> Pause</button>}
                {c.status === 'paused' && <button className="btn btn-primary btn-sm" onClick={() => updateMutation.mutate({ id: c._id, data: { status: 'active' } })}><Play size={14} /> Resume</button>}
                <button className="btn btn-ghost btn-sm" onClick={() => { setEditCampaign(c); setShowModal(true); }}>Edit</button>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => deleteMutation.mutate(c._id)}>Delete</button>
              </div>
            </motion.div>
          )) : (
            <div className="empty-state card" style={{ gridColumn: '1 / -1', padding: 40 }}>No campaigns yet. Create your first campaign to start outreach.</div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showModal && <CampaignModal campaign={editCampaign} onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}

function CampaignModal({ campaign, onClose }: { campaign: Campaign | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: campaign?.name || '', description: campaign?.description || '', type: campaign?.type || 'cold_outreach',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (campaign) await campaignApi.update(campaign._id, form);
      else await campaignApi.create(form);
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      onClose();
    } catch { /* handle */ }
    setLoading(false);
  };

  return (
    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="modal card" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>{campaign ? 'Edit Campaign' : 'New Campaign'}</h2><button className="btn-icon" onClick={onClose}><X size={18} /></button></div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group"><label className="label">Name</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="form-group"><label className="label">Description</label><textarea className="input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div className="form-group">
            <label className="label">Type</label>
            <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })}>
              <option value="cold_outreach">Cold Outreach</option><option value="follow_up">Follow Up</option><option value="investor">Investor</option><option value="partnership">Partnership</option>
            </select>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <Loader2 size={16} className="spinning" /> : campaign ? 'Save' : 'Create'}</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
