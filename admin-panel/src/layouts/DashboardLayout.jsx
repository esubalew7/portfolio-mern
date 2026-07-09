import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import { SocketProvider } from '../context/SocketContext';
import { NotificationProvider } from '../context/NotificationContext';
import { ProfileProvider, useProfileContext } from '../context/ProfileContext';
import { useSocketContext } from '../context/SocketContext';

const STATUS_CONFIG = {
  connected: { bg: 'bg-green-100 dark:bg-green-900/40', border: 'border-green-200 dark:border-green-700/50', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500', label: 'Connected' },
  reconnecting: { bg: 'bg-yellow-100 dark:bg-yellow-900/40', border: 'border-yellow-200 dark:border-yellow-700/50', text: 'text-yellow-700 dark:text-yellow-300', dot: 'bg-yellow-500', label: 'Reconnecting...' },
  disconnected: { bg: 'bg-red-100 dark:bg-red-900/40', border: 'border-red-200 dark:border-red-700/50', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500', label: 'Disconnected' },
};

const DashboardInner = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile: admin } = useProfileContext();
  const { status } = useSocketContext();
  const statusStyle = STATUS_CONFIG[status] || STATUS_CONFIG.disconnected;

  return (
    <div className="min-h-screen bg-white dark:bg-[#111827] text-gray-900 dark:text-gray-100">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        admin={admin}
      />

      <div className="lg:pl-72 flex flex-col min-h-screen">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          admin={admin}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
            <Outlet />
          </div>
        </main>
      </div>

      {status !== 'connected' && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`flex items-center gap-2 px-3 py-2 ${statusStyle.bg} border ${statusStyle.border} rounded-xl text-xs font-medium ${statusStyle.text} shadow-lg`}>
            <span className={`w-2 h-2 rounded-full ${statusStyle.dot} ${status === 'reconnecting' ? 'animate-pulse' : ''}`} />
            {statusStyle.label}
          </div>
        </div>
      )}
    </div>
  );
};

const DashboardLayout = () => {
  return (
    <SocketProvider>
      <NotificationProvider>
        <ProfileProvider>
          <DashboardInner />
        </ProfileProvider>
      </NotificationProvider>
    </SocketProvider>
  );
};

export default DashboardLayout;
