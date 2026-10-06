import React, { useState, useEffect } from 'react';
import { Calendar, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    {/* Paddle 1 */}
    <g transform="rotate(45 12 12)">
      <rect x="7" y="1" width="10" height="11" rx="3.5" />
      <path d="M12 12v9" strokeWidth="2.5" />
      <path d="M10 21h4" strokeWidth="2.5" />
    </g>
    {/* Paddle 2 */}
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
        <h1 className="text-2xl font-black tracking-tight text-[#18281E]">Match History</h1>
        <p className="text-xs text-[#6B7E72] font-medium">Review your performance statistics and past matches.</p>
      </motion.div>

      {/* Pinned Stats Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="flex-shrink-0 bg-white border border-[#E2DDD4] py-4 px-2 rounded-3xl shadow-[0_4px_20px_rgba(24,40,30,0.06)] grid grid-cols-3 items-center text-center"
      >
        <div className="flex flex-col items-center justify-center px-1">
          <span className="block text-[10px] font-bold text-[#6B7E72] uppercase tracking-wider mb-1">
            Win Rate
          </span>
          <span className="text-lg font-black text-[#18281E] block">
            {winRate}%
          </span>
        </div>
        <div className="flex flex-col items-center justify-center border-x border-[#E2DDD4] px-1 py-0.5">
          <span className="block text-[10px] font-bold text-[#6B7E72] uppercase tracking-wider mb-1">Total XP</span>
          <span className="text-lg font-black text-[#18281E] block">
            {totalXp} XP
          </span>
        </div>
        <div className="flex flex-col items-center justify-center px-1">
          <span className="block text-[10px] font-bold text-[#6B7E72] uppercase tracking-wider mb-1">Current CR</span>
          <span className="text-lg font-black text-[#18281E] block">
            {netCr}
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
        {/* Controls: Segmented Filter */}
        <div className="flex items-center mb-2.5 flex-shrink-0">
          <div className="flex items-center bg-[#EBF2EC] p-1 rounded-2xl border border-[#D1DDD3] shadow-inner relative">
            <button
              type="button"
              onClick={() => setFilter('TODAY')}
              className={`relative px-4 py-1.5 rounded-xl text-xs font-bold transition-colors duration-200 active:scale-95 z-10 select-none ${
                filter === 'TODAY' ? 'text-white font-black' : 'text-[#6B7E72] hover:text-[#18281E]'
              }`}
            >
              {filter === 'TODAY' && (
                <motion.div
                  layoutId="activeHistoryFilter"
                  className="absolute inset-0 bg-[#244434] rounded-xl shadow-sm -z-10"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              Today
            </button>
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`relative px-4 py-1.5 rounded-xl text-xs font-bold transition-colors duration-200 active:scale-95 z-10 select-none ${
                filter === 'ALL' ? 'text-white font-black' : 'text-[#6B7E72] hover:text-[#18281E]'
              }`}
            >
              {filter === 'ALL' && (
                <motion.div
                  layoutId="activeHistoryFilter"
                  className="absolute inset-0 bg-[#244434] rounded-xl shadow-sm -z-10"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              Recent
            </button>
          </div>
        </div>

        {/* Scrollable list or Empty State */}
        <AnimatePresence mode="wait">
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="flex-1 min-h-0 flex flex-col"
          >
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
                    className="bg-white border border-[#E2DDD4] p-4.5 rounded-3xl flex justify-between items-center relative overflow-hidden shadow-[0_2px_12px_rgba(24,40,30,0.04)]"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold font-mono bg-[#F8F7F3] text-[#6B7E72] px-2 py-0.5 rounded-md border border-[#E2DDD4]">{match.id}</span>
                        <span className="text-[11px] text-[#6B7E72] flex items-center gap-1 font-medium">
                          <Calendar className="w-3 h-3 text-[#6B7E72]" /> {match.date}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-[#18281E]">
                          {match.result === 'REFEREED' ? match.opponent : `vs ${match.opponent}`}
                        </h4>
                        <p className="text-[11px] text-[#6B7E72] font-semibold mt-0.5">
                          {match.result === 'REFEREED' ? `Court Refereed • Score: ${match.score}` : `${match.type} • Score: ${match.score}`}
                        </p>
                      </div>
                    </div>

                    <div className="text-right space-y-1.5 flex-shrink-0 pl-3">
                      <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        match.result === 'REFEREED'
                          ? 'bg-[#EDF3F7] text-[#263E50] border border-[#C8D6E0]'
                          : match.result === 'WON'
                            ? 'bg-[#EBF2EC] text-[#244434] border border-[#C6D8CB]'
                            : 'bg-[#F8EFEB] text-[#8C3B30] border border-[#EACFC9]'
                        }`}>
                        {match.result === 'REFEREED' ? 'REFEREED 🛡️' : match.result}
                      </span>
                      <div className="text-[10px] font-bold space-y-0.5">
                        <p className="text-[#244434] font-mono">{match.xpEarned}</p>
                        <p className={match.crChange.startsWith('+') ? 'text-[#263E50] font-mono font-bold' : 'text-[#8C3B30] font-mono font-bold'}>
                          {match.crChange}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white rounded-3xl border border-[#E2DDD4] shadow-[0_4px_20px_rgba(24,40,30,0.04)] space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#EBF2EC] border border-[#D1DDD3] flex items-center justify-center text-[#244434] shadow-sm">
                  <CrossedPaddles className="w-8 h-8" />
                </div>
                <div className="space-y-1 max-w-xs">
                  <h4 className="text-base font-black text-[#18281E]">
                    {filter === 'TODAY' ? 'No matches played today' : 'No matches played yet'}
                  </h4>
                  <p className="text-xs text-[#6B7E72] leading-relaxed">
                    {filter === 'TODAY'
                      ? 'Play a match today to start your daily session, or check Recent to see your past records!'
                      : 'Start your first match in the Play tab to build your match history and earn CR rating!'}
                  </p>
                </div>
                {filter === 'TODAY' && (
                  <div className="flex items-center gap-2.5">
                    {matches.length > 0 && (
                      <button
                        onClick={() => setFilter('ALL')}
                        className="bg-[#F8F7F3] hover:bg-[#EAE6DE] border border-[#E2DDD4] text-[#18281E] px-4 py-2 rounded-full text-xs font-bold active:scale-95 transition-all"
                      >
                        View Recent ({matches.length})
                      </button>
                    )}
                    <Link
                      to="/play"
                      className="inline-flex items-center gap-2 bg-[#244434] hover:bg-[#1A3326] text-white px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm active:scale-96 transition-transform"
                    >
                      <PlusCircle className="w-4 h-4" /> Start A Match
                    </Link>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
