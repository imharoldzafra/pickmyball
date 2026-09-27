import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Match, LobbyPlayer } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import QRCode from 'react-qr-code';
import { Users, User, Shield, ArrowRight, ArrowLeft, Copy, Check, LogOut, RefreshCw, Trophy, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MatchLobby() {
  const { matchId } = useParams<{ matchId: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch initial match details
  const fetchMatch = async () => {
    if (!matchId) return;

    // Validate match code format (PKB- followed by 6 alphanumeric chars)
    if (!/^PKB-[A-Z0-9]{6}$/i.test(matchId)) {
      setErrorMsg('Invalid match room format. Match codes must be PKB- followed by 6 characters.');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .maybeSingle();

      if (error) {
        console.warn('Error loading match:', error.message);
      }

      if (data) {
        const loaded: Match = {
          id: data.id,
          creatorId: data.host_id,
          hostName: data.host_name,
          hostAvatar: data.host_avatar,
          matchType: data.match_type || '1v1',
          gameFormat: data.game_format || 'single_11',
          targetPoints: data.target_points || 11,
          status: data.status || 'WAITING',
          teamA: data.team_a || [],
          teamB: data.team_b || [],
          refereeId: data.referee_id || data.host_id,
          referee: data.referee,
          currentGame: data.current_game || 1,
          teamAScore: data.team_a_score || 0,
          teamBScore: data.team_b_score || 0,
          teamAGamesWon: data.team_a_games_won || 0,
          teamBGamesWon: data.team_b_games_won || 0,
          servingTeam: data.serving_team || 'A',
          serverNumber: data.server_number || 2,
          gameResults: data.game_results || [],
          matchWinner: data.match_winner || 'NONE',
          createdAt: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
          updatedAt: data.updated_at ? new Date(data.updated_at).getTime() : Date.now(),
        };
        setMatch(loaded);

        // If match already started, auto-navigate
        if (loaded.status === 'IN_PROGRESS') {
          navigate(`/match/${matchId}/live`);
        }
      } else {
        setErrorMsg('Match room not found.');
      }
    } catch (err) {
      console.error('Match load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatch();
  }, [matchId]);

  // Real-time Supabase Subscription on matches table
  useEffect(() => {
    if (!matchId) return;

    const channel = supabase
      .channel(`match-lobby-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`,
        },
        (payload) => {
          if (payload.new) {
            const data: any = payload.new;
            const updated: Match = {
              id: data.id,
              creatorId: data.host_id,
              hostName: data.host_name,
              hostAvatar: data.host_avatar,
              matchType: data.match_type || '1v1',
              gameFormat: data.game_format || 'single_11',
              targetPoints: data.target_points || 11,
              status: data.status || 'WAITING',
              teamA: data.team_a || [],
              teamB: data.team_b || [],
              refereeId: data.referee_id || data.host_id,
              referee: data.referee,
              currentGame: data.current_game || 1,
              teamAScore: data.team_a_score || 0,
              teamBScore: data.team_b_score || 0,
              teamAGamesWon: data.team_a_games_won || 0,
              teamBGamesWon: data.team_b_games_won || 0,
              servingTeam: data.serving_team || 'A',
              serverNumber: data.server_number || 2,
              gameResults: data.game_results || [],
              matchWinner: data.match_winner || 'NONE',
              createdAt: data.created_at ? new Date(data.created_at).getTime() : Date.now(),
              updatedAt: data.updated_at ? new Date(data.updated_at).getTime() : Date.now(),
            };
            setMatch(updated);

            // Auto navigate when Host starts the match
            if (updated.status === 'IN_PROGRESS') {
              navigate(`/match/${matchId}/live`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [matchId, navigate]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-3 text-center">
        <div className="w-10 h-10 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
        <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Connecting to Match Room...</p>
      </div>
    );
  }

  if (errorMsg || !match) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-4 text-center">
        <p className="text-sm font-bold text-red-400">{errorMsg || 'Match not found'}</p>
        <button
          onClick={() => navigate('/play')}
          className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-2xl text-xs font-bold"
        >
          Back to Play
        </button>
      </div>
    );
  }

  const isHost = user?.id === match.creatorId || user?.id === match.refereeId;
  const maxPerTeam = match.matchType === '2v2' ? 2 : 1;
  const totalRequired = maxPerTeam * 2;

  const currentLobbyPlayer: LobbyPlayer = {
    id: user?.id || 'guest',
    displayName: profile?.displayName || user?.email?.split('@')[0] || 'Player',
    photoURL: profile?.photoURL || '',
    rating: profile?.rating || 0,
    rank: profile?.rank || 'Rookie',
  };

  const inTeamA = match.teamA.some((p) => p.id === user?.id);
  const inTeamB = match.teamB.some((p) => p.id === user?.id);
  const teamAFull = match.teamA.length >= maxPerTeam;
  const teamBFull = match.teamB.length >= maxPerTeam;
  const totalInMatch = match.teamA.length + match.teamB.length;
  const canStartMatch = totalInMatch === totalRequired;

  // Copy Room Code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(match.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Join Team (A or B)
  const handleJoinTeam = async (targetTeam: 'A' | 'B') => {
    if (!user || isHost) return;

    let newTeamA = match.teamA.filter((p) => p.id !== user.id);
    let newTeamB = match.teamB.filter((p) => p.id !== user.id);

    if (targetTeam === 'A') {
      if (newTeamA.length >= maxPerTeam) return;
      newTeamA.push(currentLobbyPlayer);
    } else {
      if (newTeamB.length >= maxPerTeam) return;
      newTeamB.push(currentLobbyPlayer);
    }

    // Update locally for instant UI response
    setMatch((prev) => (prev ? { ...prev, teamA: newTeamA, teamB: newTeamB } : null));

    // Sync to Supabase
    await supabase.from('matches').update({
      team_a: newTeamA,
      team_b: newTeamB,
      updated_at: new Date().toISOString(),
    }).eq('id', match.id);
  };

  // Leave Team Slot
  const handleLeaveTeam = async () => {
    if (!user || isHost) return;

    const newTeamA = match.teamA.filter((p) => p.id !== user.id);
    const newTeamB = match.teamB.filter((p) => p.id !== user.id);

    setMatch((prev) => (prev ? { ...prev, teamA: newTeamA, teamB: newTeamB } : null));

    await supabase.from('matches').update({
      team_a: newTeamA,
      team_b: newTeamB,
      updated_at: new Date().toISOString(),
    }).eq('id', match.id);
  };

  // Host starts the match
  const handleStartMatch = async () => {
    if (!isHost || !canStartMatch) return;

    await supabase.from('matches').update({
      status: 'IN_PROGRESS',
      updated_at: new Date().toISOString(),
    }).eq('id', match.id);

    navigate(`/match/${match.id}/live`);
  };

  return (
    <div className="flex-1 flex flex-col justify-between items-center w-full max-w-md mx-auto px-4 py-2 space-y-2.5 select-none">
      
      {/* 🎾 Match Room Header Badge & Specs */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex flex-col items-center text-center space-y-1.5"
      >
        {/* Top Header Row with Back Button and Centered Specs */}
        <div className="w-full flex items-center justify-between relative min-h-[32px]">
          {/* Sleek Minimal Circular Back Button */}
          <button
            type="button"
            onClick={() => navigate('/play')}
            className="w-8 h-8 flex items-center justify-center text-text-light hover:text-white transition-all bg-white/[0.04] hover:bg-white/[0.08] rounded-full border border-white/10 active:scale-95 shadow-sm z-20 shrink-0"
            title="Back to Arena"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>

          {/* Centered Specs Pill (Trophy removed, perfectly centered) */}
          <div className="absolute left-1/2 -translate-x-1/2 inline-flex items-center gap-2 bg-white/[0.05] border border-white/10 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 backdrop-blur-md whitespace-nowrap shadow-sm">
            <span>{match.matchType === '2v2' ? 'Doubles (2v2)' : 'Singles (1v1)'}</span>
            <span className="text-white/30">•</span>
            <span>{match.gameFormat === 'best_of_3' ? 'Best of 3 Sets' : `${match.targetPoints} Pts Game`}</span>
          </div>

          {/* Spacer to guarantee horizontal balance */}
          <div className="w-8 h-8 pointer-events-none shrink-0" />
        </div>

        {/* QR Code & Room Code Group (Equal Spacing Above & Below) */}
        <div className="flex flex-col items-center space-y-2 pt-3.5 pb-1">
          {/* Floating QR Code with Neon Halo */}
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 rounded-2xl blur-lg opacity-80 pointer-events-none" />
            <div className="bg-white p-2 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.8)] relative z-10 border border-white/30">
              <QRCode 
                value={typeof window !== 'undefined' ? `${window.location.origin}/match/${match.id}/lobby` : match.id} 
                size={120} 
              />
            </div>
          </div>

          {/* 1-Tap Copy Room Code Button */}
          <button
            type="button"
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1.5 bg-black/40 hover:bg-black/60 border border-emerald-400/40 hover:border-emerald-400 px-3 py-1 rounded-full text-[11px] font-mono font-black text-emerald-400 tracking-wider shadow-sm active:scale-95 transition-all"
          >
            <span>ROOM: {match.id}</span>
            {copied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3 text-emerald-400/70" />}
          </button>
        </div>
      </motion.div>

      {/* 👥 Dynamic Team Slots Grid */}
      <div className="w-full space-y-2 -mt-6">
        
        {/* TEAM ALPHA (Cyan) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/[0.03] backdrop-blur-md p-3 rounded-2xl border-t border-t-cyan-400/40 border-x border-x-cyan-500/20 border-b border-b-white/5 relative overflow-hidden shadow-sm space-y-1.5"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-xs uppercase tracking-widest font-black flex items-center text-cyan-300">
              <Users className="w-3.5 h-3.5 mr-1.5 text-cyan-400" /> Team Alpha
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-400/20">
              {match.teamA.length} / {maxPerTeam} Slots
            </span>
          </div>

          {/* Team Alpha Player Slots */}
          <div className="space-y-1">
            {Array.from({ length: maxPerTeam }).map((_, idx) => {
              const player = match.teamA[idx];
              return (
                <div 
                  key={idx}
                  className={`flex items-center justify-between py-1.5 px-2.5 rounded-xl border transition-all ${
                    player 
                      ? 'bg-cyan-500/10 border-cyan-400/30 text-white' 
                      : 'bg-black/30 border-white/5 text-text-light/40 border-dashed'
                  }`}
                >
                  {player ? (
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-cyan-400/20 border border-cyan-400/50 overflow-hidden flex items-center justify-center shrink-0">
                        {player.photoURL ? (
                          <img src={player.photoURL} alt={player.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-cyan-300" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{player.displayName}</p>
                        <p className="text-[10px] text-cyan-300 font-medium">{player.rank || 'Rookie'} • {player.rating || 0} CR</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs italic text-text-light/40 pl-2">Open Slot {idx + 1}...</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Button for Team Alpha */}
          {!isHost && (
            <div>
              {inTeamA ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleJoinTeam('B')}
                    disabled={teamBFull}
                    className="flex-1 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Switch to Team Beta
                  </button>
                  <button
                    type="button"
                    onClick={handleLeaveTeam}
                    className="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-[11px] font-bold"
                  >
                    Leave
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleJoinTeam('A')}
                  disabled={teamAFull || inTeamB}
                  className={`w-full py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    teamAFull 
                      ? 'bg-white/[0.04] text-text-light/40 border border-white/5 cursor-not-allowed'
                      : inTeamB
                        ? 'hidden'
                        : 'bg-cyan-400 text-slate-950 shadow-sm active:scale-96'
                  }`}
                >
                  {teamAFull ? 'Team Alpha Full' : 'Join Team Alpha'}
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* TEAM BETA (Emerald) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white/[0.03] backdrop-blur-md p-3 rounded-2xl border-t border-t-emerald-400/40 border-x border-x-emerald-500/20 border-b border-b-white/5 relative overflow-hidden shadow-sm space-y-1.5"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-xs uppercase tracking-widest font-black flex items-center text-emerald-300">
              <Users className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Team Beta
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-400/20">
              {match.teamB.length} / {maxPerTeam} Slots
            </span>
          </div>

          {/* Team Beta Player Slots */}
          <div className="space-y-1">
            {Array.from({ length: maxPerTeam }).map((_, idx) => {
              const player = match.teamB[idx];
              return (
                <div 
                  key={idx}
                  className={`flex items-center justify-between py-1.5 px-2.5 rounded-xl border transition-all ${
                    player 
                      ? 'bg-emerald-500/10 border-emerald-400/30 text-white' 
                      : 'bg-black/30 border-white/5 text-text-light/40 border-dashed'
                  }`}
                >
                  {player ? (
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-400/20 border border-emerald-400/50 overflow-hidden flex items-center justify-center shrink-0">
                        {player.photoURL ? (
                          <img src={player.photoURL} alt={player.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-emerald-300" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{player.displayName}</p>
                        <p className="text-[10px] text-emerald-300 font-medium">{player.rank || 'Rookie'} • {player.rating || 0} CR</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs italic text-text-light/40 pl-2">Open Slot {idx + 1}...</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Button for Team Beta */}
          {!isHost && (
            <div>
              {inTeamB ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleJoinTeam('A')}
                    disabled={teamAFull}
                    className="flex-1 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Switch to Team Alpha
                  </button>
                  <button
                    type="button"
                    onClick={handleLeaveTeam}
                    className="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 text-[11px] font-bold"
                  >
                    Leave
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleJoinTeam('B')}
                  disabled={teamBFull || inTeamA}
                  className={`w-full py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    teamBFull 
                      ? 'bg-white/[0.04] text-text-light/40 border border-white/5 cursor-not-allowed'
                      : inTeamA
                        ? 'hidden'
                        : 'bg-emerald-400 text-slate-950 shadow-sm active:scale-96'
                  }`}
                >
                  {teamBFull ? 'Team Beta Full' : 'Join Team Beta'}
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* 📋 Official Referee Card (Host) */}
        <div className="bg-white/[0.02] py-2 px-3 rounded-2xl border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/40 overflow-hidden flex items-center justify-center shrink-0">
              {match.hostAvatar ? (
                <img src={match.hostAvatar} alt={match.hostName || 'Host'} className="w-full h-full object-cover" />
              ) : (
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{match.hostName || 'Referee'}</span>
                <span className="text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded-md">Host</span>
              </p>
              <p className="text-[10px] text-text-light/60">Official Court Referee</p>
            </div>
          </div>

          <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
            Active
          </span>
        </div>
      </div>

      {/* 🚀 Bottom Controls */}
      <div className="w-full space-y-1.5 pt-0.5 pb-6">
        {isHost ? (
          <button
            type="button"
            onClick={handleStartMatch}
            disabled={!canStartMatch}
            className={`w-full py-3 rounded-xl font-black uppercase tracking-wider text-xs shadow-sm transition-all flex items-center justify-center gap-2 ${
              canStartMatch
                ? 'bg-gradient-to-r from-primary via-emerald-400 to-secondary text-[#050a0a] active:scale-96'
                : 'bg-white/[0.05] text-text-light/40 border border-white/10 cursor-not-allowed'
            }`}
          >
            <span>{canStartMatch ? 'Start Live Match' : `Waiting for Players (${totalInMatch}/${totalRequired})...`}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="text-center py-2 px-3 bg-white/[0.03] border border-white/10 rounded-xl">
            <p className="text-xs text-text-light">
              {inTeamA || inTeamB 
                ? '✅ You are ready! Waiting for the Host to start the match...' 
                : '👈 Choose Team Alpha or Team Beta to join the match!'}
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
