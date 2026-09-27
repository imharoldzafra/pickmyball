import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Match, Team } from '../types';
import { useAuth, calculateTierCR } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Flame, Trophy, Shield, Swords, Sparkles, Activity, Check, RotateCcw, User, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiveMatch() {
  const { matchId } = useParams<{ matchId: string }>();
  const { user, profile, recordMatchResult } = useAuth();
  const navigate = useNavigate();

  const [match, setMatch] = useState<Match | null>(() => {
    if (!matchId) return null;
    try {
      const cached = sessionStorage.getItem(`pkb_match_${matchId}`) || localStorage.getItem(`pkb_match_${matchId}`);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn('Initial cache parse error:', e);
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(!match);
  const hasNavigatedRef = React.useRef(false);

  const isFriendlyMatch = Boolean(
    matchId?.includes('FR') || 
    (match as any)?.isFriendly || 
    (match as any)?.matchType === 'friendly' ||
    (match as any)?.creatorId?.startsWith('friendly') ||
    (match as any)?.refereeId?.startsWith('friendly') ||
    match?.teamA?.some((p: any) => p.id?.startsWith('friendly_')) ||
    match?.teamB?.some((p: any) => p.id?.startsWith('friendly_')) ||
    sessionStorage.getItem(`pkb_is_friendly_${matchId}`) === 'true' ||
    sessionStorage.getItem('pkb_guest_offline') === 'true'
  );
  const [showExitModal, setShowExitModal] = useState(false);

  // ⚡ Auto-Navigate to Winner's Profile upon match victory (< 350ms transition)
  useEffect(() => {
    if (isFriendlyMatch) {
      // Friendly offline matches stay right here on the digital court scoreboard!
      return;
    }
    if (match?.status === 'FINISHED' && matchId && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      try {
        sessionStorage.setItem(`pkb_match_${matchId}`, JSON.stringify(match));
      } catch (e) {
        console.warn('Session storage error:', e);
      }
      const timer = setTimeout(() => {
        navigate(`/match/${matchId}/winner`, { replace: true });
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [match?.status, matchId, match, navigate, isFriendlyMatch]);

  // Fetch match from local cache or Supabase
  const fetchMatch = async () => {
    if (!matchId) {
      setLoading(false);
      return;
    }

    // 1. Instant check from local / session cache (0ms instant display for friendly & offline matches)
    const cached = sessionStorage.getItem(`pkb_match_${matchId}`) || localStorage.getItem(`pkb_match_${matchId}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const hydratedMatch: Match = {
          id: parsed.id || matchId,
          creatorId: parsed.creatorId || parsed.host_id || user?.id || 'referee',
          hostId: parsed.hostId || parsed.host_id || user?.id || 'referee',
          hostName: parsed.hostName || parsed.host_name || 'Referee',
          hostAvatar: parsed.hostAvatar || parsed.host_avatar || '',
          matchType: parsed.matchType || parsed.match_type || '1v1',
          gameFormat: parsed.gameFormat || parsed.game_format || 'single_11',
          targetPoints: parsed.targetPoints || parsed.target_points || 11,
          status: parsed.status || 'IN_PROGRESS',
          teamA: parsed.teamA || parsed.team_a || [],
          teamB: parsed.teamB || parsed.team_b || [],
          refereeId: parsed.refereeId || parsed.referee_id || user?.id || 'referee',
          referee: parsed.referee || null,
          currentGame: parsed.currentGame || parsed.current_game || 1,
          teamAScore: parsed.teamAScore ?? parsed.team_a_score ?? 0,
          teamBScore: parsed.teamBScore ?? parsed.team_b_score ?? 0,
          teamAGamesWon: parsed.teamAGamesWon ?? parsed.team_a_games_won ?? 0,
          teamBGamesWon: parsed.teamBGamesWon ?? parsed.team_b_games_won ?? 0,
          servingTeam: parsed.servingTeam || parsed.serving_team || 'A',
          serverNumber: parsed.serverNumber || parsed.server_number || 2,
          gameResults: parsed.gameResults || parsed.game_results || [],
          matchWinner: parsed.matchWinner || parsed.match_winner || 'NONE',
          createdAt: parsed.createdAt || Date.now(),
          updatedAt: parsed.updatedAt || Date.now(),
        };
        setMatch(hydratedMatch);
        setLoading(false);

        // If friendly match, local is the primary source of truth!
        if (matchId.includes('FR')) return;
      } catch (e) {
        console.warn('Cache parse error:', e);
      }
    }

    // 2. Fetch from Supabase for online network matches
    try {
      const { data } = await supabase
        .from('matches')
        .select('*')
        .eq('id', matchId)
        .maybeSingle();

      if (data) {
        setMatch({
          id: data.id,
          creatorId: data.host_id,
          hostId: data.host_id,
          hostName: data.host_name,
          hostAvatar: data.host_avatar,
          matchType: data.match_type || '1v1',
          gameFormat: data.game_format || 'single_11',
          targetPoints: data.target_points || 11,
          status: data.status || 'IN_PROGRESS',
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
        });
      }
    } catch (err) {
      console.error('Fetch live match error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatch();
  }, [matchId]);

  const lastLocalActionTime = React.useRef<number>(0);
  const channelRef = React.useRef<any>(null);
  const matchRef = React.useRef<Match | null>(null);
  matchRef.current = match;

  // Real-time Supabase High-Speed Broadcast + Database Subscription (< 30ms)
  useEffect(() => {
    if (!matchId || matchId.includes('FR')) return;

    const channel = supabase.channel(`live-court-${matchId}`, {
      config: {
        broadcast: { ack: false, self: false },
      },
    });

    channel
      // ⚡ Direct High-Speed Peer-to-Peer WebSocket Broadcast (< 30ms)
      .on('broadcast', { event: 'SCORE_UPDATE' }, ({ payload }) => {
        if (payload) {
          // 🛡️ Security Guard 1: Score & state sanity checks
          if (
            typeof payload.teamAScore !== 'number' || payload.teamAScore < 0 || payload.teamAScore > 99 ||
            typeof payload.teamBScore !== 'number' || payload.teamBScore < 0 || payload.teamBScore > 99 ||
            typeof payload.currentGame !== 'number' || payload.currentGame < 1 || payload.currentGame > 5
          ) {
            console.warn('⚠️ Rejected malformed score broadcast payload:', payload);
            return;
          }

          // 🛡️ Security Guard 2: Authorized Referee / Host verification
          const currentMatch = matchRef.current;
          if (currentMatch) {
            const validReferee = currentMatch.refereeId || currentMatch.creatorId;
            if (payload._senderId && validReferee && payload._senderId !== validReferee) {
              console.warn('⚠️ Rejected unauthorized scoreboard broadcast from non-referee sender:', payload._senderId);
              return;
            }
          }

          setMatch(payload);
          if (payload.status === 'FINISHED' && !isFriendlyMatch) {
            try {
              sessionStorage.setItem(`pkb_match_${payload.id}`, JSON.stringify(payload));
            } catch (e) {
              console.warn('Session storage error:', e);
            }
            setTimeout(() => {
              navigate(`/match/${payload.id}/winner`, { replace: true });
            }, 350);
          }
        }
      })
      // Database Change Fallback (for initial sync or reconnects)
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
            const isRef = user?.id === data.referee_id || user?.id === data.host_id;
            const timeSinceLocalClick = Date.now() - lastLocalActionTime.current;

            // 🛡️ Shield: If I am the referee and recently clicked (< 2.5s), ignore stale cloud echoes
            if (isRef && timeSinceLocalClick < 2500) {
              return;
            }

            setMatch({
              id: data.id,
              creatorId: data.host_id,
              hostName: data.host_name,
              hostAvatar: data.host_avatar,
              matchType: data.match_type || '1v1',
              gameFormat: data.game_format || 'single_11',
              targetPoints: data.target_points || 11,
              status: data.status || 'IN_PROGRESS',
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
            });
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [matchId, user?.id, navigate]);

  if (loading && !match) {
    return (
      <div className="flex-1 w-full h-full min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-3">
        <div className="w-10 h-10 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
        <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Connecting to Court...</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="flex-1 w-full h-full min-h-[60vh] flex flex-col items-center justify-center p-6 space-y-4 text-center">
        <p className="text-sm font-bold text-white">Match not found</p>
        <button
          onClick={() => navigate('/play')}
          className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-slate-950 rounded-2xl text-xs font-black uppercase tracking-wider"
        >
          Return to Arena
        </button>
      </div>
    );
  }

  const isReferee = Boolean(match) && (
    user?.id === match.refereeId || 
    user?.id === match.creatorId || 
    user?.id === match.hostId || 
    Boolean(match.creatorId?.startsWith('friendly')) || 
    Boolean(match.refereeId?.startsWith('friendly')) ||
    Boolean(sessionStorage.getItem(`pkb_match_${match.id}`))
  );
  const targetPoints = match.targetPoints || 11;
  const isBestOfThree = match.gameFormat === 'best_of_3';

  const lastScoreClickTime = React.useRef(0);

  // Referee Scoring Logic with Side Out & Set Management
  const handleScore = async (rallyWinner: Team) => {
    if (!isReferee || !match) return;

    const now = Date.now();
    if (now - lastScoreClickTime.current < 800) {
      return; // prevent rapid accidental double-clicks within 800ms
    }
    lastScoreClickTime.current = now;

    lastLocalActionTime.current = Date.now();

    let newTeamAScore = match.teamAScore;
    let newTeamBScore = match.teamBScore;
    let newTeamAGamesWon = match.teamAGamesWon;
    let newTeamBGamesWon = match.teamBGamesWon;
    let newServingTeam = match.servingTeam;
    let newServerNumber = match.serverNumber;
    let newCurrentGame = match.currentGame;
    let newGameResults = [...match.gameResults];
    let newStatus: any = 'IN_PROGRESS';
    let newWinner: Team = 'NONE';

    if (rallyWinner === match.servingTeam) {
      // Point scored!
      if (rallyWinner === 'A') {
        newTeamAScore++;
      } else {
        newTeamBScore++;
      }

      // Check for Game/Set Win (Must reach target points AND win by at least 2)
      const reachedTarget = newTeamAScore >= targetPoints || newTeamBScore >= targetPoints;
      const winBy2 = Math.abs(newTeamAScore - newTeamBScore) >= 2;

      if (reachedTarget && winBy2) {
        newGameResults.push({
          gameNumber: newCurrentGame,
          teamAScore: newTeamAScore,
          teamBScore: newTeamBScore,
        });

        if (newTeamAScore > newTeamBScore) {
          newTeamAGamesWon++;
        } else {
          newTeamBGamesWon++;
        }

        const setsToWin = isBestOfThree ? 2 : 1;
        if (newTeamAGamesWon >= setsToWin || newTeamBGamesWon >= setsToWin) {
          // Match Finished!
          newWinner = newTeamAGamesWon >= setsToWin ? 'A' : 'B';
          newStatus = 'FINISHED';

          // If NOT friendly match, record career progression (XP / CR)
          if (!isFriendlyMatch) {
            // ⏱️ 60-Second Minimum Match Validity Check (Prevents rapid alt/spam farming)
            const matchDurationSec = match.createdAt ? Math.floor((Date.now() - match.createdAt) / 1000) : 120;
            const isOfficialRated = matchDurationSec >= 60;

            // Record player or referee results
            const userIsTeamA = match.teamA.some((p) => p.id === user?.id);
            const userIsTeamB = match.teamB.some((p) => p.id === user?.id);
            const userIsPlaying = userIsTeamA || userIsTeamB;
            const userIsReferee = !userIsPlaying && (match.hostId === user?.id || match.creatorId === user?.id || match.refereeId === user?.id);

            const teamANames = match.teamA.map((p) => p.displayName).filter(Boolean).join(' & ') || 'Team Alpha';
            const teamBNames = match.teamB.map((p) => p.displayName).filter(Boolean).join(' & ') || 'Team Beta';
            const scoreSummary = newGameResults.map((g) => `${g.teamAScore}-${g.teamBScore}`).join(', ');

            if (userIsPlaying) {
              const userWon = (newWinner === 'A' && userIsTeamA) || (newWinner === 'B' && userIsTeamB);
              const opponentNames = userIsTeamA ? teamBNames : teamANames;

              const crEarned = isOfficialRated
                ? calculateTierCR(profile?.rating || 0, userWon, profile?.currentStreak || 0)
                : 0;
              const xpEarned = isOfficialRated ? (userWon ? 150 : 50) : (userWon ? 40 : 15);
              const matchTypeDesc = isOfficialRated
                ? (match.matchType === '2v2' ? 'Doubles (2v2)' : 'Singles (1v1)')
                : `${match.matchType === '2v2' ? 'Doubles (2v2)' : 'Singles (1v1)'} • Practice`;

              recordMatchResult(
                userWon,
                xpEarned,
                crEarned,
                {
                  id: match.id,
                  type: matchTypeDesc,
                  opponent: opponentNames,
                  score: scoreSummary || `${newTeamAScore} - ${newTeamBScore}`,
                  role: 'PLAYER',
                }
              );
            } else if (userIsReferee) {
              // Referee officiated the match (+75 XP referee bonus if official, +25 XP if practice)
              const refXP = isOfficialRated ? 75 : 25;
              recordMatchResult(
                true,
                refXP,
                0,
                {
                  id: match.id,
                  type: isOfficialRated ? (match.matchType === '2v2' ? 'Doubles (2v2)' : 'Singles (1v1)') : `${match.matchType === '2v2' ? 'Doubles (2v2)' : 'Singles (1v1)'} • Practice`,
                  opponent: `${teamANames} vs ${teamBNames}`,
                  score: scoreSummary || `${newTeamAScore} - ${newTeamBScore}`,
                  role: 'REFEREE',
                }
              );
            }
          }
        } else {
          // Next Set
          newCurrentGame++;
          newTeamAScore = 0;
          newTeamBScore = 0;
          newServingTeam = newCurrentGame % 2 === 0 ? 'B' : 'A';
          newServerNumber = 2; // Pickleball first server rule per game
        }
      }
    } else {
      // Fault / Side out
      const isDoubles = match.matchType === '2v2';
      const isFirstService = match.teamAScore === 0 && match.teamBScore === 0 && match.serverNumber === 2;

      if (isDoubles && match.serverNumber === 1 && !isFirstService) {
        newServerNumber = 2;
      } else {
        // Side Out
        newServingTeam = match.servingTeam === 'A' ? 'B' : 'A';
        newServerNumber = isDoubles ? 1 : 2;
      }
    }

    // ⚡ 1. INSTANT OPTIMISTIC UI UPDATE (0ms delay)
    const nextState: Match = {
      ...match,
      teamAScore: newTeamAScore,
      teamBScore: newTeamBScore,
      teamAGamesWon: newTeamAGamesWon,
      teamBGamesWon: newTeamBGamesWon,
      servingTeam: newServingTeam,
      serverNumber: newServerNumber,
      currentGame: newCurrentGame,
      gameResults: newGameResults,
      status: newStatus,
      matchWinner: newWinner,
      updatedAt: Date.now(),
    };

    setMatch(nextState);

    // ⚡ 2. INSTANT REALTIME BROADCAST TO ALL PHONES (< 30ms)
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'SCORE_UPDATE',
        payload: {
          ...nextState,
          _senderId: user?.id,
          _timestamp: Date.now(),
        },
      });
    }

    // ⚡ 2.5 Always sync state to local & session cache for instant offline reliability
    try {
      sessionStorage.setItem(`pkb_match_${match.id}`, JSON.stringify(nextState));
      localStorage.setItem(`pkb_match_${match.id}`, JSON.stringify(nextState));
    } catch (e) {
      console.warn('Storage sync error:', e);
    }

    // ⚡ 3. If Match Finished, navigate to Winner Profile
    if (newStatus === 'FINISHED') {
      setTimeout(() => {
        navigate(`/match/${match.id}/winner`, { replace: true });
      }, 350);
    }

    // ⚡ 4. Silently sync to Supabase in background for online matches
    if (!match.id.includes('FR')) {
      supabase.from('matches').update({
        team_a_score: newTeamAScore,
        team_b_score: newTeamBScore,
        team_a_games_won: newTeamAGamesWon,
        team_b_games_won: newTeamBGamesWon,
        serving_team: newServingTeam,
        server_number: newServerNumber,
        current_game: newCurrentGame,
        game_results: newGameResults,
        status: newStatus,
        match_winner: newWinner,
        updated_at: new Date().toISOString(),
      }).eq('id', match.id).then(({ error }) => {
        if (error) console.warn('Background sync warning:', error.message);
      });
    }
  };

  const isFinished = match.status === 'FINISHED';
  const isWinnerAlpha = match.matchWinner === 'A';
  const tAScore = match.teamAScore;
  const tBScore = match.teamBScore;
  const isAlphaServing = match.servingTeam === 'A';
  const isAlphaLeading = tAScore > tBScore;
  const isBetaLeading = tBScore > tAScore;
  const winningTeamScore = isWinnerAlpha ? tAScore : tBScore;
  const losingTeamScore = isWinnerAlpha ? tBScore : tAScore;

  // Handle exit navigation to create match setup page
  const handleExitMatch = () => {
    navigate('/play?action=create');
  };

  // Handle Rematch / Play Again on court
  const handleRematch = async () => {
    if (!isReferee) return;
    hasNavigatedRef.current = false;
    const resetState: Partial<Match> = {
      teamAScore: 0,
      teamBScore: 0,
      teamAGamesWon: 0,
      teamBGamesWon: 0,
      servingTeam: 'A',
      serverNumber: 2,
      currentGame: 1,
      gameResults: [],
      status: 'IN_PROGRESS',
      matchWinner: 'NONE',
      updatedAt: Date.now(),
    };

    setMatch((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...resetState };
      try {
        sessionStorage.setItem(`pkb_match_${prev.id}`, JSON.stringify(updated));
        localStorage.setItem(`pkb_match_${prev.id}`, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (!match.id.includes('FR')) {
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
    }
  };

  return (
    <div className="h-full min-h-[92vh] flex flex-col p-4 sm:p-5 max-w-lg mx-auto select-none touch-manipulation overflow-hidden">

      {/* 🎾 1. Top Match Header Pill with Back Navigation */}
      <div className="relative flex items-center justify-between pt-0.5 shrink-0 px-1">
        {/* Back Button */}
        <button
          type="button"
          onClick={() => setShowExitModal(true)}
          className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/15 border border-white/10 flex items-center justify-center text-text-light hover:text-white transition-all active:scale-90 z-20"
          aria-label="Back / Leave match"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Center Pill */}
        <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/10 px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest text-text-light backdrop-blur-md">
          <Swords className="w-3.5 h-3.5 text-primary" />
          <span>{isFriendlyMatch ? `Friendly Match • First to ${targetPoints}` : (isBestOfThree ? `Set ${match.currentGame} of 3` : `First to ${targetPoints}`)}</span>
          {!isFriendlyMatch && (
            <>
              <span className="text-white/30">•</span>
              <span className="text-emerald-400 font-mono">{match.id}</span>
            </>
          )}
        </div>

        {/* Spacer to keep balance */}
        <div className="w-8 h-8 pointer-events-none" />
      </div>

      {/* 🎾 2. All Other Layouts Centered Together as One Unit */}
      <div className="flex-1 flex flex-col justify-center space-y-4 my-auto">

        {/* 🌟 Upper Group: Callout Board & Score Cards (Lifted up further) */}
        <div className="space-y-3.5 -translate-y-7 sm:-translate-y-8">
          {/* 🌟 Dedicated Pickleball Callout Board (Server Score : Receiver Score : Server #) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/15 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className={`absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-24 rounded-full blur-2xl opacity-35 pointer-events-none ${isAlphaServing ? 'bg-cyan-500' : 'bg-emerald-500'}`} />

            <p className="text-[10px] font-black uppercase tracking-widest text-text-light/70 mb-1 text-center">
              Pickleball Three-Digit Callout
            </p>

            <div className="flex items-center justify-center gap-4 my-1 font-mono relative z-10">
              {/* 1st: Serving Team Score */}
              <div className="flex flex-col items-center">
                <span className={`text-5xl sm:text-6xl font-black tracking-tight ${isAlphaServing ? 'text-cyan-400' : 'text-emerald-400'}`}>
                  {isAlphaServing ? tAScore : tBScore}
                </span>
                <span className="text-[9px] font-bold uppercase text-text-light/50">Server</span>
              </div>

              <span className="text-3xl font-light text-white/20 -mt-3">:</span>

              {/* 2nd: Receiving Team Score */}
              <div className="flex flex-col items-center">
                <span className={`text-5xl sm:text-6xl font-black tracking-tight ${isAlphaServing ? 'text-emerald-400' : 'text-cyan-400'}`}>
                  {isAlphaServing ? tBScore : tAScore}
                </span>
                <span className="text-[9px] font-bold uppercase text-text-light/50">Receiver</span>
              </div>

              <span className="text-3xl font-light text-white/20 -mt-3">:</span>

              {/* 3rd: Server Number */}
              <div className="flex flex-col items-center">
                <span className="text-5xl sm:text-6xl font-black tracking-tight text-white drop-shadow-md">
                  {match.serverNumber}
                </span>
                <span className="text-[9px] font-bold uppercase text-text-light/50">Server #</span>
              </div>
            </div>

            {/* Active Serving Pill */}
            <div className="mt-2.5 pt-2.5 border-t border-white/10 flex items-center justify-center gap-2">
              <span className={`w-2 h-2 rounded-full animate-ping ${isAlphaServing ? 'bg-cyan-400' : 'bg-emerald-400'}`} />
              <p className={`text-xs font-black uppercase tracking-widest ${isAlphaServing ? 'text-cyan-400' : 'text-emerald-400'}`}>
                {isAlphaServing ? 'Team Alpha Serving' : 'Team Beta Serving'}
              </p>
            </div>
          </div>

          {/* 🥊 Score Cards (Team Alpha vs Team Beta) */}
          <div className="grid grid-cols-2 gap-3.5">

            {/* Team Alpha Score Box */}
            <div className={`p-4 rounded-3xl flex flex-col justify-between border backdrop-blur-2xl transition-all shadow-md ${isAlphaLeading
              ? 'border-cyan-400/80 bg-gradient-to-br from-cyan-500/20 to-white/[0.03]'
              : isAlphaServing
                ? 'border-cyan-500/50 bg-cyan-950/20'
                : 'border-white/10 bg-white/[0.03]'
              }`}>
              <div className="flex justify-between items-center">
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase tracking-wider border border-cyan-500/30">
                  Alpha
                </span>
                {isAlphaLeading && (
                  <span className="text-[9px] font-bold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full">
                    +{tAScore - tBScore} Lead
                  </span>
                )}
              </div>

              <div className="my-2.5 text-center">
                <span className="text-5xl font-black font-mono text-cyan-400">
                  {tAScore}
                </span>
              </div>

              {/* Players in Team Alpha */}
              <div className="space-y-1 pt-2 border-t border-cyan-400/20">
                {isFriendlyMatch ? (
                  <p className="text-[11px] font-bold text-white truncate text-center">
                    Team Alpha
                  </p>
                ) : (
                  (match.teamA || []).map((p, idx) => (
                    <p key={p?.id || `a_${idx}`} className="text-[11px] font-bold text-white truncate text-center">
                      {p?.displayName || `Player ${idx + 1}`}
                    </p>
                  ))
                )}
              </div>
            </div>

            {/* Team Beta Score Box */}
            <div className={`p-4 rounded-3xl flex flex-col justify-between border backdrop-blur-2xl transition-all shadow-md ${isBetaLeading
              ? 'border-emerald-400/80 bg-gradient-to-br from-emerald-500/20 to-white/[0.03]'
              : !isAlphaServing
                ? 'border-emerald-500/50 bg-emerald-950/20'
                : 'border-white/10 bg-white/[0.03]'
              }`}>
              <div className="flex justify-between items-center">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                  Beta
                </span>
                {isBetaLeading && (
                  <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                    +{tBScore - tAScore} Lead
                  </span>
                )}
              </div>

              <div className="my-2.5 text-center">
                <span className="text-5xl font-black font-mono text-emerald-400">
                  {tBScore}
                </span>
              </div>

              {/* Players in Team Beta */}
              <div className="space-y-1 pt-2 border-t border-emerald-400/20">
                {isFriendlyMatch ? (
                  <p className="text-[11px] font-bold text-white truncate text-center">
                    Team Beta
                  </p>
                ) : (
                  (match.teamB || []).map((p, idx) => (
                    <p key={p?.id || `b_${idx}`} className="text-[11px] font-bold text-white truncate text-center">
                      {p?.displayName || `Player ${idx + 1}`}
                    </p>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

        {/* 🎮 Referee Controls vs Live Spectator View */}
        {isFinished ? null : isReferee ? (
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wider text-text-light">
              <Shield className="w-3.5 h-3.5 text-emerald-400" /> Host Referee Controls
            </div>

            <button
              type="button"
              onClick={() => handleScore('A')}
              className="w-full bg-gradient-to-r from-cyan-600/30 via-cyan-500/20 to-cyan-700/10 border-2 border-cyan-500/60 p-3.5 rounded-2xl flex items-center justify-between text-cyan-300 font-mono text-sm font-black uppercase tracking-wider active:scale-96 transition-transform shadow-md"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span>Rally to Team Alpha</span>
              </div>
              <span className="text-xs bg-cyan-500/20 border border-cyan-500/40 px-3 py-1 rounded-xl text-cyan-200">
                {isAlphaServing ? '+1 Point' : 'Side Out'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleScore('B')}
              className="w-full bg-gradient-to-r from-emerald-600/30 via-emerald-500/20 to-emerald-700/10 border-2 border-emerald-500/60 p-3.5 rounded-2xl flex items-center justify-between text-emerald-300 font-mono text-sm font-black uppercase tracking-wider active:scale-96 transition-transform shadow-md"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>Rally to Team Beta</span>
              </div>
              <span className="text-xs bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 rounded-xl text-emerald-200">
                {!isAlphaServing ? '+1 Point' : 'Side Out'}
              </span>
            </button>
          </div>
        ) : (
          <div className="text-center p-3.5 bg-white/[0.03] backdrop-blur-2xl rounded-2xl border border-white/10 shadow-sm">
            <p className="text-xs text-text-light font-bold flex items-center justify-center gap-2">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Official Court Referee: {match.hostName || 'Host'}</span>
            </p>
          </div>
        )}

      </div>

      {/* 🚪 Exit Match Confirmation Modal */}
      <AnimatePresence>
        {showExitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-5"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 10 }}
              className="w-full max-w-sm bg-[#0a1015] border border-white/15 rounded-3xl p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.9)] space-y-4"
            >
              <div>
                <h3 className="text-base font-black text-white">Leave Match?</h3>
                <p className="text-xs text-text-light/70 mt-1">
                  Current court score progress will be abandoned.
                </p>
              </div>

              <div className="space-y-2.5 pt-2 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => setShowExitModal(false)}
                  className="w-[68%] max-w-[210px] py-3 rounded-2xl font-extrabold uppercase tracking-wider text-xs bg-gradient-to-r from-primary to-secondary text-[#050a0a] shadow-lg shadow-emerald-500/10 hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  Keep Playing
                </button>
                <button
                  type="button"
                  onClick={handleExitMatch}
                  className="w-[68%] max-w-[210px] py-3 rounded-2xl font-bold uppercase tracking-wider text-xs bg-red-500/15 text-red-400 border border-red-500/30 backdrop-blur-md hover:bg-red-500/25 active:scale-[0.98] transition-all"
                >
                  Leave Match
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🏆 Friendly Match Winner Overlay Modal (Pure Offline Scoreboard - No XP / No CR) */}
      <AnimatePresence>
        {isFinished && isFriendlyMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-5"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-sm bg-[#080d12] border border-white/15 rounded-3xl p-6 text-center shadow-[0_25px_60px_rgba(0,0,0,0.9)] space-y-5 relative overflow-hidden"
            >
              {/* Ambient glow behind winner badge */}
              <div
                className={`absolute -top-12 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-3xl opacity-30 pointer-events-none ${
                  isWinnerAlpha ? 'bg-cyan-500' : 'bg-emerald-500'
                }`}
              />

              <div className="relative z-10 space-y-2">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/10 mx-auto shadow-inner">
                  <Trophy className={`w-7 h-7 ${isWinnerAlpha ? 'text-cyan-400' : 'text-emerald-400'}`} />
                </div>

                <p className="text-[11px] font-black uppercase tracking-widest text-text-light/60">
                  Match Finished
                </p>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  {isWinnerAlpha ? 'Team Alpha Wins!' : 'Team Beta Wins!'}
                </h2>
              </div>

              {/* Final Score Display */}
              <div className="relative z-10 py-4 px-6 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center gap-6">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400">Team Alpha</span>
                  <span className="text-4xl font-black font-mono text-white">{tAScore}</span>
                </div>
                <span className="text-2xl font-light text-white/20">-</span>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">Team Beta</span>
                  <span className="text-4xl font-black font-mono text-white">{tBScore}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="relative z-10 space-y-2.5 pt-1 flex flex-col items-center">
                <button
                  type="button"
                  onClick={handleRematch}
                  className="w-[68%] max-w-[210px] py-3 rounded-2xl font-extrabold uppercase tracking-wider text-xs bg-gradient-to-r from-primary to-secondary text-[#050a0a] shadow-lg shadow-emerald-500/10 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4 text-[#050a0a]" />
                  <span>Rematch</span>
                </button>

                <button
                  type="button"
                  onClick={handleExitMatch}
                  className="w-[68%] max-w-[210px] py-3 rounded-2xl font-bold uppercase tracking-wider text-xs bg-red-500/15 text-red-400 border border-red-500/30 backdrop-blur-md hover:bg-red-500/25 active:scale-[0.98] transition-all flex items-center justify-center"
                >
                  Exit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
