import { useState, useEffect, useRef, useCallback } from 'react';
import { Moon, Sun, Bell, Shield, Mail, Camera, Save, RefreshCw, Eye, EyeOff, CheckCircle, XCircle, AlertTriangle, Lock } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';

const PASSWORD_RULES = [
  { label: 'Minimum 8 characters', test: (p) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'Number', test: (p) => /\d/.test(p) },
  { label: 'Special character', test: (p) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(p) },
];

const getStrength = (password) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++;
  if (password.length >= 12) score++;
  return Math.min(score, 5);
};

const strengthLabels = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
const strengthTextColors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-lime-500', 'text-green-500'];

const PasswordField = ({ id, label, placeholder, value, onChange, show, onToggle, error, disabled }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-2.5 pr-11 bg-gray-50 dark:bg-gray-800 border rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          error ? 'border-red-400 dark:border-red-500 focus:ring-red-500' : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500'
        }`}
      />
      <button
        type="button"
        onClick={onToggle}
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
    {error && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertTriangle size={12} />{error}</p>}
  </div>
);

const Settings = () => {
  const { showToast } = useToast();
  const { isDarkMode, toggleTheme } = useTheme();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState({ name: '', role: '', email: '' });
  const [profileImage, setProfileImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changing, setChanging] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = useCallback(() => {
    const e = {};
    if (!currentPassword) e.currentPassword = 'Current password is required';
    if (!newPassword) {
      e.newPassword = 'New password is required';
    } else if (currentPassword && newPassword === currentPassword) {
      e.newPassword = 'New password cannot be same as current password';
    } else {
      if (!PASSWORD_RULES[0].test(newPassword)) e.newPassword = 'Must be at least 8 characters';
      else if (!PASSWORD_RULES[1].test(newPassword)) e.newPassword = 'Needs an uppercase letter';
      else if (!PASSWORD_RULES[2].test(newPassword)) e.newPassword = 'Needs a lowercase letter';
      else if (!PASSWORD_RULES[3].test(newPassword)) e.newPassword = 'Needs a number';
      else if (!PASSWORD_RULES[4].test(newPassword)) e.newPassword = 'Needs a special character';
    }
    if (!confirmPassword) {
      e.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      e.confirmPassword = 'Passwords do not match';
    }
    return e;
  }, [currentPassword, newPassword, confirmPassword]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/auth/me');
        if (res.success) {
          setProfile({
            name: res.data.name || '',
            role: res.data.role || '',
            email: res.data.email || '',
          });
          setProfileImage(res.data.profileImage || '');
        }
      } catch (err) {
        showToast('Failed to load profile', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [showToast]);

  useEffect(() => {
    if (Object.keys(touched).length > 0) {
      setErrors(validate());
    }
  }, [currentPassword, newPassword, confirmPassword, touched, validate]);

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result || '');
    reader.readAsDataURL(file);
  };

  const handleUploadImage = async () => {
    if (!imageFile) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', imageFile);
      const res = await api.post('/api/auth/profile/image', formData);
      if (res.success) {
        setProfileImage(res.data.profileImage);
        setImageFile(null);
        setImagePreview('');
        showToast('Profile picture updated!');
      }
    } catch (err) {
      showToast('Failed to upload image: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const res = await api.put('/api/auth/profile', {
        name: profile.name,
        role: profile.role,
      });
      if (res.success) {
        showToast('Profile saved!');
        setProfile((prev) => ({ ...prev, name: res.data.name, role: res.data.role }));
      }
    } catch (err) {
      showToast('Failed to save: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    const validationErrors = validate();
    setTouched({ currentPassword: true, newPassword: true, confirmPassword: true });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      setChanging(true);
      const res = await api.put('/api/auth/change-password', {
        currentPassword,
        newPassword,
      });
      if (res.success) {
        showToast(res.message || 'Password changed successfully!', 'success');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
    } catch (err) {
      const message = err?.data?.message || err?.message || 'Failed to change password';
      showToast(message, 'error');
    } finally {
      setChanging(false);
    }
  };

  const handleCancel = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
    setTouched({});
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const strength = getStrength(newPassword);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const avatarSrc = imagePreview || profileImage;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your profile and preferences.</p>
      </div>

      {/* Profile */}
      <Card>
        <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Profile</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Update your personal information.</p>
        </div>

        <div className="mt-6 space-y-6">
          {/* Avatar upload */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-gray-100 dark:ring-gray-800 overflow-hidden">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="" className="w-full h-full object-cover" />
                ) : (
                  profile.name ? profile.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : 'A'
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Profile Picture</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">JPG, PNG or WebP. 1:1 ratio recommended.</p>
              {imageFile && (
                <button
                  onClick={handleUploadImage}
                  disabled={uploading}
                  className="mt-2 px-4 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  {uploading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  {uploading ? 'Uploading...' : 'Save Image'}
                </button>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              placeholder="Your name"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Role / Title</label>
            <input
              type="text"
              value={profile.role}
              onChange={(e) => setProfile((p) => ({ ...p, role: e.target.value }))}
              placeholder="e.g. Full Stack Developer"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
          </div>

          <div className="pt-2">
            <Button
              onClick={handleSaveProfile}
              loading={saving}
              icon={Save}
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Security */}
      <Card glass>
        <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/20">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Security</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Update your administrator password securely.</p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <PasswordField
            id="currentPassword"
            label="Current Password"
            placeholder="Enter your current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            show={showCurrent}
            onToggle={() => setShowCurrent((s) => !s)}
            error={touched.currentPassword && errors.currentPassword}
            disabled={changing}
          />

          <PasswordField
            id="newPassword"
            label="New Password"
            placeholder="Enter a new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            show={showNew}
            onToggle={() => setShowNew((s) => !s)}
            error={touched.newPassword && errors.newPassword}
            disabled={changing}
          />

          {newPassword && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
              {/* Strength bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Password strength</span>
                  <span className={`text-xs font-semibold ${strengthTextColors[strength - 1] || 'text-gray-400'}`}>
                    {strengthLabels[strength - 1] || ''}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${strengthColors[strength - 1] || 'bg-gray-300'}`}
                    style={{ width: `${(strength / 5) * 100}%` }}
                  />
                </div>
              </div>

              {/* Requirements checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {PASSWORD_RULES.map((rule) => {
                  const passed = rule.test(newPassword);
                  return (
                    <div key={rule.label} className="flex items-center gap-2 text-xs">
                      {passed ? (
                        <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle size={14} className="text-gray-300 dark:text-gray-600 flex-shrink-0" />
                      )}
                      <span className={passed ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-400 dark:text-gray-500'}>
                        {rule.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <PasswordField
            id="confirmPassword"
            label="Confirm New Password"
            placeholder="Re-enter your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            show={showConfirm}
            onToggle={() => setShowConfirm((s) => !s)}
            error={touched.confirmPassword && errors.confirmPassword}
            disabled={changing}
          />

          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={handleChangePassword}
              loading={changing}
              icon={Lock}
              disabled={!currentPassword || !newPassword || !confirmPassword}
            >
              {changing ? 'Updating...' : 'Update Password'}
            </Button>
            <Button
              variant="secondary"
              onClick={handleCancel}
              disabled={changing}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Card>

      {/* Appearance */}
      <Card>
        <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Appearance</h2>
        </div>
        <div className="mt-4 flex items-center justify-between py-2">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800">
              {isDarkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Theme</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Toggle between light and dark mode</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 text-sm font-medium rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Notifications</h2>
        </div>
        <div className="mt-2 divide-y divide-gray-100 dark:divide-gray-800">
          {[
            { icon: Bell, label: 'Email Notifications', desc: 'Receive email for new messages and projects', enabled: false },
            { icon: Shield, label: 'Security Alerts', desc: 'Get notified about suspicious login attempts', enabled: true },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center justify-between py-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800">
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors ${item.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${item.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Account */}
      <Card>
        <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Account</h2>
        </div>
        <div className="mt-2 py-4 flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800">
              <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Email Address</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Your admin account email</p>
            </div>
          </div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{profile.email}</span>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
