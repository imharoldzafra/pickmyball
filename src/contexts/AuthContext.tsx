import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: any;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (identifier: string, password?: string) => Promise<{ error?: string; errorField?: 'identifier' | 'password' }>;
  signUp: (displayName: string, email: string, password?: string) => Promise<{ error?: string; errorField?: 'username' | 'email' | 'password' | 'confirmPassword'; success?: boolean; needsVerification?: boolean; message?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string; success?: boolean }>;
  updateUserPassword: (password: string) => Promise<{ error?: string; success?: boolean }>;
  isPasswordRecovery: boolean;
  setIsPasswordRecovery: (val: boolean) => void;
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
  updateUserPassword: async () => ({}),
  isPasswordRecovery: false,
  setIsPasswordRecovery: () => {},
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
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(() => {
    return window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery');
  });
  const [loading, setLoading] = useState(true);

  // 🧹 One-time wipe of testing match history and reset testing XP / CR
  useEffect(() => {
    const hasCleanedTestData = localStorage.getItem('pkb_test_cleanup_v4');
    if (!hasCleanedTestData) {
      localStorage.setItem('pkb_test_cleanup_v4', 'true');
      localStorage.removeItem('matchHistory');

      const targetId = user?.id || profile?.uid;
      if (targetId) {
        supabase.from('profiles').update({
          xp: 0,
          rating: 0,
          rank: 'Rookie',
          wins: 0,
          losses: 0,
          battles: 0,
          current_streak: 0,
          longest_streak: 0,
          highest_rating: 0,
          level: 1,
        }).eq('id', targetId).then();
      }

      setProfile((prev) => prev ? {
        ...prev,
        xp: 0,
        rating: 0,
        rank: 'Rookie',
        wins: 0,
        losses: 0,
        battles: 0,
        currentStreak: 0,
        longestStreak: 0,
        highestRating: 0,
        level: 1,
      } : null);

      const cachedMock = localStorage.getItem('mockProfile');
      if (cachedMock) {
        try {
          const parsed = JSON.parse(cachedMock);
          parsed.xp = 0;
          parsed.rating = 0;
          parsed.rank = 'Rookie';
          parsed.wins = 0;
          parsed.losses = 0;
          parsed.battles = 0;
          parsed.currentStreak = 0;
          parsed.longestStreak = 0;
          parsed.highestRating = 0;
          parsed.level = 1;
          localStorage.setItem('mockProfile', JSON.stringify(parsed));
        } catch (e) {}
      }
    }
  }, [user?.id, profile?.uid]);

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
        // Ensure email is synced in profiles table if missing
        if (!data.email && (userMeta?.email || user?.email)) {
          const emailToSet = userMeta?.email || user?.email;
          supabase.from('profiles').update({ email: emailToSet }).eq('id', userId).then();
        }

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
        const fallbackEmail = userMeta?.email || user?.email || '';
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

        // Also upsert to profiles table in Supabase
        supabase.from('profiles').upsert({
          id: userId,
          display_name: fallbackName,
          email: fallbackEmail,
          level: 1,
          xp: 0,
          rating: 0,
          rank: 'Rookie',
          stamina: 100,
          last_stamina_reset: todayStr,
        }, { onConflict: 'id' }).then();
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }
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
      return { error: 'Please choose a username', errorField: 'username' as const };
    }

    // Check if username already exists in Supabase (case-insensitive)
    try {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id, display_name')
        .ilike('display_name', trimmedName)
        .maybeSingle();

      if (existingUser) {
        return { error: 'Username already exists. Please choose a different username', errorField: 'username' as const };
      }
    } catch (err) {
      console.warn('Username check warning:', err);
    }

    const finalEmail = email.trim();
    if (!finalEmail) {
      return { error: 'Please enter a valid email address', errorField: 'email' as const };
    }

    // Check if email already exists in Supabase profiles (case-insensitive)
    try {
      const { data: existingEmail } = await supabase
        .from('profiles')
        .select('id, email')
        .ilike('email', finalEmail)
        .maybeSingle();

      if (existingEmail) {
        return { error: 'An account with this email already exists', errorField: 'email' as const };
      }
    } catch (err) {
      console.warn('Email check warning:', err);
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
      const errLower = error.message.toLowerCase();
      if (errLower.includes('already registered') || errLower.includes('already exists') || errLower.includes('email address')) {
        return { error: 'An account with this email already exists', errorField: 'email' as const };
      }
      if (errLower.includes('password')) {
        return { error: error.message, errorField: 'password' as const };
      }
      return { error: error.message };
    }

    // When email verification is enabled in Supabase, data.session is null until verified
    if (data.user && !data.session) {
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          display_name: trimmedName,
          email: finalEmail,
          level: 1,
          xp: 0,
          rating: 0,
          rank: 'Rookie',
          stamina: 100,
        }, { onConflict: 'id' });
      } catch (err) {
        console.warn('Pre-insert profile warning:', err);
      }

      return {
        success: true,
        needsVerification: true,
        message: `Verification email sent to ${finalEmail}! Please check your inbox (and spam folder) to verify your account before signing in.`
      };
    }

    if (data.user && data.session) {
      setUser(data.user);
      localStorage.setItem('mockUser', JSON.stringify({ uid: data.user.id, displayName: trimmedName, email: finalEmail }));
      await fetchProfile(data.user.id, { display_name: trimmedName, email: finalEmail });
    }

    return { success: true };
  };

  const signIn = async (identifier: string, password = 'password123'): Promise<{ error?: string; errorField?: 'identifier' | 'password' }> => {
    const trimmed = identifier.trim();
    if (!trimmed) {
      return { error: 'Please enter your username', errorField: 'identifier' };
    }
    if (!password) {
      return { error: 'Please enter your password', errorField: 'password' };
    }

    // Disallow email input directly on login
    if (trimmed.includes('@')) {
      return {
        error: 'Please enter your username, not your email',
        errorField: 'identifier',
      };
    }

    // Look up user account in profiles by username (display_name)
    let userProfile: { id: string; email?: string; display_name?: string } | null = null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, display_name')
        .ilike('display_name', trimmed)
        .maybeSingle();

      if (!error && data) {
        userProfile = data;
      }
    } catch (err) {
      console.warn('Profile lookup error:', err);
    }

    if (!userProfile) {
      return {
        error: `Username "${trimmed}" not found`,
        errorField: 'identifier',
      };
    }

    if (!userProfile.email) {
      return {
        error: 'Account missing registered email',
        errorField: 'identifier',
      };
    }

    // Attempt authentication with Supabase Auth using the user profile's email
    const { data, error } = await supabase.auth.signInWithPassword({
      email: userProfile.email,
      password: password,
    });

    if (error) {
      const errLower = error.message.toLowerCase();

      if (errLower.includes('invalid login credentials')) {
        return {
          error: 'Incorrect password',
          errorField: 'password',
        };
      }

      if (errLower.includes('email not confirmed')) {
        return {
          error: 'Email not verified yet',
          errorField: 'identifier',
        };
      }

      return { error: error.message };
    }

    if (data.user) {
      setUser(data.user);
      await fetchProfile(data.user.id, {
        display_name: userProfile.display_name,
        email: userProfile.email,
        ...data.user.user_metadata,
      });
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

  const updateUserPassword = async (newPassword: string): Promise<{ error?: string; success?: boolean }> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { error: error.message };
      }

      // Clean recovery URL fragment/hash from browser address bar
      if (window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
      setIsPasswordRecovery(false);
      return { success: true };
    } catch (err: any) {
      return { error: err.message || 'Failed to update password' };
    }
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
    // 🛡️ Security Guard: Never record friendly, offline, or practice matches in history or career stats
    if (
      matchDetails?.isFriendly || 
      matchDetails?.id?.includes('FR') || 
      matchDetails?.type?.toLowerCase().includes('friendly') || 
      matchDetails?.type?.toLowerCase().includes('practice') || 
      matchDetails?.opponent?.includes('Alpha') ||
      matchDetails?.opponent?.includes('Beta')
    ) {
      return;
    }

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
        updateUserPassword,
        isPasswordRecovery,
        setIsPasswordRecovery,
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
