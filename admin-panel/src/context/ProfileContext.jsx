import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useSocketContext } from './SocketContext';
import api from '../utils/api';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocketContext();
  const fetchedRef = useRef(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get('/api/auth/me');
      if (res.success) {
        setProfile(res.data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchProfile();
    }
  }, [fetchProfile]);

  useEffect(() => {
    if (!socket) return;

    const handleProfileUpdate = (data) => {
      setProfile((prev) => ({
        ...prev,
        _id: data.id ?? prev?._id,
        name: data.name ?? prev?.name,
        role: data.role ?? prev?.role,
        email: data.email ?? prev?.email,
        profileImage: data.avatar ?? prev?.profileImage,
        twoFactorEnabled: data.twoFactorEnabled ?? prev?.twoFactorEnabled,
        updatedAt: data.updatedAt ?? prev?.updatedAt,
      }));
    };

    socket.on('profile:update', handleProfileUpdate);

    return () => {
      socket.off('profile:update', handleProfileUpdate);
    };
  }, [socket]);

  const updateProfile = useCallback((updatedProfile) => {
    setProfile((prev) => ({
      ...prev,
      ...updatedProfile,
    }));
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, setProfile, updateProfile, loading, fetchProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileContext() {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error('useProfileContext must be used within a ProfileProvider');
  }
  return ctx;
}
