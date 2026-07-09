import { useState, useEffect, memo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  FolderOpen,
  MessageSquare,
  FileText,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  X,
  Eye,
  Code,
  Briefcase,
  Star,
  MessageSquare as MessageSquareIcon,
  Monitor,
  User as UserIcon,
  Menu as MenuIcon,
  Copyright,
  Shield,
  Activity,
  Share2,
  ImageIcon,
} from 'lucide-react';
import api from '../../utils/api';

const AdminAvatar = memo(({ src, name, email }) => {
  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : email
      ? email[0].toUpperCase()
      : 'A';

  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold ring-2 ring-white dark:ring-gray-950 shrink-0 overflow-hidden">
      {src ? (
        <img
          key={src}
          src={src}
          alt=""
          className="w-full h-full object-cover animate-in fade-in duration-200"
        />
      ) : (
        initials
      )}
    </div>
  );
});

const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
      { path: '/dashboard/metrics', label: 'Metrics', icon: Activity },
      { path: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
    ],
  },
  {
    label: 'Content',
    expandable: true,
    items: [
      { path: '/dashboard/content/navbar', label: 'Navbar Editor', icon: MenuIcon },
      { path: '/dashboard/content/social-links', label: 'Social Links', icon: Share2 },
      { path: '/dashboard/content/media-library', label: 'Media Library', icon: ImageIcon },
      { path: '/dashboard/content/footer', label: 'Footer Editor', icon: Copyright },
      { path: '/dashboard/content/hero', label: 'Hero Section', icon: Eye },
      { path: '/dashboard/content/about', label: 'About Section', icon: UserIcon },
      { path: '/dashboard/content/skills', label: 'Skills Section', icon: Code },
      { path: '/dashboard/content/experience', label: 'Experience', icon: Briefcase },
      { path: '/dashboard/content/projects', label: 'Projects', icon: FolderOpen },
      { path: '/dashboard/content/testimonials', label: 'Testimonials', icon: Star },
      { path: '/dashboard/content/terminal', label: 'Terminal', icon: Monitor },
      { path: '/dashboard/content/contact', label: 'Contact', icon: MessageSquareIcon },
    ],
  },
  {
    label: 'System',
    items: [
      { path: '/dashboard/notifications', label: 'Notifications', icon: Bell },
      { path: '/dashboard/security', label: 'Security', icon: Shield },
      { path: '/dashboard/settings', label: 'Settings', icon: Settings },
    ],
  },
];

const Sidebar = ({ open, onClose, admin }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [contentExpanded, setContentExpanded] = useState(true);

  useEffect(() => {
    if (location.pathname.startsWith('/dashboard/content')) {
      setContentExpanded(true);
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // navigate regardless
    }
    navigate('/login');
  };

  const initials = admin?.name
    ? admin.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : admin?.email
      ? admin.email[0].toUpperCase()
      : 'A';

  const sidebarContent = (
    <div className="flex h-full flex-col bg-gray-100 dark:bg-[#0B1220] border-r border-gray-300/60 dark:border-gray-700/30 shadow-[1px_0_3px_-1px_rgba(0,0,0,0.08)] dark:shadow-[1px_0_4px_-1px_rgba(0,0,0,0.4)]">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-16 shrink-0 border-b border-gray-300/50 dark:border-gray-700/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm ring-1 ring-white/10">
            <span className="text-white text-sm font-bold">P</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Portfolio CMS</h1>
            <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 leading-tight">v2.0</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 scrollbar-thin space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="flex items-center justify-between px-3 mb-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-500">
                {group.label}
              </p>
              {group.expandable && (
                <button
                  onClick={() => setContentExpanded(!contentExpanded)}
                  className="p-0.5 rounded hover:bg-white/70 dark:hover:bg-white/[0.06] text-gray-400"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${contentExpanded ? '' : '-rotate-90'}`} />
                </button>
              )}
            </div>

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = item.path === '/dashboard'
                  ? location.pathname === '/dashboard'
                  : location.pathname.startsWith(item.path);

                // If this is a content item and content section is collapsed, don't render
                if (group.expandable && !contentExpanded) return null;

                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`
                      relative flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-r-xl transition-all duration-200
                      ${active
                        ? 'bg-blue-100/70 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3.5px] before:h-5 before:bg-blue-500 before:rounded-r-full before:shadow-sm before:shadow-blue-500/30 font-semibold'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-white/[0.06] hover:text-gray-900 dark:hover:text-gray-200'
                      }
                    `}
                  >
                    {Icon && (
                      <span className={`shrink-0 transition-colors duration-200 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
                        <Icon className="w-[18px] h-[18px]" />
                      </span>
                    )}
                    <span className="transition-colors duration-200">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Profile Card */}
      <div className="shrink-0 border-t border-gray-300/50 dark:border-gray-700/30 px-3 py-4">
        <button
          onClick={() => navigate('/dashboard/settings')}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/70 dark:hover:bg-white/[0.04] transition-colors group"
        >
          <AdminAvatar src={admin?.profileImage} name={admin?.name} email={admin?.email} />
          <div className="min-w-0 flex-1 text-left">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {admin?.name || 'Admin'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
              {admin?.role || 'Full Stack Developer'}
            </p>
          </div>
        </button>

        <div className="mt-2 flex items-center gap-1">
          <button
            onClick={() => navigate('/dashboard/settings')}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-500 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-white/[0.06] transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-500 dark:text-red-400 hover:bg-red-100/50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile/tablet overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      {/* Mobile/tablet drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-out lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0">
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
