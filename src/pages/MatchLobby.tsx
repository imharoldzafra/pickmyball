import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Match, LobbyPlayer } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import QRCode from 'react-qr-code';
import { Users, User, Shield, ArrowRight, ArrowLeft, Copy, Check, RefreshCw } from 'lucide-react';
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
        <div className="w-10 h-10 rounded-full border-2 border-[#244434] border-t-transparent animate-spin" />
        <p className="text-xs font-bold text-[#244434] uppercase tracking-widest">Connecting to Match Room...</p>
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
          <button
            type="button"
            onClick={() => navigate('/play')}
            className="w-8 h-8 flex items-center justify-center text-[#3A4C40] hover:text-[#18281E] transition-all bg-white hover:bg-[#EBF2EC] rounded-full border border-[#E2DDD4] active:scale-95 shadow-sm z-20 shrink-0"
            title="Back to Arena"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>

          {/* Centered Specs Pill */}
          <div className="absolute left-1/2 -translate-x-1/2 inline-flex items-center gap-2 bg-white border border-[#E2DDD4] px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-[#244434] shadow-sm whitespace-nowrap">
            <span>{match.matchType === '2v2' ? 'Doubles (2v2)' : 'Singles (1v1)'}</span>
            <span className="text-[#94A49A]">•</span>
            <span>{match.gameFormat === 'best_of_3' ? 'Best of 3 Sets' : `${match.targetPoints} Pts Game`}</span>
          </div>

          <div className="w-8 h-8 pointer-events-none shrink-0" />
        </div>

        {/* QR Code & Room Code Group */}
        <div className="flex flex-col items-center space-y-2 pt-3.5 pb-1">
          {/* QR Code Container */}
          <div className="relative">
            <div className="bg-white p-2.5 rounded-2xl shadow-[0_4px_20px_rgba(24,40,30,0.06)] relative z-10 border border-[#E2DDD4]">
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
            className="inline-flex items-center gap-1.5 bg-[#EBF2EC] hover:bg-[#DFEAE0] border border-[#D1DDD3] px-3.5 py-1 rounded-full text-[11px] font-mono font-black text-[#244434] tracking-wider shadow-sm active:scale-95 transition-all"
          >
            <span>ROOM: {match.id}</span>
            {copied ? <Check className="w-3 h-3 text-[#244434]" /> : <Copy className="w-3 h-3 text-[#3B6B50]" />}
          </button>
        </div>
      </motion.div>

      {/* 👥 Dynamic Team Slots Grid */}
      <div className="w-full space-y-2.5 -mt-6">
        
        {/* TEAM ALPHA (Court Navy Slate) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-3.5 rounded-2xl border border-[#C8D6E0] shadow-[0_2px_10px_rgba(38,62,80,0.05)] space-y-2"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-xs uppercase tracking-widest font-black flex items-center text-[#263E50]">
              <Users className="w-3.5 h-3.5 mr-1.5 text-[#263E50]" /> Team Alpha
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#EDF3F7] text-[#263E50] border border-[#C8D6E0]">
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
                      ? 'bg-[#EDF3F7] border-[#C8D6E0] text-[#18281E]' 
                      : 'bg-[#F8F7F3] border-[#E2DDD4] text-[#94A49A] border-dashed'
                  }`}
                >
                  {player ? (
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#263E50]/15 border border-[#263E50]/40 overflow-hidden flex items-center justify-center shrink-0">
                        {player.photoURL ? (
                          <img src={player.photoURL} alt={player.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-[#263E50]" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#18281E]">{player.displayName}</p>
                        <p className="text-[10px] text-[#263E50] font-bold">{player.rank || 'Rookie'} • {player.rating || 0} CR</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs italic text-[#94A49A] pl-2">Open Slot {idx + 1}...</span>
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
                    className="flex-1 py-1.5 rounded-xl bg-[#FDF3F1] hover:bg-[#FBEBE8] text-[#8C3B30] border border-[#F2D2CC] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Switch to Team Beta
                  </button>
                  <button
                    type="button"
                    onClick={handleLeaveTeam}
                    className="px-3 py-1.5 rounded-xl bg-[#F8EFEB] hover:bg-[#F0E4E0] text-[#8C3B30] border border-[#EACFC9] text-[11px] font-bold cursor-pointer"
                  >
                    Leave
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleJoinTeam('A')}
                  disabled={teamAFull || inTeamB}
                  className={`w-full py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    teamAFull 
                      ? 'bg-[#F8F7F3] text-[#94A49A] border border-[#E2DDD4] cursor-not-allowed'
                      : inTeamB
                        ? 'hidden'
                        : 'bg-[#2B4C6F] hover:bg-[#203954] text-white shadow-sm active:scale-96'
                  }`}
                >
                  {teamAFull ? 'Team Alpha Full' : 'Join Team Alpha'}
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* TEAM BETA (Terracotta Clay Red #8C3B30) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white p-3.5 rounded-2xl border border-[#F2D2CC] shadow-[0_2px_10px_rgba(140,59,48,0.05)] space-y-2"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-xs uppercase tracking-widest font-black flex items-center text-[#8C3B30]">
              <Users className="w-3.5 h-3.5 mr-1.5 text-[#8C3B30]" /> Team Beta
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#FDF3F1] text-[#8C3B30] border border-[#F2D2CC]">
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
                      ? 'bg-[#FDF3F1] border-[#F2D2CC] text-[#18281E]' 
                      : 'bg-[#F8F7F3] border-[#E2DDD4] text-[#94A49A] border-dashed'
                  }`}
                >
                  {player ? (
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#8C3B30]/15 border border-[#8C3B30]/40 overflow-hidden flex items-center justify-center shrink-0">
                        {player.photoURL ? (
                          <img src={player.photoURL} alt={player.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-[#8C3B30]" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#18281E]">{player.displayName}</p>
                        <p className="text-[10px] text-[#8C3B30] font-bold">{player.rank || 'Rookie'} • {player.rating || 0} CR</p>
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs italic text-[#94A49A] pl-2">Open Slot {idx + 1}...</span>
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
                    className="flex-1 py-1.5 rounded-xl bg-[#EDF3F7] hover:bg-[#DFE8EF] text-[#2B4C6F] border border-[#C8D6E0] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Switch to Team Alpha
                  </button>
                  <button
                    type="button"
                    onClick={handleLeaveTeam}
                    className="px-3 py-1.5 rounded-xl bg-[#F8EFEB] hover:bg-[#F0E4E0] text-[#8C3B30] border border-[#EACFC9] text-[11px] font-bold cursor-pointer"
                  >
                    Leave
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleJoinTeam('B')}
                  disabled={teamBFull || inTeamA}
                  className={`w-full py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    teamBFull 
                      ? 'bg-[#F8F7F3] text-[#94A49A] border border-[#E2DDD4] cursor-not-allowed'
                      : inTeamA
                        ? 'hidden'
                        : 'bg-[#8C3B30] hover:bg-[#793127] text-white shadow-sm active:scale-96'
                  }`}
                >
                  {teamBFull ? 'Team Beta Full' : 'Join Team Beta'}
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* 📋 Official Referee Card (Host) */}
        <div className="bg-white py-2 px-3 rounded-2xl border border-[#E2DDD4] flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#EBF2EC] border border-[#D1DDD3] overflow-hidden flex items-center justify-center shrink-0">
              {match.hostAvatar ? (
                <img src={match.hostAvatar} alt={match.hostName || 'Host'} className="w-full h-full object-cover" />
              ) : (
                <Shield className="w-3.5 h-3.5 text-[#244434]" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-[#18281E] flex items-center gap-1.5">
                <span>{match.hostName || 'Referee'}</span>
                <span className="text-[9px] font-black uppercase bg-[#EBF2EC] text-[#244434] px-1.5 py-0.2 rounded-md">Host</span>
              </p>
              <p className="text-[10px] text-[#6B7E72]">Official Court Referee</p>
            </div>
          </div>

          <span className="text-[10px] font-mono text-[#244434] font-bold bg-[#EBF2EC] border border-[#C6D8CB] px-2 py-0.5 rounded-full">
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
            className={`w-full py-3.5 rounded-2xl font-black uppercase tracking-wider text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
              canStartMatch
                ? 'bg-gradient-to-r from-[#244434] to-[#1A3326] text-white active:scale-96 hover:opacity-95'
                : 'bg-[#F8F7F3] text-[#94A49A] border border-[#E2DDD4] cursor-not-allowed'
            }`}
          >
            <span>{canStartMatch ? 'Start Live Match' : `Waiting for Players (${totalInMatch}/${totalRequired})...`}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="text-center py-2.5 px-3 bg-white border border-[#E2DDD4] rounded-2xl shadow-xs">
            <p className="text-xs text-[#3A4C40] font-medium">
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
