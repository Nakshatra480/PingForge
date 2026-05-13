import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, X, Loader2, User, Building, Tag } from 'lucide-react';
import { leadApi, campaignApi } from '../api';
import type { Lead } from '../types';
import './Pages.css';

const stageColors: Record<string, string> = {
  cold: 'badge-blue', warm: 'badge-amber', hot: 'badge-red', engaged: 'badge-green', closed: 'badge-neutral',
};

export default function Leads() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['leads', search],
    queryFn: async () => {
      const res = await leadApi.list({ search: search || undefined, limit: 50 });
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => leadApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });

  const replyMutation = useMutation({
    mutationFn: (leadId: string) => campaignApi.trackReplyByLead(leadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    }
  });

  const handleMarkReplied = (leadId: string) => {
    replyMutation.mutate(leadId);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input className="input search-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search leads..." />
        </div>
        <button className="btn btn-primary" onClick={() => { setEditLead(null); setShowModal(true); }}>
          <Plus size={16} /> Add Lead
        </button>
      </div>

      {isLoading ? (
        <div className="page-loading"><Loader2 size={24} className="spinning" /></div>
      ) : (
        <div className="table-wrap card">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th><th>Company</th><th>Stage</th><th>Score</th><th>Tags</th><th></th>
              </tr>
            </thead>
            <tbody>
              {(data as Lead[] | undefined)?.length ? (data as Lead[]).map((lead, i) => (
                <motion.tr key={lead._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                  <td>
                    <div className="lead-name">
                      <User size={14} />
                      <div>
                        <span className="font-medium">{lead.name}</span>
                        {lead.email && <span className="text-xs text-tertiary" style={{ display: 'block' }}>{lead.email}</span>}
                      </div>
                    </div>
                  </td>
                  <td><span className="text-secondary">{lead.company || '-'}</span></td>
                  <td><span className={`badge ${stageColors[lead.stage]}`}>{lead.stage}</span></td>
                  <td><span className="font-medium">{lead.engagementScore}</span></td>
                  <td>
                    <div className="tags-row">
                      {lead.tags?.slice(0, 3).map(t => <span key={t} className="badge badge-neutral">{t}</span>)}
                    </div>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--success)' }} onClick={() => handleMarkReplied(lead._id)}>Replied</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setEditLead(lead); setShowModal(true); }}>Edit</button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => deleteMutation.mutate(lead._id)}>Delete</button>
                    </div>
                  </td>
                </motion.tr>
              )) : (
                <tr><td colSpan={6} className="empty-state">No leads yet. Click "Add Lead" to get started.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {showModal && <LeadModal lead={editLead} onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}

function LeadModal({ lead, onClose }: { lead: Lead | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: lead?.name || '', email: lead?.email || '', company: lead?.company || '',
    title: lead?.title || '', stage: lead?.stage || 'cold', tags: lead?.tags?.join(', ') || '', notes: lead?.notes || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] };
    try {
      if (lead) await leadApi.update(lead._id, payload);
      else await leadApi.create(payload);
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      onClose();
    } catch { /* handle error */ }
    setLoading(false);
  };

  return (
    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="modal card" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{lead ? 'Edit Lead' : 'Add Lead'}</h2>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group"><label className="label">Name</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="form-group"><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="label">Company</label><input className="input" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} /></div>
            <div className="form-group"><label className="label">Title</label><input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="label">Stage</label>
              <select className="input" value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value as any })}>
                <option value="cold">Cold</option><option value="warm">Warm</option><option value="hot">Hot</option><option value="engaged">Engaged</option><option value="closed">Closed</option>
              </select>
            </div>
            <div className="form-group"><label className="label">Tags (comma separated)</label><input className="input" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} /></div>
          </div>
          <div className="form-group"><label className="label">Notes</label><textarea className="input" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? <Loader2 size={16} className="spinning" /> : lead ? 'Save' : 'Add Lead'}</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
