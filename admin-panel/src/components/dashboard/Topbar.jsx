import { useState, useRef, useEffect, memo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, Bell, Search, LogOut, User as UserIcon, ChevronRight, Menu, CheckCheck, Trash2, ExternalLink } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNotificationContext } from '../../context/NotificationContext';
import api from '../../utils/api';
import NotificationCard from '../notifications/NotificationCard';

const TopbarAvatar = memo(({ src, name, email }) => {
  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : email
      ? email[0].toUpperCase()
      : 'A';

  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white dark:ring-gray-950 hover:ring-blue-300 dark:hover:ring-blue-700 transition-all cursor-pointer shrink-0 overflow-hidden">
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

const BREADCRUMB_LABELS = {
  dashboard: 'Dashboard',
  analytics: 'Analytics',
  projects: 'Projects',
  messages: 'Messages',
  notifications: 'Notifications',
  settings: 'Settings',
  content: 'Content',
  hero: 'Hero',
  about: 'About',
  skills: 'Skills',
  experience: 'Experience',
  testimonials: 'Testimonials',
  terminal: 'Terminal',
  contact: 'Contact',
  seo: 'SEO',
};

const Topbar = ({ onMenuClick, unreadCount: propUnreadCount, admin }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const {
    unreadCount,
    notifications: recentNotifications,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationContext();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const dropdownRef = useRef(null);
  const bellRef = useRef(null);

  const paths = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = paths.map((p, i) => ({
    label: BREADCRUMB_LABELS[p] || p.charAt(0).toUpperCase() + p.slice(1),
    path: '/' + paths.slice(0, i + 1).join('/'),
  }));

  const effectiveUnread = propUnreadCount !== undefined ? propUnreadCount : unreadCount;

  useEffect(() => {
    const handleClick = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        bellRef.current &&
        !bellRef.current.contains(e.target)
      ) {
        setBellOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (bellOpen) {
      fetchNotifications({ limit: 5 });
    }
  }, [bellOpen, fetchNotifications]);

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // navigate regardless
    }
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/70 dark:bg-[#111827]/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/30 shrink-0">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left: Menu button + Breadcrumb */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 -ml-2"
          >
            <Menu className="w-5 h-5" />
          </button>

          <nav className="hidden sm:flex items-center gap-1.5 text-sm min-w-0">
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.path} className="flex items-center gap-1.5 min-w-0">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                <button
                  onClick={() => navigate(crumb.path)}
                  className={`truncate transition-colors ${
                    i === breadcrumbs.length - 1
                      ? 'text-gray-900 dark:text-white font-semibold'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {crumb.label}
                </button>
              </span>
            ))}
          </nav>

          <h1 className="sm:hidden text-base font-bold text-gray-900 dark:text-white truncate">
            {breadcrumbs[breadcrumbs.length - 1]?.label || 'Dashboard'}
          </h1>
        </div>

        {/* Center: Search */}
        <div className="hidden md:block flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search pages..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-800/60 border border-transparent focus:border-gray-300 dark:focus:border-gray-600 rounded-xl outline-none text-gray-900 dark:text-white placeholder-gray-400 transition-colors"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
          >
            <Search className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
            title={isDarkMode ? 'Light mode' : 'Dark mode'}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notification Bell */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => setBellOpen(!bellOpen)}
              className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {effectiveUnread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold ring-2 ring-white dark:ring-gray-950">
                  {effectiveUnread > 9 ? '9+' : effectiveUnread}
                </span>
              )}
            </button>

            {bellOpen && (
              <div className="absolute right-0 top-10 w-80 sm:w-96 max-w-[calc(100vw-1rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Notifications</h3>
                  <div className="flex items-center gap-1">
                    {effectiveUnread > 0 && (
                      <button
                        onClick={() => { markAllAsRead(); }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="Mark all as read"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
                  {recentNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <Bell className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">No notifications</p>
                    </div>
                  ) : (
                    recentNotifications.map((notif) => (
                      <NotificationCard
                        key={notif._id}
                        notification={notif}
                        onMarkRead={markAsRead}
                        onDelete={deleteNotification}
                        compact={true}
                      />
                    ))
                  )}
                </div>

                <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-2.5">
                  <button
                    onClick={() => { navigate('/dashboard/notifications'); setBellOpen(false); }}
                    className="w-full flex items-center justify-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile avatar dropdown */}
          <div className="relative ml-1" ref={dropdownRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="shrink-0"
            >
              <TopbarAvatar src={admin?.profileImage} name={admin?.name} email={admin?.email} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-10 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 py-2 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {admin?.name || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {admin?.email}
                  </p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => { navigate('/dashboard/settings'); setProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    Settings
                  </button>
                  <button
                    onClick={() => { handleLogout(); setProfileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search pages..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl outline-none text-gray-900 dark:text-white placeholder-gray-400"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Topbar;
