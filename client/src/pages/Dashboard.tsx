import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, Megaphone, Send, TrendingUp, Loader2 } from 'lucide-react';
import { analyticsApi } from '../api';
import type { DashboardStats } from '../types';
import './Dashboard.css';

const statCards = [
  { key: 'leads' as const, label: 'Total Leads', icon: Users, color: '#3b82f6' },
  { key: 'campaigns' as const, label: 'Campaigns', icon: Megaphone, color: '#8b5cf6' },
  { key: 'messagesSent' as const, label: 'Messages Sent', icon: Send, color: '#22c55e' },
  { key: 'replyRate' as const, label: 'Reply Rate', icon: TrendingUp, color: '#f59e0b', suffix: '%' },
];

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await analyticsApi.dashboard();
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="page-loading">
        <Loader2 size={28} className="spinning" />
      </div>
    );
  }

  const stats = data as DashboardStats | undefined;

  return (
    <div className="dashboard">
      <div className="stats-grid">
        {statCards.map((s, i) => (
          <motion.div
            key={s.key}
            className="stat-card card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="stat-icon" style={{ background: `${s.color}18`, color: s.color }}>
              <s.icon size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-value">
                {stats?.[s.key] ?? 0}{s.suffix || ''}
              </span>
              <span className="stat-label">{s.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="dashboard-section">
        <h2 className="section-title">Recent Activity</h2>
        <div className="activity-list card">
          {stats?.recentActivity?.length ? (
            stats.recentActivity.map((a) => (
              <div key={a._id} className="activity-item">
                <div className="activity-dot" />
                <div className="activity-content">
                  <p className="text-sm">{a.description}</p>
                  <span className="text-xs text-tertiary">
                    {new Date(a.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-secondary text-sm" style={{ padding: '20px', textAlign: 'center' }}>
              No recent activity. Start by adding leads and creating campaigns.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
