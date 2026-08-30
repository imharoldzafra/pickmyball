import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: any;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (identifier: string, password?: string) => Promise<{ error?: string }>;
  signUp: (displayName: string, email: string, password?: string) => Promise<{ error?: string; success?: boolean; needsVerification?: boolean; message?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string; success?: boolean }>;
  loginMock: (displayName?: string, password?: string) => Promise<{ error?: string }>;
  signupMock: (displayName: string, email?: string, password?: string) => Promise<{ error?: string }>;
  logoutMock: () => void;
  updateProfileMock: (updates: Partial<UserProfile>) => Promise<void>;
  recordMatchResult: (won: boolean, xp: number, crChange: number, matchDetails: any) => Promise<void>;
  setStaminaMock: (stamina: number) => Promise<void>;
  toggleRankTierMock: () => Promise<void>;
}

export const getRankFromRating = (rating: number): string => {
  if (rating >= 2000) return 'Legend';
  if (rating >= 1600) return 'Expert';
  if (rating >= 1200) return 'Veteran';
  if (rating >= 800) return 'Challenger';
  return 'Rookie';
};

export const calculateTierCR = (rating: number, userWon: boolean, currentStreak: number = 0) => {
  // Streak bonuses on Win:
  // Streaks 10+ (Godlike): +20 CR
  // Streaks 5-9 (On Fire): +15 CR
  const streakBonus = userWon 
    ? (currentStreak >= 9 ? 20 : currentStreak >= 4 ? 15 : 0)
    : 0;

  if (rating >= 2000) {
    // 👑 Legend (2,000+): +20 win / -30 loss
    return userWon ? 20 + streakBonus : -30;
  }
  if (rating >= 1600) {
    // 💎 Expert (1,600-1,999): +25 win / -25 loss
    return userWon ? 25 + streakBonus : -25;
  }
  if (rating >= 1200) {
    // 🏆 Veteran (1,200-1,599): +30 win / -20 loss
    return userWon ? 30 + streakBonus : -20;
  }
  if (rating >= 800) {
    // 🏓 Challenger (800-1,199): +40 win / -20 loss
    return userWon ? 40 + streakBonus : -20;
  }
  // 🌱 Rookie (0-799): +80 win / -40 loss
  return userWon ? 80 + streakBonus : -40;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signOut: async () => {},
  resetPassword: async () => ({}),
  loginMock: async () => ({}),
  signupMock: async () => ({}),
  logoutMock: () => {},
  updateProfileMock: async () => {},
  recordMatchResult: async () => {},
  setStaminaMock: async () => {},
  toggleRankTierMock: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('mockUser');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('mockProfile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Helper to fetch profile from Supabase profiles table
  const fetchProfile = async (userId: string, userMeta?: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching Supabase profile:', error.message);
      }

      const todayStr = new Date().toISOString().split('T')[0];

      if (data) {
        // Daily Stamina Auto-Reset Check: resets to 100% every new day
        const needsDailyReset = !data.last_stamina_reset || data.last_stamina_reset !== todayStr;
        const initialStamina = needsDailyReset ? 100 : (data.stamina ?? 100);

        const loadedProfile: UserProfile = {
          uid: data.id,
          displayName: data.display_name,
          photoURL: data.avatar_url || data.photo_url || '',
          level: data.level || 1,
          xp: data.xp || 0,
          rating: data.rating || 0,
          rank: data.rank || getRankFromRating(data.rating || 0),
          wins: data.wins || 0,
          losses: data.losses || 0,
          battles: data.battles || 0,
          currentStreak: data.current_streak || 0,
          longestStreak: data.longest_streak || 0,
          highestRating: data.highest_rating || 0,
          createdAt: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
          stamina: initialStamina,
          lastStaminaReset: todayStr,
        };
        setProfile(loadedProfile);
        localStorage.setItem('mockProfile', JSON.stringify(loadedProfile));
      } else {
        // Create initial fallback profile if trigger has delay
        const fallbackName = userMeta?.display_name || 'Player';
        const initialProfile: UserProfile = {
          uid: userId,
          displayName: fallbackName,
          photoURL: '',
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
          stamina: 100,
          lastStaminaReset: todayStr,
        };
        setProfile(initialProfile);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    }
  };

  useEffect(() => {
    // Initial Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id, session.user.user_metadata);
      } else {
        // Check local storage fallback if any
        const savedUser = localStorage.getItem('mockUser');
        const savedProfile = localStorage.getItem('mockProfile');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
          if (savedProfile) setProfile(JSON.parse(savedProfile));
        }
      }
      setLoading(false);
    });

    // Realtime auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id, session.user.user_metadata);
      } else {
        setUser(null);
        setProfile(null);
        localStorage.removeItem('mockUser');
        localStorage.removeItem('mockProfile');
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Realtime subscription for Profile updates (e.g. avatar, rankings, wins)
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`profile-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new) {
            const data: any = payload.new;
            setProfile({
              uid: data.id,
              displayName: data.display_name,
              photoURL: data.avatar_url || data.photo_url || '',
              level: data.level || 1,
              xp: data.xp || 0,
              rating: data.rating || 0,
              rank: data.rank || getRankFromRating(data.rating || 0),
              wins: data.wins || 0,
              losses: data.losses || 0,
              battles: data.battles || 0,
              currentStreak: data.current_streak || 0,
              longestStreak: data.longest_streak || 0,
              highestRating: data.highest_rating || 0,
              createdAt: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const signUp = async (displayName: string, email: string, password = 'password123') => {
    const trimmedName = displayName.trim();
    if (!trimmedName) {
      return { error: 'Please choose a username' };
    }

    // Check if username already exists in Supabase (case-insensitive)
    try {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id, display_name')
        .ilike('display_name', trimmedName)
        .maybeSingle();

      if (existingUser) {
        return { error: 'Username already exists. Please choose a different username.' };
      }
    } catch (err) {
      console.warn('Username check warning:', err);
    }

    const finalEmail = email.trim();
    if (!finalEmail) {
      return { error: 'Please enter a valid email address' };
    }

    const { data, error } = await supabase.auth.signUp({
      email: finalEmail,
      password: password,
      options: {
        data: {
          display_name: trimmedName,
        },
      },
    });

    if (error) {
      if (error.message.toLowerCase().includes('already registered')) {
        return { error: 'An account with this email already exists.' };
      }
      return { error: error.message };
    }

    // When email verification is enabled in Supabase, data.session is null until verified
    if (data.user && !data.session) {
      return {
        success: true,
        needsVerification: true,
        message: `Verification email sent to ${finalEmail}! Please check your inbox (and spam folder) to verify your account before signing in.`
      };
    }

    if (data.user && data.session) {
      setUser(data.user);
      localStorage.setItem('mockUser', JSON.stringify({ uid: data.user.id, displayName: trimmedName, email: finalEmail }));
      await fetchProfile(data.user.id, { display_name: trimmedName });
    }

    return { success: true };
  };

  const signIn = async (identifier: string, password = 'password123') => {
    const trimmed = identifier.trim();
    let emailToUse = trimmed;

    // If identifier is not an email, lookup user by display_name
    if (!trimmed.includes('@')) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('email, display_name')
        .ilike('display_name', trimmed)
        .maybeSingle();

      if (profileData?.email) {
        emailToUse = profileData.email;
      } else {
        emailToUse = `${trimmed.toLowerCase().replace(/[^a-z0-9]/g, '')}@pickmyball.app`;
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailToUse,
      password: password,
    });

    if (error) {
      if (error.message.toLowerCase().includes('invalid login credentials')) {
        return { error: 'Invalid username/email or password.' };
      }
      return { error: error.message };
    }

    if (data.user) {
      setUser(data.user);
      await fetchProfile(data.user.id);
    }

    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('mockUser');
    localStorage.removeItem('mockProfile');
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    const trimmed = email.trim();
    if (!trimmed) {
      return { error: 'Please enter your email address' };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: `${window.location.origin}/`,
    });
    if (error) {
      return { error: error.message };
    }
    return { success: true };
  };

  const updateProfileMock = async (updates: Partial<UserProfile>): Promise<{ error?: string }> => {
    if (!user?.id) return {};
    
    // If updating username (displayName), check if taken
    if (updates.displayName && updates.displayName.trim() !== profile?.displayName) {
      const trimmedName = updates.displayName.trim();
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .ilike('display_name', trimmedName)
        .neq('id', user.id)
        .maybeSingle();

      if (existingUser) {
        return { error: 'Username already exists. Please choose a different username.' };
      }
    }

    // Update local
    setProfile(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      if (updated.rating !== undefined) {
        updated.rank = getRankFromRating(updated.rating);
      }
      return updated;
    });

    // Sync to Supabase
    const dbUpdates: any = {};
    if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName.trim();
    if (updates.photoURL !== undefined) dbUpdates.avatar_url = updates.photoURL;
    if (updates.rating !== undefined) {
      dbUpdates.rating = updates.rating;
      dbUpdates.rank = getRankFromRating(updates.rating);
    }
    if (updates.wins !== undefined) dbUpdates.wins = updates.wins;
    if (updates.losses !== undefined) dbUpdates.losses = updates.losses;
    if (updates.battles !== undefined) dbUpdates.battles = updates.battles;
    if (updates.level !== undefined) dbUpdates.level = updates.level;
    if (updates.xp !== undefined) dbUpdates.xp = updates.xp;
    if (updates.currentStreak !== undefined) dbUpdates.current_streak = updates.currentStreak;
    if (updates.longestStreak !== undefined) dbUpdates.longest_streak = updates.longestStreak;
    if (updates.highestRating !== undefined) dbUpdates.highest_rating = updates.highestRating;

    if (Object.keys(dbUpdates).length > 0) {
      dbUpdates.updated_at = new Date().toISOString();
      const { error } = await supabase.from('profiles').update(dbUpdates).eq('id', user.id);
      if (error) {
        if (error.code === '23505' || error.message.includes('unique')) {
          return { error: 'Username already exists. Please choose a different username.' };
        }
        return { error: error.message };
      }
    }
    return {};
  };

  const recordMatchResult = async (won: boolean, xpEarned: number, crChange: number, matchDetails: any) => {
    // 1. Update match history records in localStorage
    const savedHistory = localStorage.getItem('matchHistory');
    const historyList = savedHistory ? JSON.parse(savedHistory) : [];
    const isReferee = matchDetails?.role === 'REFEREE';

    const newRecord = {
      id: matchDetails.id || `PKB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      type: matchDetails.type || '1v1 Competitive',
      opponent: matchDetails.opponent || (isReferee ? 'Alpha vs Beta' : (won ? 'Opponent' : 'Champion')),
      score: matchDetails.score || '11 - 9, 11 - 8',
      result: isReferee ? 'REFEREED' : (won ? 'WON' : 'LOST'),
      xpEarned: `+${xpEarned} XP`,
      crChange: isReferee ? '+0 CR' : (crChange >= 0 ? `+${crChange} CR` : `${crChange} CR`),
      role: matchDetails?.role || 'PLAYER',
    };
    const updatedHistory = [newRecord, ...historyList].slice(0, 10);
    localStorage.setItem('matchHistory', JSON.stringify(updatedHistory));

    // 2. Update user profile locally and on Supabase
    if (profile) {
      const isChallengerOrHigher = (profile.rating || 0) >= 800;
      let currentStamina = profile.stamina ?? 100;
      let newStamina = currentStamina;

      if (isChallengerOrHigher) {
        if (isReferee) {
          // Refereeing: +20% Stamina Recharge (up to 100%)
          newStamina = Math.min(100, currentStamina + 20);
        } else if (won) {
          if (currentStamina <= 0) {
            // Second Wind Comeback: Win at 0% recharges +10%!
            newStamina = 10;
          } else {
            // Normal Win: 20% match cost - 10% momentum refund = net -10%
            newStamina = Math.max(0, currentStamina - 10);
          }
        } else {
          // Loss: Full 20% Stamina deducted
          newStamina = Math.max(0, currentStamina - 20);
        }
      } else {
        // Rookie Sandbox: Always 100% unlimited
        newStamina = 100;
      }

      const newBattles = isReferee ? profile.battles : profile.battles + 1;
      const newWins = isReferee ? profile.wins : (won ? profile.wins + 1 : profile.wins);
      const newLosses = isReferee ? profile.losses : (!won ? profile.losses + 1 : profile.losses);
      const newStreak = isReferee ? profile.currentStreak : (won ? profile.currentStreak + 1 : 0);
      const newLongest = Math.max(profile.longestStreak, newStreak);
      const newRating = isReferee ? profile.rating : Math.max(0, profile.rating + crChange);
      const newHighest = Math.max(profile.highestRating, newRating);
      
      const newXp = profile.xp + xpEarned;
      const xpNeeded = profile.level * 1000;
      const newLevel = newXp >= xpNeeded ? profile.level + 1 : profile.level;
      const remainingXp = newXp >= xpNeeded ? newXp - xpNeeded : newXp;

      await updateProfileMock({
        battles: newBattles,
        wins: newWins,
        losses: newLosses,
        currentStreak: newStreak,
        longestStreak: newLongest,
        rating: newRating,
        highestRating: newHighest,
        xp: remainingXp,
        level: newLevel,
        stamina: newStamina,
        lastStaminaReset: new Date().toISOString().split('T')[0],
      });
    }
  };

  // Developer & Player Stamina Controls (Interactive Testing)
  const setStaminaMock = async (targetStamina: number) => {
    if (!profile) return;
    const clamped = Math.max(0, Math.min(100, targetStamina));
    await updateProfileMock({
      stamina: clamped,
      lastStaminaReset: new Date().toISOString().split('T')[0],
    });
  };

  // Developer Test helper: Toggle between Rookie Sandbox and Challenger Ranked
  const toggleRankTierMock = async () => {
    if (!profile) return;
    const isCurrentlyRookie = (profile.rating || 0) < 800;
    const targetRating = isCurrentlyRookie ? 1200 : 450;
    const targetRank = getRankFromRating(targetRating);
    await updateProfileMock({
      rating: targetRating,
      rank: targetRank,
      stamina: isCurrentlyRookie ? 80 : 100,
    });
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        profile, 
        loading, 
        signIn,
        signUp,
        signOut,
        resetPassword,
        loginMock: signIn, 
        signupMock: (name, email, pwd) => signUp(name, email || '', pwd), 
        logoutMock: signOut, 
        updateProfileMock, 
        recordMatchResult,
        setStaminaMock,
        toggleRankTierMock,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
