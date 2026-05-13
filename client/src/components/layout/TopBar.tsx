import { useLocation } from 'react-router-dom';
import { Menu, Bot } from 'lucide-react';
import { useAuthStore, useUIStore } from '../../store/index.ts';
import './TopBar.css';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/leads': 'Leads',
  '/campaigns': 'Campaigns',
  '/outreach': 'AI Outreach',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
};

export default function TopBar() {
  const { pathname } = useLocation();
  const { user } = useAuthStore();
  const { toggleSidebar, toggleAIOperator } = useUIStore();

  const title = pageTitles[pathname] || 'PingForge';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="btn-icon topbar-menu" onClick={toggleSidebar} aria-label="Toggle menu">
          <Menu size={20} />
        </button>
        <h1 className="topbar-title">{title}</h1>
      </div>

      <div className="topbar-right">
        <button className="btn btn-secondary btn-sm ai-trigger" onClick={toggleAIOperator}>
          <Bot size={16} />
          <span>AI Operator</span>
        </button>
        <div className="topbar-avatar" title={user?.name || ''}>
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
