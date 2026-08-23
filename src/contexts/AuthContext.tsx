import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  user: any;
  profile: UserProfile | null;
  loading: boolean;
  loginMock: (displayName?: string) => void;
  signupMock: (displayName: string, email?: string) => void;
  logoutMock: () => void;
  updateProfileMock: (updates: Partial<UserProfile>) => void;
  recordMatchResult: (won: boolean, xp: number, crChange: number, matchDetails: any) => void;
}

const getRankFromRating = (rating: number): string => {
  if (rating >= 2500) return 'Legend';
  if (rating >= 1600) return 'Expert';
  if (rating >= 1200) return 'Veteran';
  if (rating >= 800) return 'Challenger';
  return 'Rookie';
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  loginMock: () => {},
  signupMock: () => {},
  logoutMock: () => {},
  updateProfileMock: () => {},
  recordMatchResult: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loginMock = (displayName = 'nasty') => {
    const u = { uid: 'mock-user-123', displayName };
    localStorage.setItem('mockUser', JSON.stringify(u));
    setUser(u);
    const existingProfile = localStorage.getItem('mockProfile');
    if (existingProfile) {
      setProfile(JSON.parse(existingProfile));
    } else {
      const initialProfile: UserProfile = {
        uid: 'mock-user-123',
        displayName,
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
      };
      localStorage.setItem('mockProfile', JSON.stringify(initialProfile));
      setProfile(initialProfile);
    }
  };

  const signupMock = (displayName: string, email?: string) => {
    const name = displayName.trim() || 'Player One';
    const u = { uid: `user-${Date.now().toString(36)}`, displayName: name, email };
    localStorage.setItem('mockUser', JSON.stringify(u));
    setUser(u);
    const newProfile: UserProfile = {
      uid: u.uid,
      displayName: name,
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
    };
    localStorage.setItem('mockProfile', JSON.stringify(newProfile));
    setProfile(newProfile);
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
      if (updated.rating !== undefined) {
        updated.rank = getRankFromRating(updated.rating);
      }
      localStorage.setItem('mockProfile', JSON.stringify(updated));
      return updated;
    });
  };

  const recordMatchResult = (won: boolean, xpEarned: number, crChange: number, matchDetails: any) => {
    // 1. Update match history records in localStorage
    const savedHistory = localStorage.getItem('matchHistory');
    const historyList = savedHistory ? JSON.parse(savedHistory) : [];
    const newRecord = {
      id: matchDetails.id || `PKB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      type: matchDetails.type || '1v1 Competitive',
      opponent: matchDetails.opponent || (won ? 'Opponent' : 'Champion'),
      score: matchDetails.score || '11 - 9, 11 - 8',
      result: won ? 'WON' : 'LOST',
      xpEarned: `+${xpEarned} XP`,
      crChange: crChange >= 0 ? `+${crChange} CR` : `${crChange} CR`
    };
    const updatedHistory = [newRecord, ...historyList];
    localStorage.setItem('matchHistory', JSON.stringify(updatedHistory));

    // 2. Update user profile
    setProfile(prev => {
      if (!prev) return prev;
      const newBattles = prev.battles + 1;
      const newWins = won ? prev.wins + 1 : prev.wins;
      const newLosses = !won ? prev.losses + 1 : prev.losses;
      const newStreak = won ? prev.currentStreak + 1 : 0;
      const newLongest = Math.max(prev.longestStreak, newStreak);
      const newRating = Math.max(0, prev.rating + crChange);
      const newHighest = Math.max(prev.highestRating, newRating);
      
      const newXp = prev.xp + xpEarned;
      const xpNeeded = prev.level * 1000;
      const newLevel = newXp >= xpNeeded ? prev.level + 1 : prev.level;
      const remainingXp = newXp >= xpNeeded ? newXp - xpNeeded : newXp;

      const updated: UserProfile = {
        ...prev,
        battles: newBattles,
        wins: newWins,
        losses: newLosses,
        currentStreak: newStreak,
        longestStreak: newLongest,
        rating: newRating,
        highestRating: newHighest,
        xp: remainingXp,
        level: newLevel,
        rank: getRankFromRating(newRating),
      };
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
          wins: 5,
          losses: 0,
          battles: 5,
          currentStreak: 5,
          longestStreak: 5,
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
