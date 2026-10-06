import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Match } from '../types';
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
        const isFriendly = Boolean(
          matchId.includes('FR') ||
          parsed.isFriendly ||
          parsed.matchType === 'friendly' ||
          parsed.creatorId?.startsWith('friendly') ||
          parsed.refereeId?.startsWith('friendly') ||
          parsed.teamA?.some((p: any) => p.id?.startsWith('friendly_')) ||
          parsed.teamB?.some((p: any) => p.id?.startsWith('friendly_')) ||
          sessionStorage.getItem(`pkb_is_friendly_${matchId}`) === 'true' ||
          sessionStorage.getItem('pkb_guest_offline') === 'true'
        );
        if (isFriendly) {
          navigate(`/match/${matchId}/live`, { replace: true });
          return;
        }
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
        <div className="w-10 h-10 border-4 border-[#244434] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-[#6B7E72]">Loading Winner Profile...</p>
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
        {/* Soft Natural Ambient Halo */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[70px] opacity-25 pointer-events-none ${
          isWinnerAlpha ? 'bg-[#2B4C6F]' : 'bg-[#8C3B30]'
        }`} />

        {/* Top Winner Ribbon */}
        <div className="inline-flex items-center gap-1.5 bg-[#FAF4E4] border border-[#E8D6A7] px-4 py-1.5 rounded-full text-[#8C6D23] text-xs font-black uppercase tracking-widest shadow-xs">
          <Trophy className="w-3.5 h-3.5 text-[#B89230]" />
          <span>Match Winner</span>
        </div>

        {/* Winner Avatar with Crown */}
        <div className="relative inline-block my-2">
          {/* Crown */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl z-20 animate-bounce">
            👑
          </div>

          <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1.5 border-2 shadow-md relative z-10 ${
            isWinnerAlpha 
              ? 'border-[#2B4C6F] bg-white' 
              : 'border-[#8C3B30] bg-white'
          }`}>
            {primaryWinner.photoURL ? (
              <img 
                src={primaryWinner.photoURL} 
                alt={primaryWinner.displayName} 
                className="w-full h-full rounded-full object-cover shadow-inner" 
              />
            ) : (
              <div className="w-full h-full rounded-full bg-[#E2DDD4] flex items-center justify-center text-[#18281E] font-black text-2xl">
                {primaryWinner.displayName?.charAt(0).toUpperCase() || 'P'}
              </div>
            )}
          </div>

          {/* Victory Badge */}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-[#244434] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm z-20 flex items-center gap-1 border border-white/20">
            <CheckCircle2 className="w-3 h-3 text-white" />
            <span>Winner</span>
          </div>
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#18281E] tracking-tight">
            {primaryWinner.displayName}
          </h1>
          <p className={`text-xs font-mono font-black uppercase tracking-widest ${
            isWinnerAlpha ? 'text-[#2B4C6F]' : 'text-[#8C3B30]'
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
        <div className="bg-white p-3.5 rounded-2xl border border-[#E2DDD4] shadow-xs flex items-center justify-between">
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7E72]">
              Match Score
            </p>
            <p className="text-xs font-bold text-[#18281E]">
              {match.matchType === '2v2' ? 'Doubles' : 'Singles'} • First to {match.targetPoints}
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono bg-[#F8F7F3] border border-[#E2DDD4] px-3.5 py-1.5 rounded-xl">
            <span className={`text-lg font-black ${isWinnerAlpha ? 'text-[#2B4C6F]' : 'text-[#8C3B30]'}`}>
              {winningScore}
            </span>
            <span className="text-[#9BAAA0] font-light">-</span>
            <span className="text-lg font-bold text-[#6B7E72]">
              {losingScore}
            </span>
          </div>
        </div>

        {/* ⚡ Rating, XP & Streak Progression Card */}
        <div className="bg-white p-4 rounded-2xl border border-[#E2DDD4] shadow-xs space-y-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-[#6B7E72]">
            Career Progression
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Rating Gain Card */}
            <div className={`p-2.5 rounded-xl flex flex-col justify-between transition-all duration-500 border ${
              counterFinished 
                ? 'bg-[#EAF4ED] border-[#C8DFD0] shadow-xs' 
                : 'bg-[#F2F8F4] border-[#DCEBE0]'
            }`}>
              <span className="text-[10px] font-bold text-[#244434]">Competitive Rating</span>
              <div className="flex items-center justify-between mt-1">
                {/* 🔢 Live Updating CR Counter */}
                <span className="text-sm font-mono font-black text-[#18281E] tracking-tight">
                  {displayCR} CR
                </span>

                {/* 🟢 Rising Fade-In +25 Badge */}
                <motion.span 
                  initial={{ opacity: 0, y: 8, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.35, duration: 0.45, ease: "easeOut" }}
                  className="text-[10px] font-mono font-black text-white bg-[#244434] px-2 py-0.5 rounded-full shadow-xs"
                >
                  +{earnedCR}
                </motion.span>
              </div>
            </div>

            {/* XP Gain Card with Fade-In */}
            <div className="bg-[#EDF3F7] border border-[#CFDFEB] p-2.5 rounded-xl flex flex-col justify-between">
              <span className="text-[10px] font-bold text-[#263E50]">Player XP</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-mono font-black text-[#18281E]">
                  +150 XP
                </span>
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#263E50]" />
                </motion.div>
              </div>
            </div>
          </div>

          {/* Win Streak Pill */}
          <div className="bg-[#FDF3F1] border border-[#F2D2CC] p-2.5 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#8C3B30] animate-pulse" />
              <span className="font-bold text-[#18281E]">Current Win Streak</span>
            </div>
            <span className="font-mono font-black text-[#8C3B30] bg-[#EFC5BD]/50 px-2.5 py-0.5 rounded-full">
              {streakCount} {streakCount === 1 ? 'Win' : 'Wins'} 🔥
            </span>
          </div>

          {/* Court Stamina Momentum Refund Pill (Challenger+) */}
          {(profile?.rating || 0) >= 800 && (
            <div className="bg-[#EAF4ED] border border-[#C8DFD0] p-2.5 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#244434] animate-pulse" />
                <span className="font-bold text-[#18281E]">Court Stamina</span>
              </div>
              <span className="font-mono font-black text-white bg-[#244434] px-2 py-0.5 rounded-full flex items-center gap-1">
                +10% Momentum Refund ⚡
              </span>
            </div>
          )}
        </div>

        {/* Defeated Opponent Handshake Card */}
        {losers.length > 0 && (
          <div className="bg-white border border-[#E2DDD4] p-3 rounded-2xl flex items-center justify-between text-xs shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#E2DDD4] flex items-center justify-center text-[#18281E] text-[10px] font-bold">
                {losers[0].displayName?.charAt(0).toUpperCase() || 'O'}
              </div>
              <div>
                <p className="text-[11px] font-bold text-[#18281E]">{losers.map(l => l.displayName).join(' & ')}</p>
                <p className="text-[9px] text-[#6B7E72]">Opponent</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#6B7E72] bg-[#F8F7F3] border border-[#E2DDD4] px-2 py-0.5 rounded-full">
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
          className="w-full bg-[#244434] hover:bg-[#1A3326] text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Return to Arena Home</span>
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </motion.div>

    </div>
  );
}
