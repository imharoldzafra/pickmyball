import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Match } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Trophy, Sparkles, Swords, RotateCcw, ArrowRight, ShieldCheck, Flame, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Victory() {
  const { matchId } = useParams<{ matchId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [animatedCr, setAnimatedCr] = useState(0);

  useEffect(() => {
    async function loadMatch() {
      if (!matchId) return;
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .single();

      if (data) {
        const mappedMatch: Match = {
          id: data.id,
          hostId: data.host_id,
          hostName: data.host_name,
          matchType: data.match_type,
          gameFormat: data.game_format,
          targetPoints: data.target_points,
          teamA: data.team_a || [],
          teamB: data.team_b || [],
          teamAScore: data.team_a_score,
          teamBScore: data.team_b_score,
          teamAGamesWon: data.team_a_games_won,
          teamBGamesWon: data.team_b_games_won,
          servingTeam: data.serving_team,
          serverNumber: data.server_number,
          currentGame: data.current_game,
          gameResults: data.game_results || [],
          status: data.status,
          matchWinner: data.match_winner || 'NONE',
          createdAt: new Date(data.created_at).getTime(),
          updatedAt: new Date(data.updated_at).getTime(),
        };
        setMatch(mappedMatch);
      }
      setLoading(false);
    }
    loadMatch();
  }, [matchId]);

  // Smooth counter animation for rating increase
  useEffect(() => {
    let start = 0;
    const end = 25;
    const duration = 1200;
    const stepTime = 40;
    const totalSteps = duration / stepTime;
    const increment = end / totalSteps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setAnimatedCr(end);
        clearInterval(timer);
      } else {
        setAnimatedCr(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-text-light/50">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
        <p className="text-sm text-text-light/70">Match record not found.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-white/10 hover:bg-white/15 rounded-xl text-xs font-bold uppercase tracking-wider text-white"
        >
          Return Home
        </button>
      </div>
    );
  }

  const isWinnerAlpha = match.matchWinner === 'A';
  const winningTeam = isWinnerAlpha ? match.teamA : match.teamB;
  const winningScore = isWinnerAlpha ? match.teamAScore : match.teamBScore;
  const losingScore = isWinnerAlpha ? match.teamBScore : match.teamAScore;
  const isReferee = user?.id === match.hostId;

  // Rematch handler
  const handleRematch = async () => {
    if (!isReferee) return;
    await supabase.from('matches').update({
      team_a_score: 0,
      team_b_score: 0,
      team_a_games_won: 0,
      team_b_games_won: 0,
      serving_team: 'A',
      server_number: 2,
      current_game: 1,
      game_results: [],
      status: 'IN_PROGRESS',
      match_winner: 'NONE',
      updated_at: new Date().toISOString(),
    }).eq('id', match.id);

    navigate(`/match/${match.id}/live`);
  };

  return (
    <div className="h-[calc(100dvh-5.5rem)] max-h-[calc(100dvh-5.5rem)] flex flex-col justify-between overflow-hidden select-none touch-manipulation px-3.5 py-2 max-w-md mx-auto relative">
      
      {/* 🌟 Radiant Champion Background Flare */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-[100px] opacity-35 pointer-events-none ${
        isWinnerAlpha ? 'bg-cyan-500' : 'bg-emerald-500'
      }`} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-amber-400/15 blur-[80px] pointer-events-none" />

      {/* 👑 Top Section: Victory Title & Crown Ribbon */}
      <motion.div 
        initial={{ y: -20, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center relative z-10 space-y-1 shrink-0 pt-1"
      >
        <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400/20 via-yellow-400/30 to-amber-400/20 border border-amber-400/40 px-3.5 py-1 rounded-full text-amber-300 text-[11px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(251,191,36,0.3)]">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Match Champions</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white uppercase drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
          VICTORY
        </h1>
        <p className={`text-xs font-mono font-black uppercase tracking-widest ${
          isWinnerAlpha 
            ? 'text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.7)]' 
            : 'text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.7)]'
        }`}>
          Team {isWinnerAlpha ? 'Alpha' : 'Beta'} Dominates
        </p>
      </motion.div>

      {/* 🌟 Center Section: Winners Podium & Avatar Showcase */}
      <motion.div 
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="my-auto py-2 relative z-10 flex flex-col items-center space-y-3 shrink-0"
      >
        {/* Winning Player Avatars */}
        <div className="flex items-center justify-center gap-4">
          {winningTeam.length > 0 ? (
            winningTeam.map((p, idx) => (
              <div key={p.id || idx} className="flex flex-col items-center space-y-1 relative">
                {/* Floating Crown Badge */}
                <div className="absolute -top-3.5 z-20 text-lg drop-shadow-[0_0_12px_rgba(251,191,36,0.9)] animate-bounce">
                  👑
                </div>

                {/* Avatar with Radiant Glow Ring */}
                <div className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full p-1 border-2 relative shadow-2xl ${
                  isWinnerAlpha 
                    ? 'border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.6)] bg-cyan-950/40' 
                    : 'border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.6)] bg-emerald-950/40'
                }`}>
                  {p.photoURL ? (
                    <img src={p.photoURL} alt={p.displayName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-white font-black text-xl">
                      {p.displayName?.charAt(0).toUpperCase() || 'P'}
                    </div>
                  )}
                </div>

                <span className="text-xs font-black text-white truncate max-w-[110px]">
                  {p.displayName}
                </span>

                <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Winner
                </span>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center space-y-1">
              <div className="text-5xl drop-shadow-[0_0_25px_rgba(251,191,36,0.8)]">🏆</div>
              <span className="text-xs font-black text-white">Team {isWinnerAlpha ? 'Alpha' : 'Beta'}</span>
            </div>
          )}
        </div>

        {/* ⚡ XP & CR Rewards Progression Card */}
        <div className="w-full bg-white/[0.04] backdrop-blur-2xl p-4 rounded-3xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)] space-y-3 text-left">
          
          {/* Final Score Pill */}
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-light/70">
              Final Match Score
            </span>
            <div className="flex items-center gap-2 font-mono">
              <span className={`text-sm font-black ${isWinnerAlpha ? 'text-cyan-400' : 'text-emerald-400'}`}>
                {winningScore}
              </span>
              <span className="text-white/30">-</span>
              <span className="text-sm font-bold text-white/50">
                {losingScore}
              </span>
            </div>
          </div>

          {/* CR Rating Gained with Live Counter */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Competitive Rating</span>
            </div>
            <motion.span 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="font-mono font-black text-emerald-300 bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 rounded-full text-xs shadow-[0_0_10px_rgba(16,185,129,0.3)]"
            >
              +{animatedCr} CR ▲
            </motion.span>
          </div>

          {/* XP Gained with Charging Energy Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <Trophy className="w-3.5 h-3.5 text-cyan-400" />
                <span>Player XP Gained</span>
              </div>
              <span className="font-mono font-black text-cyan-300 bg-cyan-500/20 border border-cyan-400/40 px-2.5 py-0.5 rounded-full text-xs shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                +150 XP
              </span>
            </div>

            {/* Glowing Surge Progress Bar */}
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden relative">
              <motion.div 
                initial={{ width: "25%" }}
                animate={{ width: "85%" }}
                transition={{ delay: 0.35, duration: 0.9, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.9)]"
              />
            </div>
          </div>

        </div>
      </motion.div>

      {/* 🎯 Bottom Action: Arena Home */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="w-full relative z-10 shrink-0 pb-1"
      >
        <button 
          onClick={() => navigate('/')} 
          className="w-full bg-gradient-to-r from-primary via-emerald-400 to-secondary text-[#050a0a] py-3.5 rounded-2xl font-black uppercase tracking-wider text-xs shadow-[0_0_25px_rgba(16,185,129,0.5)] active:scale-96 transition-all flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4 text-[#050a0a]" />
          <span>Return to Arena Home</span>
        </button>
      </motion.div>

    </div>
  );
}
