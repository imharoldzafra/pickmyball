import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  user: any;
  profile: UserProfile | null;
  loading: boolean;
  loginMock: () => void;
  logoutMock: () => void;
  updateProfileMock: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  loginMock: () => {},
  logoutMock: () => {},
  updateProfileMock: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);


  const loginMock = () => {
    const u = { uid: 'mock-user-123', displayName: 'Guest Player' };
    localStorage.setItem('mockUser', JSON.stringify(u));
    setUser(u);
    setProfile({
      uid: 'mock-user-123',
      displayName: 'Guest Player',
      level: 1,
      xp: 0,
      rating: 0,
      rank: 'Rookie',
      wins: 0,
      losses: 0,
      battles: 0,
      currentStreak: 0,
      longestStreak: 0,
      highestRating: 0,
      createdAt: Date.now(),
    });
  };

  const logoutMock = () => {
    localStorage.removeItem('mockUser');
    setUser(null);
    setProfile(null);
  };

  const updateProfileMock = (updates: Partial<UserProfile>) => {
    setProfile(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      // Save full profile to local storage so it persists in mock mode
      localStorage.setItem('mockProfile', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('mockUser');
    const savedProfile = localStorage.getItem('mockProfile');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      } else {
        setProfile({
          uid: 'mock-user-123',
          displayName: 'Guest Player',
          level: 1,
          xp: 0,
          rating: 0,
          rank: 'Rookie',
          wins: 0,
          losses: 0,
          battles: 0,
          currentStreak: 0,
          longestStreak: 0,
          highestRating: 0,
          createdAt: Date.now(),
        });
      }
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginMock, logoutMock, updateProfileMock }}>
      {children}
    </AuthContext.Provider>
  );
};
