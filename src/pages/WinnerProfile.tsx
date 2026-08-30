import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Match, UserProfile } from '../types';
import { useAuth, calculateTierCR } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Trophy, Sparkles, Flame, CheckCircle2, ChevronRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WinnerProfile() {
  const { matchId } = useParams<{ matchId: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  const streakCount = Math.max(1, profile?.currentStreak || 1);
  const earnedCR = calculateTierCR(profile?.rating || 850, true, streakCount);
  const finalRating = profile?.rating || 850;
  const initialRating = Math.max(0, finalRating - earnedCR);

  // 🔢 Real-time Rolling Number Animation for CR (Top level hook)
  const [displayCR, setDisplayCR] = useState(initialRating);
  const [counterFinished, setCounterFinished] = useState(false);

  // Fetch match details (sessionStorage first -> Supabase -> Local Fallback)
  useEffect(() => {
    if (!matchId) return;

    // 1. Try local sessionStorage first (Instant 0ms)
    try {
      const cached = sessionStorage.getItem(`pkb_match_${matchId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        setMatch(parsed);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn('Cache read error:', e);
    }

    const fetchMatch = async () => {
      try {
        const { data, error } = await supabase
          .from('matches')
          .select('*')
          .eq('id', matchId)
          .maybeSingle();

        if (data) {
          setMatch({
            id: data.id,
            hostId: data.host_id,
            hostName: data.host_name,
            matchType: data.match_type,
            gameFormat: data.game_format,
            targetPoints: data.target_points,
            winByTwo: data.win_by_two,
            status: data.status,
            teamA: data.team_a || [],
            teamB: data.team_b || [],
            teamAScore: data.team_a_score || 0,
            teamBScore: data.team_b_score || 0,
            teamAGamesWon: data.team_a_games_won || 0,
            teamBGamesWon: data.team_b_games_won || 0,
            servingTeam: data.serving_team || 'A',
            serverNumber: data.server_number || 2,
            currentGame: data.current_game || 1,
            gameResults: data.game_results || [],
            matchWinner: data.match_winner || 'NONE',
            createdAt: new Date(data.created_at).getTime(),
            updatedAt: new Date(data.updated_at).getTime(),
          });
        } else {
          // Fallback for Solo Simulator Practice or Local Unsaved Matches
          setMatch({
            id: matchId,
            hostId: user?.id || 'host',
            hostName: user?.displayName || 'Host',
            matchType: '1v1',
            gameFormat: 'single_11',
            targetPoints: 11,
            winByTwo: true,
            status: 'FINISHED',
            teamA: [{
              id: user?.id || '1',
              displayName: profile?.displayName || user?.displayName || 'Player',
              photoURL: profile?.photoURL || user?.photoURL || null,
              rating: profile?.rating || 1668,
            }],
            teamB: [{
              id: 'bot_alex',
              displayName: 'Practice Rival (Alex)',
              photoURL: null,
              rating: 1520,
            }],
            teamAScore: 11,
            teamBScore: 0,
            teamAGamesWon: 1,
            teamBGamesWon: 0,
            servingTeam: 'A',
            serverNumber: 2,
            currentGame: 1,
            gameResults: [],
            matchWinner: 'A',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          });
        }
      } catch (err) {
        console.error('Error fetching winner match:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId, user, profile]);

  // Rolling counter animation
  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1100;
    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(initialRating + (finalRating - initialRating) * easeOut);
      setDisplayCR(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setCounterFinished(true);
      }
    };

    const timer = setTimeout(() => {
      frameId = requestAnimationFrame(step);
    }, 280);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frameId);
    };
  }, [initialRating, finalRating]);

  if (loading || !match) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-text-light/60">Loading Winner Profile...</p>
      </div>
    );
  }

  const isWinnerAlpha = match.matchWinner === 'A';
  const winners = isWinnerAlpha ? match.teamA : match.teamB;
  const losers = isWinnerAlpha ? match.teamB : match.teamA;
  const winningScore = isWinnerAlpha ? match.teamAScore : match.teamBScore;
  const losingScore = isWinnerAlpha ? match.teamBScore : match.teamAScore;

  // Primary Winner (if user is in winning team or fallback to 1st player)
  const primaryWinner = winners.find(p => p.id === user?.id) || winners[0] || {
    id: 'unknown',
    displayName: isWinnerAlpha ? 'Team Alpha' : 'Team Beta',
    photoURL: null,
    rating: profile?.rating || 850,
  };

  return (
    <div className="min-h-full flex flex-col justify-between p-4 sm:p-5 max-w-md mx-auto space-y-4 select-none">
      
      {/* 👑 Top Winner Hero Spotlight */}
      <motion.div 
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center relative pt-1 space-y-3"
      >
        {/* Glow Halo */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[85px] opacity-35 pointer-events-none ${
          isWinnerAlpha ? 'bg-cyan-500' : 'bg-emerald-500'
        }`} />

        {/* Top Winner Ribbon */}
        <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400/20 via-yellow-400/30 to-amber-400/20 border border-amber-400/40 px-4 py-1.5 rounded-full text-amber-300 text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(251,191,36,0.35)]">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Match Winner</span>
        </div>

        {/* Winner Avatar with Crown */}
        <div className="relative inline-block my-2">
          {/* Crown */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl drop-shadow-[0_0_12px_rgba(251,191,36,0.9)] z-20 animate-bounce">
            👑
          </div>

          <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1.5 border-2 shadow-2xl relative z-10 ${
            isWinnerAlpha 
              ? 'border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.6)] bg-cyan-950/40' 
              : 'border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.6)] bg-emerald-950/40'
          }`}>
            {primaryWinner.photoURL ? (
              <img 
                src={primaryWinner.photoURL} 
                alt={primaryWinner.displayName} 
                className="w-full h-full rounded-full object-cover shadow-inner" 
              />
            ) : (
              <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-white font-black text-2xl">
                {primaryWinner.displayName?.charAt(0).toUpperCase() || 'P'}
              </div>
            )}
          </div>

          {/* Victory Badge */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-lg z-20 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Winner</span>
          </div>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {primaryWinner.displayName}
          </h1>
          <p className={`text-xs font-mono font-black uppercase tracking-widest ${
            isWinnerAlpha ? 'text-cyan-400' : 'text-emerald-400'
          }`}>
            Team {isWinnerAlpha ? 'Alpha' : 'Beta'} Champions
          </p>
        </div>
      </motion.div>

      {/* 📊 Match Result & Head-to-Head Recap */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="space-y-3"
      >
        {/* Scorecard Pill */}
        <div className="bg-white/[0.04] backdrop-blur-2xl p-3.5 rounded-3xl border border-white/10 shadow-lg flex items-center justify-between">
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-light/60">
              Match Score
            </p>
            <p className="text-xs font-bold text-white">
              {match.matchType === '2v2' ? 'Doubles' : 'Singles'} • First to {match.targetPoints}
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono bg-black/40 border border-white/10 px-3.5 py-1.5 rounded-2xl">
            <span className={`text-lg font-black ${isWinnerAlpha ? 'text-cyan-400' : 'text-emerald-400'}`}>
              {winningScore}
            </span>
            <span className="text-white/30 font-light">-</span>
            <span className="text-lg font-bold text-white/50">
              {losingScore}
            </span>
          </div>
        </div>

        {/* ⚡ Rating, XP & Streak Progression Card */}
        <div className="bg-white/[0.04] backdrop-blur-2xl p-4 rounded-3xl border border-white/10 shadow-lg space-y-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-text-light/60">
            Career Progression
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Rating Gain Card with Glow Shimmer */}
            <div className={`p-2.5 rounded-2xl flex flex-col justify-between transition-all duration-500 border ${
              counterFinished 
                ? 'bg-emerald-500/15 border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                : 'bg-emerald-500/10 border-emerald-400/20'
            }`}>
              <span className="text-[10px] font-bold text-emerald-300">Competitive Rating</span>
              <div className="flex items-center justify-between mt-1">
                {/* 🔢 Live Updating CR Counter */}
                <span className="text-sm font-mono font-black text-white tracking-tight">
                  {displayCR} CR
                </span>

                {/* 🟢 Rising Fade-In +25 Badge (No Triangle) */}
                <motion.span 
                  initial={{ opacity: 0, y: 8, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.35, duration: 0.45, ease: "easeOut" }}
                  className="text-[10px] font-mono font-black text-emerald-300 bg-emerald-500/25 border border-emerald-400/40 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.25)]"
                >
                  +{earnedCR}
                </motion.span>
              </div>
            </div>

            {/* XP Gain Card with Fade-In */}
            <div className="bg-cyan-500/10 border border-cyan-400/25 p-2.5 rounded-2xl flex flex-col justify-between">
              <span className="text-[10px] font-bold text-cyan-300">Player XP</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-mono font-black text-white">
                  +150 XP
                </span>
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                </motion.div>
              </div>
            </div>
          </div>

          {/* Win Streak Pill */}
          <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-red-500/15 border border-amber-400/30 p-2.5 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
              <span className="font-bold text-white">Current Win Streak</span>
            </div>
            <span className="font-mono font-black text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full">
              {streakCount} {streakCount === 1 ? 'Win' : 'Wins'} 🔥
            </span>
          </div>

          {/* Court Stamina Momentum Refund Pill (Challenger+) */}
          {(profile?.rating || 0) >= 800 && (
            <div className="bg-emerald-500/10 border border-emerald-400/30 p-2.5 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="font-bold text-white">Court Stamina</span>
              </div>
              <span className="font-mono font-black text-emerald-300 bg-emerald-400/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                +10% Momentum Refund ⚡
              </span>
            </div>
          )}
        </div>

        {/* Defeated Opponent Handshake Card */}
        {losers.length > 0 && (
          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-white text-[10px] font-bold">
                {losers[0].displayName?.charAt(0).toUpperCase() || 'O'}
              </div>
              <div>
                <p className="text-[11px] font-bold text-white/80">{losers.map(l => l.displayName).join(' & ')}</p>
                <p className="text-[9px] text-text-light/50">Opponent</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-text-light/50 bg-white/[0.05] px-2 py-0.5 rounded-full">
              Match Final
            </span>
          </div>
        )}
      </motion.div>

      {/* 🏠 Single Action CTA: Return to Arena Home */}
      <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="pt-2 pb-1"
      >
        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full bg-gradient-to-r from-primary via-emerald-400 to-secondary text-[#050a0a] py-3.5 rounded-2xl font-black uppercase tracking-wider text-xs shadow-[0_0_25px_rgba(16,185,129,0.45)] active:scale-96 transition-all flex items-center justify-center gap-2"
        >
          <span>Return to Arena Home</span>
          <ChevronRight className="w-4 h-4 text-[#050a0a]" />
        </button>
      </motion.div>

    </div>
  );
}
