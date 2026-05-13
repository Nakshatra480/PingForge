import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import AIOperator from './AIOperator';
import { useUIStore } from '../../store/index.ts';
import './AppShell.css';

export default function AppShell() {
  const { sidebarOpen } = useUIStore();

  return (
    <div className={`app-shell ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      <Sidebar />
      <div className="app-main">
        <TopBar />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
      <AIOperator />
    </div>
  );
}
