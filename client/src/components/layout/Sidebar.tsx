import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Megaphone,
  Sparkles,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  Zap,
} from 'lucide-react';
import { useAuthStore, useUIStore } from '../../store/index.ts';
import { authApi } from '../../api';
import './Sidebar.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/leads', label: 'Leads', icon: Users },
  { path: '/campaigns', label: 'Campaigns', icon: Megaphone },
  { path: '/outreach', label: 'Outreach', icon: Sparkles },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { logout: clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch { /* continue */ }
    clearAuth();
    navigate('/login');
  };

  return (
    <aside className={`sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Zap size={22} className="logo-icon" />
          {sidebarOpen && <span className="logo-text">PingForge</span>}
        </div>
        <button className="btn-icon sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
          <ChevronLeft size={18} className={`toggle-icon ${!sidebarOpen ? 'rotated' : ''}`} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Icon size={20} />
            {sidebarOpen && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
