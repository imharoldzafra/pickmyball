import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Match, Team } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Flame, Trophy, Zap, Shield, Swords, Sparkles, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LiveMatch() {
  const { matchId } = useParams<{ matchId: string }>();
  const { user, recordMatchResult } = useAuth();
  const navigate = useNavigate();

  // Mock initial state
  const [match, setMatch] = useState<Match>({
    id: matchId || 'MOCK',
    creatorId: user?.uid || '',
    status: 'IN_PROGRESS',
    teamA: [user?.uid || 'A1'],
    teamB: ['B1'],
    refereeId: user?.uid || null,
    currentGame: 1,
    teamAScore: 0,
    teamBScore: 0,
    teamAGamesWon: 0,
    teamBGamesWon: 0,
    servingTeam: 'A',
    serverNumber: 2,
    gameResults: [],
    matchWinner: 'NONE',
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  const isReferee = match.refereeId === user?.uid;

  const handleScore = async (winner: Team) => {
    if (!isReferee) return;
    
    setMatch(prev => {
      const nextState = { ...prev };
      
      if (winner === nextState.servingTeam) {
        // Point scored!
        if (nextState.servingTeam === 'A') nextState.teamAScore++;
        else nextState.teamBScore++;
        
        // Check game win
        const winBy2 = Math.abs(nextState.teamAScore - nextState.teamBScore) >= 2;
        const reached11 = nextState.teamAScore >= 11 || nextState.teamBScore >= 11;
        
        if (reached11 && winBy2) {
          // End of game
          const updatedResults = [...nextState.gameResults, {
            gameNumber: nextState.currentGame,
            teamAScore: nextState.teamAScore,
            teamBScore: nextState.teamBScore
          }];
          nextState.gameResults = updatedResults;
          
          if (nextState.teamAScore > nextState.teamBScore) nextState.teamAGamesWon++;
          else nextState.teamBGamesWon++;
          
          // Match over?
          if (nextState.teamAGamesWon === 2 || nextState.teamBGamesWon === 2) {
            nextState.matchWinner = nextState.teamAGamesWon === 2 ? 'A' : 'B';
            nextState.status = 'FINISHED';

            const userIsTeamA = nextState.teamA.includes(user?.uid || '');
            const userWon = (nextState.matchWinner === 'A' && userIsTeamA) || (nextState.matchWinner === 'B' && !userIsTeamA);
            const scoreSummary = updatedResults.map(g => `${g.teamAScore} - ${g.teamBScore}`).join(', ');

            recordMatchResult(
              userWon,
              userWon ? 150 : 40,
              userWon ? 25 : -12,
              {
                id: nextState.id,
                type: '1v1 Competitive',
                opponent: userIsTeamA ? 'Team Beta' : 'Team Alpha',
                score: scoreSummary || `${nextState.teamAScore} - ${nextState.teamBScore}`
              }
            );
          } else {
            nextState.currentGame++;
            nextState.teamAScore = 0;
            nextState.teamBScore = 0;
            // Alternate starting team per game (simplification)
            nextState.servingTeam = nextState.currentGame % 2 === 0 ? 'B' : 'A';
            nextState.serverNumber = 2; // Exception rule applies to start of any game
          }
        }
      } else {
        // Side out logic
        // First service of a game starts on Server 2
        const isFirstService = nextState.teamAScore === 0 && nextState.teamBScore === 0 && nextState.serverNumber === 2;
        
        if (nextState.serverNumber === 1 && !isFirstService) {
          nextState.serverNumber = 2;
        } else {
          // Side out
          nextState.servingTeam = nextState.servingTeam === 'A' ? 'B' : 'A';
          nextState.serverNumber = 1;
        }
      }

      nextState.updatedAt = Date.now();
      return nextState;
    });
  };

  if (match.status === 'FINISHED') {
    const isWinnerAlpha = match.matchWinner === 'A';
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#05080c] p-6 text-center space-y-6 relative overflow-hidden">
        {/* Background glow */}
        <div className={`absolute w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none ${isWinnerAlpha ? 'bg-cyan-500' : 'bg-emerald-500'}`} />
        
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <div className="text-6xl mb-4 drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">🏆</div>
          <h1 className="text-5xl font-black tracking-tight text-white">VICTORY</h1>
          <h2 className={`text-2xl font-black font-mono uppercase tracking-widest mt-2 ${isWinnerAlpha ? 'text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]' : 'text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.6)]'}`}>
            TEAM {isWinnerAlpha ? 'ALPHA' : 'BETA'}
          </h2>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 mt-6 bg-white/[0.04] backdrop-blur-2xl p-8 rounded-3xl border border-white/10 w-full max-w-sm relative z-10 shadow-2xl"
        >
          <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-text-light px-2 pb-2 border-b border-white/10">
            <span>Set</span>
            <span className="text-cyan-400">Alpha</span>
            <span className="text-emerald-400">Beta</span>
          </div>
          {match.gameResults.map(gr => (
            <div key={gr.gameNumber} className="flex justify-between items-center text-lg font-mono px-2">
              <span className="text-white/50 text-xs font-bold">Game {gr.gameNumber}</span>
              <span className={`font-black ${gr.teamAScore > gr.teamBScore ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'text-white/40'}`}>{gr.teamAScore}</span>
              <span className="text-white/20">-</span>
              <span className={`font-black ${gr.teamBScore > gr.teamAScore ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'text-white/40'}`}>{gr.teamBScore}</span>
            </div>
          ))}
        </motion.div>

        <div className="pt-6 relative z-10">
          <button onClick={() => navigate('/')} className="bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(16,185,129,0.6)] transition-all active:scale-95">
            Exit Match
          </button>
        </div>
      </div>
    );
  }

  const tAScore = match.teamAScore;
  const tBScore = match.teamBScore;
  const isAlphaServing = match.servingTeam === 'A';

  const isAlphaLeading = tAScore > tBScore;
  const isBetaLeading = tBScore > tAScore;
  const isTied = tAScore === tBScore && tAScore > 0;

  const isAlphaGamePoint = tAScore >= 10 && tAScore > tBScore;
  const isBetaGamePoint = tBScore >= 10 && tBScore > tAScore;

  return (
    <div className="p-5 pb-24 max-w-lg mx-auto space-y-6">
      {/* Header & Game Progress */}
      <div className="text-center relative">
        <div className="inline-flex items-center gap-1.5 bg-white/[0.06] border border-white/10 px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest text-text-light backdrop-blur-md">
          <Swords className="w-3.5 h-3.5 text-primary" />
          <span>Game {match.currentGame} of 3</span>
        </div>

        {/* 🌟 Dedicated Color-Coded Live Callout Board */}
        <div className="mt-6 mb-4 p-5 rounded-3xl bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/15 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
          {/* Ambient Glow for Active Server */}
          <div className={`absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-24 rounded-full blur-2xl opacity-30 pointer-events-none ${isAlphaServing ? 'bg-cyan-500' : 'bg-emerald-500'}`} />

          <div className="flex items-center justify-center gap-3 sm:gap-6 my-2 font-mono relative z-10">
            {/* 1st Number: Server Team Score */}
            <span className={`text-6xl sm:text-7xl font-black tracking-tight ${isAlphaServing ? 'text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.7)]' : 'text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.7)]'}`}>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={isAlphaServing ? tAScore : tBScore}
                  initial={{ scale: 1.15, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="inline-block"
                >
                  {isAlphaServing ? tAScore : tBScore}
                </motion.span>
              </AnimatePresence>
            </span>

            {/* Separator */}
            <span className="text-4xl sm:text-5xl font-light text-white/20">:</span>

            {/* 2nd Number: Receiver Team Score */}
            <span className={`text-6xl sm:text-7xl font-black tracking-tight ${isAlphaServing ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.7)]' : 'text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.7)]'}`}>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={isAlphaServing ? tBScore : tAScore}
                  initial={{ scale: 1.15, opacity: 0.7 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="inline-block"
                >
                  {isAlphaServing ? tBScore : tAScore}
                </motion.span>
              </AnimatePresence>
            </span>

            {/* Separator */}
            <span className="text-4xl sm:text-5xl font-light text-white/20">:</span>

            {/* 3rd Number: Server # (1 or 2) */}
            <span className="text-6xl sm:text-7xl font-black tracking-tight text-white drop-shadow-md">
              {match.serverNumber}
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isAlphaServing ? 'bg-cyan-400' : 'bg-emerald-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isAlphaServing ? 'bg-cyan-400' : 'bg-emerald-400'}`}></span>
            </span>
            <p className={`text-xs font-black uppercase tracking-widest ${isAlphaServing ? 'text-cyan-400' : 'text-emerald-400'}`}>
              {isAlphaServing ? 'Team Alpha is Serving' : 'Team Beta is Serving'}
            </p>
          </div>
        </div>
      </div>

      {/* 🥊 2x Interactive Score Cards (Alpha Cyan vs Beta Emerald Green) */}
      <div className="grid grid-cols-2 gap-4">
        {/* Team Alpha Score Box */}
        <div 
          className={`p-5 rounded-3xl flex flex-col justify-between border relative overflow-hidden backdrop-blur-2xl transition-all duration-300 shadow-lg ${
            isAlphaLeading
              ? 'border-cyan-400/70 bg-gradient-to-br from-cyan-500/20 via-cyan-950/30 to-white/[0.03] shadow-[0_0_25px_rgba(6,182,212,0.25)]'
              : isAlphaServing 
                ? 'border-cyan-500/50 bg-gradient-to-br from-cyan-500/12 via-cyan-950/15 to-white/[0.02]' 
                : 'border-white/10 bg-white/[0.04] opacity-80'
          }`}
        >
          {/* Subtle Ambient Glow when Leading */}
          {isAlphaLeading && (
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-cyan-500/20 rounded-full blur-xl pointer-events-none" />
          )}

          {/* Top Indicator */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-1.5 bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#06b6d4]"></span>
              Alpha
            </div>

            {/* Status Pills: Game Point / Ahead */}
            {isAlphaGamePoint ? (
              <span className="text-[9px] font-black text-amber-300 uppercase tracking-wider bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                Game Point
              </span>
            ) : isAlphaLeading ? (
              <span className="text-[9px] font-bold text-cyan-300 bg-cyan-500/20 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                +{tAScore - tBScore} Lead
              </span>
            ) : null}
          </div>

          {/* Big Score with Smooth Satisfying Micro Spring Pop */}
          <div className="my-4 text-center relative z-10">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={tAScore}
                initial={{ scale: 1.18, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="inline-block text-6xl font-black font-mono text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]"
              >
                {tAScore}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Bottom Games Won */}
          <div className="flex items-center justify-between text-[10px] font-bold text-cyan-300 bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20 relative z-10">
            <span>Games Won</span>
            <span className="font-mono font-black text-cyan-300">{match.teamAGamesWon}</span>
          </div>
        </div>

        {/* Team Beta Score Box (Standard App Green / Emerald) */}
        <div 
          className={`p-5 rounded-3xl flex flex-col justify-between border relative overflow-hidden backdrop-blur-2xl transition-all duration-300 shadow-lg ${
            isBetaLeading
              ? 'border-emerald-400/70 bg-gradient-to-br from-emerald-500/20 via-emerald-950/30 to-white/[0.03] shadow-[0_0_25px_rgba(16,185,129,0.25)]'
              : !isAlphaServing 
                ? 'border-emerald-500/50 bg-gradient-to-br from-emerald-500/12 via-emerald-950/15 to-white/[0.02]' 
                : 'border-white/10 bg-white/[0.04] opacity-80'
          }`}
        >
          {/* Subtle Ambient Glow when Leading */}
          {isBetaLeading && (
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl pointer-events-none" />
          )}

          {/* Top Indicator */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]"></span>
              Beta
            </div>

            {/* Status Pills: Game Point / Ahead */}
            {isBetaGamePoint ? (
              <span className="text-[9px] font-black text-amber-300 uppercase tracking-wider bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                Game Point
              </span>
            ) : isBetaLeading ? (
              <span className="text-[9px] font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                +{tBScore - tAScore} Lead
              </span>
            ) : null}
          </div>

          {/* Big Score with Smooth Satisfying Micro Spring Pop */}
          <div className="my-4 text-center relative z-10">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={tBScore}
                initial={{ scale: 1.18, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="inline-block text-6xl font-black font-mono text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.6)]"
              >
                {tBScore}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* Bottom Games Won */}
          <div className="flex items-center justify-between text-[10px] font-bold text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 relative z-10">
            <span>Games Won</span>
            <span className="font-mono font-black text-emerald-300">{match.teamBGamesWon}</span>
          </div>
        </div>
      </div>

      {/* Control Panel / Referee Actions */}
      {isReferee ? (
        <div className="space-y-3.5 pt-2">
          <div className="flex items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wider text-text-light">
            <Shield className="w-3.5 h-3.5 text-primary" /> Referee Control
          </div>
          
          <button 
            onClick={() => handleScore('A')}
            className="w-full relative overflow-hidden bg-gradient-to-r from-cyan-600/30 via-cyan-500/20 to-cyan-700/10 border-2 border-cyan-500/60 p-4.5 rounded-2xl flex items-center justify-between text-cyan-300 font-mono text-base font-black uppercase tracking-widest active:scale-96 transition-transform shadow-lg"
          >
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#06b6d4]"></span>
              <span>Point to Alpha</span>
            </div>
            <span className="text-xs bg-cyan-500/20 border border-cyan-500/40 px-3 py-1 rounded-xl text-cyan-200">
              {isAlphaServing ? '+1 Point' : 'Side Out'}
            </span>
          </button>

          <button 
            onClick={() => handleScore('B')}
            className="w-full relative overflow-hidden bg-gradient-to-r from-emerald-600/30 via-emerald-500/20 to-emerald-700/10 border-2 border-emerald-500/60 p-4.5 rounded-2xl flex items-center justify-between text-emerald-300 font-mono text-base font-black uppercase tracking-widest active:scale-96 transition-transform shadow-lg"
          >
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]"></span>
              <span>Point to Beta</span>
            </div>
            <span className="text-xs bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 rounded-xl text-emerald-200">
              {!isAlphaServing ? '+1 Point' : 'Side Out'}
            </span>
          </button>
        </div>
      ) : (
        <div className="mt-8 text-center p-6 bg-white/[0.04] backdrop-blur-2xl rounded-3xl border border-white/10 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-primary to-emerald-400"></div>
          <p className="text-text-light text-xs uppercase tracking-widest flex items-center justify-center font-bold">
            <span className="relative flex h-2.5 w-2.5 mr-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
            </span>
            Awaiting referee score updates...
          </p>
        </div>
      )}
    </div>
  );
}
