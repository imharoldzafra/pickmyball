import React, { useState, useEffect } from 'react';
import { Calendar, Trophy, TrendingUp, Sparkles, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface MatchRecord {
  id: string;
  date: string;
  type: string;
  opponent: string;
  score: string;
  result: 'WON' | 'LOST' | 'REFEREED';
  xpEarned: string;
  crChange: string;
  role?: 'PLAYER' | 'REFEREE';
}

const CrossedPaddles = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Paddle 1 (Top-Left to Bottom-Right) */}
    <g transform="rotate(45 12 12)">
      <rect x="7" y="1" width="10" height="11" rx="3.5" />
      <path d="M12 12v9" strokeWidth="2.5" />
      <path d="M10 21h4" strokeWidth="2.5" />
    </g>
    {/* Paddle 2 (Top-Right to Bottom-Left) */}
    <g transform="rotate(-45 12 12)">
      <rect x="7" y="1" width="10" height="11" rx="3.5" />
      <path d="M12 12v9" strokeWidth="2.5" />
      <path d="M10 21h4" strokeWidth="2.5" />
    </g>
    {/* Center Pickleball */}
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

export default function History() {
  const { profile } = useAuth();
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [filter, setFilter] = useState<'TODAY' | 'ALL'>('TODAY');

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

  const todayDateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const todayMatches = matches.filter(m => m.date === todayDateStr);
  const displayedMatches = filter === 'TODAY' ? todayMatches : matches;

  const playerMatches = displayedMatches.filter(m => m.result === 'WON' || m.result === 'LOST');
  const totalMatches = playerMatches.length;
  const winsCount = playerMatches.filter(m => m.result === 'WON').length;
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
          <span className="block text-[10px] font-bold text-text-light uppercase tracking-wider mb-1">
            {filter === 'TODAY' ? 'Today Win Rate' : 'Win Rate'}
          </span>
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
            <Trophy className="w-3.5 h-3.5 text-[#38bdf8]" /> {netCr}
          </span>
        </div>
      </motion.div>

      {/* Match History List Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="flex-1 min-h-0 flex flex-col pt-1"
      >
        {/* Filter Navigation Bar */}
        <div className="flex items-center justify-between mb-2.5 flex-shrink-0">
          <div className="flex items-center gap-1.5 bg-white/[0.04] p-1 rounded-2xl border border-white/10 shadow-inner">
            <button
              onClick={() => setFilter('TODAY')}
              className={`px-3.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 ${filter === 'TODAY'
                ? 'bg-primary text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                : 'text-text-light hover:text-white'
                }`}
            >
              Today ({todayMatches.length})
            </button>
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 ${filter === 'ALL'
                ? 'bg-primary text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                : 'text-text-light hover:text-white'
                }`}
            >
              Recent 10 ({matches.length})
            </button>
          </div>

          <span className="text-[10px] font-mono font-bold text-text-light/60 bg-white/[0.04] border border-white/10 px-2.5 py-1 rounded-full">
            {displayedMatches.length} {displayedMatches.length === 1 ? 'Match' : 'Matches'}
          </span>
        </div>

        {/* Scrollable list or Empty State */}
        {displayedMatches.length > 0 ? (
          <div
            className="flex-1 overflow-y-auto pr-1 pt-2 pb-8 space-y-3.5 overscroll-contain no-scrollbar"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 16px, black calc(100% - 24px), transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 16px, black calc(100% - 24px), transparent 100%)'
            }}
          >
            {displayedMatches.map((match, idx) => (
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
                    <h4 className="text-sm font-extrabold text-white">
                      {match.result === 'REFEREED' ? match.opponent : `vs ${match.opponent}`}
                    </h4>
                    <p className="text-[11px] text-text-light font-semibold mt-0.5">
                      {match.result === 'REFEREED' ? `Court Refereed • Score: ${match.score}` : `${match.type} • Score: ${match.score}`}
                    </p>
                  </div>
                </div>

                <div className="text-right space-y-1.5 flex-shrink-0 pl-3">
                  <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${match.result === 'REFEREED'
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                    : match.result === 'WON'
                      ? 'bg-primary/15 text-primary border border-primary/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                      : 'bg-red-500/15 text-red-400 border border-red-500/20'
                    }`}>
                    {match.result === 'REFEREED' ? 'REFEREED 🛡️' : match.result}
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
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(16,185,129,0.25)]">
              <CrossedPaddles className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-xs">
              <h4 className="text-base font-bold text-white">
                {filter === 'TODAY' ? 'No matches played today' : 'No matches played yet'}
              </h4>
              <p className="text-xs text-text-light/70">
                {filter === 'TODAY'
                  ? 'Play a match today to start your daily session, or check Recent 10 to see your past records!'
                  : 'Start your first match in the Play tab to build your match history and earn CR rating!'}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              {filter === 'TODAY' && matches.length > 0 && (
                <button
                  onClick={() => setFilter('ALL')}
                  className="bg-white/10 hover:bg-white/15 border border-white/15 text-white px-4 py-2 rounded-full text-xs font-bold active:scale-95 transition-all"
                >
                  View Recent ({matches.length})
                </button>
              )}
              <Link
                to="/play"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-[#050a0a] px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-96 transition-transform"
              >
                <PlusCircle className="w-4 h-4" /> Start A Match
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
