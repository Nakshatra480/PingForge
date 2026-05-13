import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Loader2, TrendingUp } from 'lucide-react';
import { analyticsApi } from '../api';
import './Pages.css';

export default function Analytics() {
  const { data: dashboard, isLoading: dl } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await analyticsApi.dashboard()).data,
  });

  const { data: campaigns, isLoading: cl } = useQuery({
    queryKey: ['campaign-analytics'],
    queryFn: async () => (await analyticsApi.campaigns()).data,
  });

  if (dl || cl) return <div className="page-loading"><Loader2 size={24} className="spinning" /></div>;

  return (
    <div className="page">
      <motion.div className="analytics-card card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}><TrendingUp size={18} className="text-accent" /><span className="font-semibold">Overview</span></div>
        <div className="analytics-metrics">
          <div className="metric"><span className="metric-value">{dashboard?.leads ?? 0}</span><span className="metric-label">Leads</span></div>
          <div className="metric"><span className="metric-value">{dashboard?.campaigns ?? 0}</span><span className="metric-label">Campaigns</span></div>
          <div className="metric"><span className="metric-value">{dashboard?.messagesSent ?? 0}</span><span className="metric-label">Sent</span></div>
          <div className="metric"><span className="metric-value">{dashboard?.replyRate ?? 0}%</span><span className="metric-label">Reply Rate</span></div>
        </div>
      </motion.div>

      <h2 className="section-title">Campaign Performance</h2>
      <div className="table-wrap card">
        <table className="table">
          <thead><tr><th>Campaign</th><th>Status</th><th>Targets</th><th>Sent</th><th>Replies</th><th>Rate</th></tr></thead>
          <tbody>
            {(campaigns as any[])?.length ? (campaigns as any[]).map((c: any) => (
              <tr key={c._id}>
                <td className="font-medium">{c.name}</td>
                <td><span className={`badge badge-${c.status === 'active' ? 'green' : 'neutral'}`}>{c.status}</span></td>
                <td>{c.targetCount}</td><td>{c.sentCount}</td><td>{c.replyCount}</td><td className="font-medium">{c.replyRate}%</td>
              </tr>
            )) : <tr><td colSpan={6} className="empty-state">No campaign data yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
