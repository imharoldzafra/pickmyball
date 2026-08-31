import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Users, 
  MapPin, 
  Flame, 
  ArrowLeft, 
  Sparkles, 
  Crown, 
  Medal, 
  ShieldCheck, 
  UserPlus, 
  Swords,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import TierEmblem from '../components/TierEmblem';

interface LeaderboardUser {
  id: string;
  display_name: string;
  avatar_url?: string;
  rating: number;
  rank: string;
  wins: number;
  losses: number;
  battles: number;
  current_streak?: number;
  isCurrentUser?: boolean;
}

export default function Leaderboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'global' | 'friends'>('global');
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

  // Fetch real community players who have played at least 1 match (Active Players Only)
  const fetchRankings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, rating, rank, wins, losses, battles, current_streak')
        .gt('battles', 0)
        .order('rating', { ascending: false })
        .limit(50);

      let realList: LeaderboardUser[] = [];

      if (!error && data && data.length > 0) {
        realList = data.map((p) => ({
          id: p.id,
          display_name: p.display_name || 'Player',
          avatar_url: p.avatar_url,
          rating: p.rating || 0,
          rank: p.rank || 'Rookie',
          wins: p.wins || 0,
          losses: p.losses || 0,
          battles: p.battles || 0,
          current_streak: p.current_streak || 0,
          isCurrentUser: p.id === profile?.uid,
        }));
      }

      // Ensure current user is present if they have played at least 1 match
      if (profile && (profile.battles || 0) > 0) {
        const userIndex = realList.findIndex((u) => u.id === profile.uid || u.isCurrentUser);
        const currentUserData: LeaderboardUser = {
          id: profile.uid,
          display_name: profile.displayName || 'You',
          avatar_url: profile.photoURL || undefined,
          rating: profile.rating || 0,
          rank: profile.rank || 'Rookie',
          wins: profile.wins || 0,
          losses: profile.losses || 0,
          battles: profile.battles || 0,
          current_streak: profile.currentStreak || 0,
          isCurrentUser: true,
        };

        if (userIndex !== -1) {
          realList[userIndex] = currentUserData;
        } else {
          realList.push(currentUserData);
        }
      }

      // Sort descending by CR
      realList.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      setLeaderboard(realList);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();

    // ⚡ Supabase Realtime Subscription: Update immediately when any match finishes
    const channel = supabase
      .channel('public:profiles:leaderboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchRankings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.rating, profile?.rank, profile?.battles]);

  // Determine current user rank index
  const currentUserIndex = leaderboard.findIndex((u) => u.isCurrentUser || u.id === profile?.uid);
  const myRank = currentUserIndex !== -1 ? currentUserIndex + 1 : '-';

  // Filtered leaderboard (Strictly Top 50 Players)
  const fullList = activeTab === 'global' 
    ? leaderboard 
    : leaderboard.filter((u, idx) => u.isCurrentUser || idx === 1 || idx === 3); // Sample friends filter

  const displayedList = fullList.slice(0, 50);

  const topThree = displayedList.slice(0, 3);
  const restOfLadder = displayedList.slice(3);

  return (
    <div className="flex flex-col h-full flex-1 p-4 sm:p-5 pb-2 overflow-hidden select-none">
      {/* 📌 Pinned Top Area: Header & 3D Podium */}
      <div className="flex-shrink-0 space-y-4">
        {/* Top Header Bar with Back Button & Dual Tabs */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-2"
        >
          <button
            onClick={() => navigate('/play')}
            className="flex items-center gap-1.5 text-xs font-bold text-text-light/70 hover:text-white bg-white/[0.04] border border-white/10 px-3 py-1.5 rounded-full transition-all active:scale-95 shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Play Arena</span>
          </button>

          {/* Glass Dual Tab Selector (Local vs Friends) with Sliding Spring Pill */}
          <div className="flex items-center bg-white/[0.04] backdrop-blur-2xl p-0.5 rounded-full border border-white/10 shadow-sm shrink-0 relative">
            <button
              type="button"
              onClick={() => setActiveTab('global')}
              className={`relative px-3.5 py-1 text-xs font-bold rounded-full transition-colors duration-200 flex items-center justify-center gap-1.5 active:scale-95 z-10 select-none ${
                activeTab === 'global'
                  ? 'text-slate-950 font-black'
                  : 'text-text-light/70 hover:text-white'
              }`}
            >
              {activeTab === 'global' && (
                <motion.div
                  layoutId="activeLeaderboardTab"
                  className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-[0_0_14px_rgba(16,185,129,0.35)] -z-10"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <MapPin className="w-3 h-3" />
              <span>Local</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('friends')}
              className={`relative px-3.5 py-1 text-xs font-bold rounded-full transition-colors duration-200 flex items-center justify-center gap-1.5 active:scale-95 z-10 select-none ${
                activeTab === 'friends'
                  ? 'text-slate-950 font-black'
                  : 'text-text-light/70 hover:text-white'
              }`}
            >
              {activeTab === 'friends' && (
                <motion.div
                  layoutId="activeLeaderboardTab"
                  className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-[0_0_14px_rgba(16,185,129,0.35)] -z-10"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <Users className="w-3 h-3" />
              <span>Friends</span>
            </button>
          </div>
        </motion.div>

        {/* 🏆 3D TOP 3 PODIUM */}
        {topThree.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="relative pt-1 pb-1"
          >
            <div className="grid grid-cols-3 gap-2 items-end max-w-sm mx-auto">
              {/* 🥈 #2 Silver Stand (Left) */}
              {topThree[1] ? (
                <PodiumStand
                  user={topThree[1]}
                  rankNum={2}
                  height="h-26 sm:h-28"
                  crownColor="text-slate-300"
                  pedestalBg="bg-gradient-to-b from-slate-300/20 to-slate-500/5 border-slate-300/30"
                  medalBadge="🥈"
                />
              ) : (
                <div className="h-24 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center opacity-40">
                  <span className="text-lg">🥈</span>
                  <span className="text-[9px] font-bold text-text-light mt-1">#2 Open</span>
                </div>
              )}

              {/* 🥇 #1 Gold Stand (Center - Highest) */}
              {topThree[0] ? (
                <PodiumStand
                  user={topThree[0]}
                  rankNum={1}
                  height="h-34 sm:h-36"
                  crownColor="text-amber-400"
                  pedestalBg="bg-gradient-to-b from-amber-400/25 to-yellow-500/5 border-amber-400/40 shadow-[0_0_30px_rgba(251,191,36,0.2)]"
                  medalBadge="🥇"
                  isFirstPlace
                />
              ) : (
                <div className="h-32 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center opacity-40">
                  <span className="text-xl">🥇</span>
                  <span className="text-[10px] font-bold text-amber-400 mt-1">#1 Open</span>
                </div>
              )}

              {/* 🥉 #3 Bronze Stand (Right) */}
              {topThree[2] ? (
                <PodiumStand
                  user={topThree[2]}
                  rankNum={3}
                  height="h-22 sm:h-24"
                  crownColor="text-orange-400"
                  pedestalBg="bg-gradient-to-b from-amber-700/20 to-orange-900/5 border-amber-600/30"
                  medalBadge="🥉"
                />
              ) : (
                <div className="h-20 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center opacity-40">
                  <span className="text-base">🥉</span>
                  <span className="text-[9px] font-bold text-text-light mt-1">#3 Open</span>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-6 px-4 rounded-3xl bg-white/[0.02] border border-white/5 space-y-1 max-w-sm mx-auto">
            <p className="text-xs font-black text-white">No active rankings yet</p>
            <p className="text-[10px] text-text-light/60">Play your first match on court to claim the #1 championship stand!</p>
          </div>
        )}
      </div>

      {/* 📜 DEDICATED SCROLLABLE LADDER LIST (#4 to #50+) */}
      <div className="flex-1 min-h-0 flex flex-col space-y-2 pt-2">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-text-light/50 px-3 flex-shrink-0">
          <span>Rank & Player</span>
          <span>Competitive Rating</span>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1 pb-20 no-scrollbar overscroll-contain">
          {restOfLadder.length > 0 ? (
            restOfLadder.map((player, idx) => {
              const rankPosition = idx + 4;
              const isMe = player.isCurrentUser || player.id === profile?.uid;

              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                  className={`flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border transition-all ${
                    isMe
                      ? 'bg-emerald-500/15 border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                      : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Left: Rank #, Avatar, Name & Emblem */}
                  <div className="flex items-center gap-2.5">
                    <span className={`w-6 text-center font-mono font-black text-xs ${isMe ? 'text-emerald-400' : 'text-text-light/50'}`}>
                      #{rankPosition}
                    </span>

                    <div className="relative shrink-0">
                      <img
                        src={player.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                        alt={player.display_name}
                        className="w-9 h-9 rounded-full object-cover border border-white/10"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-black tracking-tight ${isMe ? 'text-emerald-300' : 'text-white'}`}>
                          {player.display_name}
                        </span>
                        {isMe && (
                          <span className="text-[8px] font-black uppercase bg-emerald-400 text-slate-950 px-1.5 py-0.2 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-text-light/60">
                        <span>{player.rank}</span>
                        {player.current_streak && player.current_streak > 1 && (
                          <span className="text-amber-400 font-bold flex items-center gap-0.5">
                            <Flame className="w-2.5 h-2.5" />
                            {player.current_streak}W
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Tier Emblem & CR */}
                  <div className="flex items-center gap-2">
                    <TierEmblem rank={player.rank} size="sm" animated={false} />
                    <div className="text-right">
                      <span className="text-sm font-mono font-black text-white block">
                        {player.rating}
                      </span>
                      <span className="text-[9px] font-bold text-text-light/50 uppercase">
                        CR
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-6 px-4 rounded-2xl bg-white/[0.015] border border-white/5 text-text-light/50 text-[11px] font-medium">
              {topThree.length > 0
                ? 'Ranks #4 to #50 will open as more players complete matches.'
                : 'No players in the ladder yet.'}
            </div>
          )}
        </div>
      </div>

      {/* 📌 STICKY "YOUR STANDING" FOOTER (Only displayed if player is ranked #9 or lower, or unranked) */}
      {profile && (myRank === '-' || (typeof myRank === 'number' && myRank > 8)) && (
        <div className="fixed bottom-3.5 inset-x-4 max-w-md mx-auto z-40">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-between p-3 rounded-2xl bg-[#09151c]/95 backdrop-blur-2xl border border-emerald-400/40 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(16,185,129,0.25)]"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-6 text-center font-mono font-black text-xs text-emerald-400">
                {myRank === '-' ? '—' : `#${myRank}`}
              </span>
              <img
                src={profile.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt="You"
                className="w-8 h-8 rounded-full object-cover border border-emerald-400/40"
              />
              <div>
                <span className="text-xs font-black text-white block">
                  {myRank === '-' ? 'Unranked Player' : 'Your Local Standing'}
                </span>
                <span className="text-[10px] text-emerald-300 font-bold">
                  {myRank === '-' ? 'Play 1 match to enter ladder' : `${profile.rank || 'Rookie'} Division`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <TierEmblem rank={profile.rank || 'Rookie'} size="sm" animated={true} />
              <div className="text-right">
                <span className="text-sm font-mono font-black text-white block">
                  {profile.rating || 0}
                </span>
                <span className="text-[9px] font-bold text-emerald-400 uppercase">
                  CR
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// 🥇 3D Podium Stand Sub-Component
// -----------------------------------------------------------------------------
function PodiumStand({
  user,
  rankNum,
  height,
  crownColor,
  pedestalBg,
  medalBadge,
  isFirstPlace = false,
}: {
  user: LeaderboardUser;
  rankNum: number;
  height: string;
  crownColor: string;
  pedestalBg: string;
  medalBadge: string;
  isFirstPlace?: boolean;
}) {
  return (
    <div className="flex flex-col items-center">
      {/* Player Avatar with Crown & Medal */}
      <div className="relative mb-2">
        {isFirstPlace && (
          <Crown className={`w-5 h-5 absolute -top-4 left-1/2 -translate-x-1/2 ${crownColor} animate-bounce`} />
        )}
        <div className={`relative p-0.5 rounded-full border-2 ${isFirstPlace ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'border-white/20'}`}>
          <img
            src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
            alt={user.display_name}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover"
          />
        </div>
        <span className="absolute -bottom-1 -right-1 text-xs">{medalBadge}</span>
      </div>

      {/* Name and CR */}
      <div className="text-center mb-1.5 w-full px-1">
        <span className="text-[11px] font-black text-white truncate block max-w-[90px] mx-auto">
          {user.display_name}
        </span>
        <span className="text-[10px] font-mono font-black text-emerald-400 block">
          {user.rating} CR
        </span>
      </div>

      {/* The Stand Box */}
      <div className={`w-full ${height} rounded-2xl border ${pedestalBg} flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-md`}>
        <span className="text-2xl font-black font-mono text-white/40">
          {rankNum}
        </span>
        <div className="mt-1">
          <TierEmblem rank={user.rank} size="sm" animated={isFirstPlace} />
        </div>
      </div>
    </div>
  );
}
