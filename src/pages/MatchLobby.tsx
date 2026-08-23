import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Match } from '../types';
import { useAuth } from '../contexts/AuthContext';
import QRCode from 'react-qr-code';
import { Users, User, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MatchLobby() {
  const { matchId } = useParams<{ matchId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mocked state
  const [match, setMatch] = useState<Match>({
    id: matchId || 'MOCK',
    creatorId: user?.uid || '',
    status: 'WAITING',
    teamA: [],
    teamB: [],
    refereeId: null,
    currentGame: 1,
    teamAScore: 0,
    teamBScore: 0,
    teamAGamesWon: 0,
    teamBGamesWon: 0,
    servingTeam: 'NONE',
    serverNumber: 1,
    gameResults: [],
    matchWinner: 'NONE',
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  const inTeamA = match.teamA.includes(user?.uid || '');
  const inTeamB = match.teamB.includes(user?.uid || '');
  const isReferee = match.refereeId === user?.uid;
  const inMatch = inTeamA || inTeamB || isReferee;

  const joinTeam = (team: 'A' | 'B') => {
    if (!user) return;
    setMatch(prev => {
      const nm = { ...prev };
      if (inTeamA) nm.teamA = nm.teamA.filter(id => id !== user.uid);
      if (inTeamB) nm.teamB = nm.teamB.filter(id => id !== user.uid);
      if (isReferee) nm.refereeId = null;

      if (team === 'A') nm.teamA = [...nm.teamA, user.uid];
      else nm.teamB = [...nm.teamB, user.uid];
      
      return nm;
    });
  };

  const joinReferee = () => {
    if (!user) return;
    setMatch(prev => {
      const nm = { ...prev };
      if (inTeamA) nm.teamA = nm.teamA.filter(id => id !== user.uid);
      if (inTeamB) nm.teamB = nm.teamB.filter(id => id !== user.uid);
      nm.refereeId = user.uid;
      return nm;
    });
  };

  const leaveMatch = () => {
    if (!user) return;
    setMatch(prev => {
      const nm = { ...prev };
      if (inTeamA) nm.teamA = nm.teamA.filter(id => id !== user.uid);
      if (inTeamB) nm.teamB = nm.teamB.filter(id => id !== user.uid);
      if (isReferee) nm.refereeId = null;
      return nm;
    });
  };

  const startMatch = () => {
    navigate(`/match/${matchId}/live`);
  };

  return (
    <div className="p-5 pb-24 flex flex-col items-center max-w-lg mx-auto space-y-6">
      {/* Floating Minimalist QR Code (No bulky outer container) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col items-center text-center pt-2 pb-1 space-y-3"
      >
        {/* Session Code Pill */}
        <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/12 px-4 py-1.5 rounded-full text-[11px] font-mono font-black text-emerald-400 tracking-wider backdrop-blur-md shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]"></span>
          <span>SESSION: {match.id}</span>
        </div>

        {/* Floating QR Tile with Gentle Halo */}
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 via-primary/20 to-emerald-500/20 rounded-3xl blur-xl opacity-70 pointer-events-none" />
          <div className="bg-white p-3.5 rounded-2xl shadow-[0_12px_35px_rgba(0,0,0,0.6)] relative z-10">
            <QRCode value={match.id} size={140} />
          </div>
        </div>

        <p className="text-[10px] font-bold uppercase tracking-widest text-text-light/60">
          Scan to join lobby
        </p>
      </motion.div>

      <div className="w-full space-y-3.5">
        {/* Team A (Alpha Cyan) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="bg-white/[0.03] backdrop-blur-md p-5 rounded-3xl border-t border-t-cyan-400/40 border-x border-x-cyan-500/20 border-b border-b-white/5 relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
        >
          <div className="absolute left-0 top-0 w-1.5 h-full bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.8)]"></div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs uppercase tracking-widest font-black flex items-center text-cyan-300">
              <Users className="w-4 h-4 mr-2 text-cyan-400" /> Team Alpha
            </h3>
            {!inTeamA && match.teamA.length < 2 && (
              <button 
                onClick={() => joinTeam('A')} 
                className="text-[10px] uppercase tracking-widest bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 px-3.5 py-1 rounded-full font-black active:scale-96 transition-transform shadow-sm"
              >
                Join
              </button>
            )}
          </div>
          <div className="space-y-2">
            {match.teamA.map((id) => (
              <div key={id} className="text-sm font-bold text-white flex items-center">
                <User className="w-4 h-4 mr-2 text-cyan-400" /> Player {id.substring(0,4)}
              </div>
            ))}
            {match.teamA.length === 0 && <div className="text-[10px] uppercase tracking-widest text-text-light/50 italic">Awaiting connection...</div>}
          </div>
        </motion.div>

        {/* Team B (Beta Emerald) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="bg-white/[0.03] backdrop-blur-md p-5 rounded-3xl border-t border-t-emerald-400/40 border-x border-x-emerald-500/20 border-b border-b-white/5 relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
        >
          <div className="absolute left-0 top-0 w-1.5 h-full bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.8)]"></div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs uppercase tracking-widest font-black flex items-center text-emerald-300">
              <Users className="w-4 h-4 mr-2 text-emerald-400" /> Team Beta
            </h3>
            {!inTeamB && match.teamB.length < 2 && (
              <button 
                onClick={() => joinTeam('B')} 
                className="text-[10px] uppercase tracking-widest bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3.5 py-1 rounded-full font-black active:scale-96 transition-transform shadow-sm"
              >
                Join
              </button>
            )}
          </div>
          <div className="space-y-2">
            {match.teamB.map((id) => (
              <div key={id} className="text-sm font-bold text-white flex items-center">
                <User className="w-4 h-4 mr-2 text-emerald-400" /> Player {id.substring(0,4)}
              </div>
            ))}
            {match.teamB.length === 0 && <div className="text-[10px] uppercase tracking-widest text-text-light/50 italic">Awaiting connection...</div>}
          </div>
        </motion.div>

        {/* Referee */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="bg-white/[0.03] backdrop-blur-md p-5 rounded-3xl border-t border-t-white/20 border-x border-x-white/10 border-b border-b-white/5 relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
        >
          <div className="absolute left-0 top-0 w-1 h-full bg-white/20"></div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[11px] font-bold uppercase tracking-widest flex items-center text-text-light">
              <Shield className="w-4 h-4 mr-2 text-primary" /> Referee
            </h3>
            {!match.refereeId && !isReferee && (
              <button 
                onClick={joinReferee} 
                className="text-[10px] uppercase tracking-widest bg-white/10 border border-white/15 text-white/80 px-3 py-1 rounded-full font-bold active:scale-96 transition-transform"
              >
                Assume Control
              </button>
            )}
          </div>
          <div className="space-y-2">
            {match.refereeId ? (
              <div className="text-sm font-bold text-white flex items-center">
                <User className="w-4 h-4 mr-2 text-primary" /> Referee {match.refereeId.substring(0,4)}
              </div>
            ) : (
              <div className="text-[10px] uppercase tracking-widest text-text-light/50 italic">Awaiting connection...</div>
            )}
          </div>
        </motion.div>
      </div>
      
      {inMatch && match.status === 'WAITING' && (
        <button onClick={leaveMatch} className="mt-4 text-[10px] uppercase tracking-widest font-bold text-text-light/60 hover:text-white underline">Disconnect</button>
      )}

      {isReferee && (
        <div className="fixed bottom-[80px] w-full px-6 max-w-md">
          <button 
            onClick={startMatch} 
            className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs bg-gradient-to-r from-primary to-secondary text-[#050a0a] active:scale-96 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-transform"
          >
            Initiate Sequence
          </button>
        </div>
      )}
    </div>
  );
}
