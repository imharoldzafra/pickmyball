import React, { useState, useEffect } from 'react';
import { Calendar, Trophy, Swords, TrendingUp, Sparkles, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface MatchRecord {
  id: string;
  date: string;
  type: string;
  opponent: string;
  score: string;
  result: 'WON' | 'LOST';
  xpEarned: string;
  crChange: string;
}

export default function History() {
  const { profile } = useAuth();
  const [matches, setMatches] = useState<MatchRecord[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('matchHistory');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const limited = Array.isArray(parsed) ? parsed.slice(0, 10) : [];
        setMatches(limited);
        if (Array.isArray(parsed) && parsed.length > 10) {
          localStorage.setItem('matchHistory', JSON.stringify(limited));
        }
      } catch (e) {
        setMatches([]);
      }
    } else {
      setMatches([]);
    }
  }, []);

  const totalMatches = matches.length;
  const winsCount = matches.filter(m => m.result === 'WON').length;
  const winRate = totalMatches > 0 ? Math.round((winsCount / totalMatches) * 100) : (profile?.battles ? Math.round((profile.wins / profile.battles) * 100) : 0);
  const totalXp = profile?.xp || 0;
  const netCr = profile?.rating || 0;

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-h-[84vh] p-5 pb-2 overflow-hidden space-y-4">
      {/* Pinned Top Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-shrink-0"
      >
        <h1 className="text-2xl font-bold tracking-tight text-white">Match History</h1>
        <p className="text-xs text-text-light font-medium">Review your performance statistics and past matches.</p>
      </motion.div>

      {/* Pinned Glass Stats Overview Card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="flex-shrink-0 bg-white/[0.025] backdrop-blur-md border-t border-t-white/20 border-x border-x-white/10 border-b border-b-white/5 p-4.5 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.35)] grid grid-cols-3 gap-3 text-center divide-x divide-white/10"
      >
        <div>
          <span className="block text-[10px] font-bold text-text-light uppercase tracking-wider mb-1">Win Rate</span>
          <span className="text-lg font-extrabold text-white flex items-center justify-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-primary" /> {winRate}%
          </span>
        </div>
        <div>
          <span className="block text-[10px] font-bold text-text-light uppercase tracking-wider mb-1">Total XP</span>
          <span className="text-lg font-extrabold text-primary flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> {totalXp} XP
          </span>
        </div>
        <div>
          <span className="block text-[10px] font-bold text-text-light uppercase tracking-wider mb-1">Current CR</span>
          <span className="text-lg font-extrabold text-[#38bdf8] flex items-center justify-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-[#38bdf8]" /> {netCr} CR
          </span>
        </div>
      </motion.div>

      {/* Internal Scrollable Match Records List */}
      <div className="flex-1 flex flex-col min-h-0 space-y-3">
        <div className="flex items-center justify-between px-1 flex-shrink-0">
          <h3 className="text-xs font-bold uppercase tracking-widest text-text-light flex items-center gap-1.5">
            <Swords className="w-4 h-4 text-primary" /> Past Sessions
          </h3>
          <span className="text-[10px] font-mono font-bold text-text-light/60 bg-white/[0.04] border border-white/10 px-2 py-0.5 rounded-full">
            {matches.length} {matches.length === 1 ? 'Match' : 'Matches'}
          </span>
        </div>

        {/* Scrollable list or Empty State */}
        {matches.length > 0 ? (
          <div 
            className="flex-1 overflow-y-auto pr-1 pt-3 pb-8 space-y-3.5 overscroll-contain no-scrollbar"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 16px, black calc(100% - 24px), transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 16px, black calc(100% - 24px), transparent 100%)'
            }}
          >
            {matches.map((match, idx) => (
              <motion.div 
                key={match.id + idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-white/[0.025] backdrop-blur-md border-t border-t-white/20 border-x border-x-white/10 border-b border-b-white/5 p-4.5 rounded-3xl flex justify-between items-center relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold font-mono bg-white/10 text-white px-2 py-0.5 rounded-md border border-white/10">{match.id}</span>
                    <span className="text-[11px] text-text-light flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3 text-text-light" /> {match.date}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white">vs {match.opponent}</h4>
                    <p className="text-[11px] text-text-light font-semibold mt-0.5">{match.type} • Score: {match.score}</p>
                  </div>
                </div>

                <div className="text-right space-y-1.5 flex-shrink-0 pl-3">
                  <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    match.result === 'WON' 
                      ? 'bg-primary/15 text-primary border border-primary/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]' 
                      : 'bg-red-500/15 text-red-400 border border-red-500/20'
                  }`}>
                    {match.result}
                  </span>
                  <div className="text-[10px] font-bold space-y-0.5">
                    <p className="text-primary font-mono">{match.xpEarned}</p>
                    <p className={match.crChange.startsWith('+') ? 'text-[#38bdf8] font-mono' : 'text-red-400 font-mono'}>
                      {match.crChange}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white/[0.025] backdrop-blur-md rounded-3xl border-t border-t-white/20 border-x border-x-white/10 border-b border-b-white/5 space-y-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Swords className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-xs">
              <h4 className="text-base font-bold text-white">No matches played yet</h4>
              <p className="text-xs text-text-light/70">
                Start your first match in the Play tab to build your match history and earn CR rating!
              </p>
            </div>
            <Link 
              to="/play"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-[#050a0a] px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-96 transition-transform"
            >
              <PlusCircle className="w-4 h-4" /> Start A Match
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
