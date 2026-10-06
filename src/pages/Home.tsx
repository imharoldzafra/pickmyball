import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import TierEmblem from '../components/TierEmblem';
import BatteryPill from '../components/BatteryPill';
import LivingFlame from '../components/LivingFlame';

const getTierBadgeStyle = (rank: string) => {
  switch (rank.toLowerCase()) {
    case 'legend': return 'text-[#8C3B30] bg-[#F8EFEB] border-[#EACFC9]';
    case 'expert': return 'text-amber-800 bg-amber-50 border-amber-200';
    case 'veteran': return 'text-[#263E50] bg-[#EDF3F7] border-[#C8D6E0]';
    case 'challenger': return 'text-[#244434] bg-[#EBF2EC] border-[#C6D8CB]';
    case 'rookie':
    default: return 'text-[#6B7E72] bg-[#F3F1EB] border-[#E2DDD4]';
  }
};

const getRankBadge = (rank: string) => {
  switch (rank.toLowerCase()) {
    case 'rookie': return { icon: '🌱', label: 'Rookie' };
    case 'challenger': return { icon: '🏓', label: 'Challenger' };
    case 'veteran': return { icon: '🏆', label: 'Veteran' };
    case 'expert': return { icon: '💎', label: 'Expert' };
    case 'legend': return { icon: '👑', label: 'Legend' };
    default: return { icon: '🌱', label: 'Rookie' };
  }
};

export default function Home() {
  const { profile } = useAuth();

  if (!profile) return null;

  const xpRequired = profile.level * 1000;
  const progressPercent = Math.min(100, Math.round((profile.xp / xpRequired) * 100));
  const rankBadge = getRankBadge(profile.rank);

  // 🛡️ Data Integrity Safeguard: A player with 0 victories cannot logically have a streak
  const safeCurrentStreak = profile.wins === 0 ? 0 : (profile.currentStreak || 0);
  const safeLongestStreak = profile.wins === 0 ? 0 : (profile.longestStreak || 0);

  const stats = [
    {
      label: 'Total Matches',
      value: profile.battles,
    },
    {
      label: 'Victories',
      value: profile.wins,
    },
    {
      label: 'Defeats',
      value: profile.losses,
    },
    {
      label: 'Best Streak',
      value: safeLongestStreak,
    }
  ];

  return (
    <div className="px-5 pt-8 pb-8 sm:pt-6 space-y-6 sm:space-y-7">
      {/* Friendly Header Profile Link Wrapper */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <Link to="/profile" className="flex items-center gap-4 group">
          <div className="relative shrink-0">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-2 border-[#244434]/30 overflow-hidden bg-[#EBF2EC] shadow-sm flex items-center justify-center transition-all group-hover:border-[#244434] group-hover:scale-105 duration-300">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-[#3B6B50]" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-[#E2DDD4] shadow-sm">
              <span className="text-[11px] font-black text-white bg-[#244434] px-2 py-0.5 rounded-full leading-tight block">
                Lv.{profile.level}
              </span>
            </div>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#18281E] group-hover:text-[#244434] transition-colors tracking-tight leading-tight">
              {profile.displayName || 'Player'}
            </h2>
            <p className="text-[11px] font-bold text-[#6B7E72] mt-0.5">
              Tap to view profile
            </p>
          </div>
        </Link>

        {/* Unified Animated Battery Pill (Only visible once unlocked at Challenger 800+ CR) */}
        {(profile.rating || 0) >= 800 && (
          <div className="self-center -mt-4 mr-2 shrink-0">
            <Link to="/play" className="active:scale-95 transition-transform block">
              <BatteryPill 
                stamina={profile.stamina} 
                rating={profile.rating} 
              />
            </Link>
          </div>
        )}
      </motion.div>

      {/* Main Glass Rating Card (Court Theme) */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-3xl bg-white border border-[#E2DDD4] px-5 pt-3.5 pb-4.5 sm:px-6 sm:pt-4 sm:pb-5 shadow-[0_4px_20px_rgba(24,40,30,0.06)]"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#EBF2EC] rounded-full blur-3xl pointer-events-none opacity-60" />
        
        <div className="relative z-10 space-y-3">
          {/* Main Stats Row */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#6B7E72] block">
                Competitive Rating (CR)
              </span>
              <span className="text-3xl sm:text-4xl font-black tracking-tight text-[#18281E] block mt-0.5">
                {profile.rating}
              </span>
            </div>

            {/* 🏅 Clean Tier Title above the Animated Emblem */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#6B7E72] mb-1 block">
                {profile.rank}
              </span>
              <TierEmblem rank={profile.rank} size="md" animated={true} />
            </div>
          </div>

          {/* User Level & XP Progress Meter */}
          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-xs font-bold font-mono text-[#6B7E72]">
                Level {profile.level}
              </span>
              <span className="text-[#244434] font-mono font-bold">{profile.xp} / {xpRequired} XP</span>
            </div>
            <div className="h-2.5 w-full bg-[#EBF2EC] rounded-full overflow-hidden p-0.5 border border-[#D1DDD3]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[#244434] to-[#3B6B50] rounded-full"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Overview Stats 2x2 Clean Court Grid */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#6B7E72] px-1">
          Performance Breakdown
        </h3>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {stats.map((stat, idx) => {
            return (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                className="bg-white border border-[#E2DDD4] px-4 py-3 sm:py-3.5 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-[0_2px_10px_rgba(24,40,30,0.04)] min-h-[82px] sm:min-h-[86px]"
              >
                {/* Top: Label */}
                <div className="relative z-10">
                  <span className="text-[10.5px] font-bold text-[#6B7E72] uppercase tracking-wider block leading-tight">
                    {stat.label}
                  </span>
                </div>

                {/* Bottom: Stat Value */}
                <div className="relative z-10 mt-auto pt-1.5">
                  <span className="text-2xl sm:text-2xl font-black tracking-tight text-[#18281E] block leading-none">
                    {stat.value}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Victory Chain Court Card */}
        {(() => {
          const streak = safeCurrentStreak;
          const isGodlike = streak >= 10;
          const isSuperCharged = streak >= 5;

          const getStreakTheme = (count: number) => {
            if (count >= 10) {
              return {
                title: 'GODLIKE',
                textColor: 'text-purple-700 font-black',
                subTextColor: 'text-purple-600 font-bold',
                boxClass: 'border-purple-200 shadow-[0_4px_16px_rgba(147,51,234,0.12)]',
                auraColor: 'from-purple-400/20 via-violet-300/15 to-transparent',
              };
            }
            if (count >= 5) {
              return {
                title: 'ON FIRE',
                textColor: 'text-[#8C3B30]',
                subTextColor: 'text-[#8C3B30] font-bold',
                boxClass: 'border-[#EACFC9] shadow-[0_4px_16px_rgba(140,59,48,0.12)]',
                auraColor: 'from-[#8C3B30]/20 via-[#A14639]/10 to-transparent',
              };
            }
            if (count >= 1) {
              return {
                title: 'Current Win Streak',
                textColor: 'text-[#244434]',
                subTextColor: 'text-[#3B6B50]',
                boxClass: 'border-[#C6D8CB] shadow-sm',
                auraColor: 'from-[#244434]/15 to-transparent',
              };
            }
            // 0 wins (Dormant Clean State)
            return {
              title: 'Current Win Streak',
              textColor: 'text-[#6B7E72]',
              subTextColor: 'text-[#6B7E72]',
              boxClass: 'border-[#E2DDD4] shadow-sm',
              auraColor: '',
            };
          };

          const theme = getStreakTheme(streak);

          const getBarStyle = () => {
            if (isGodlike) {
              return 'bg-gradient-to-t from-purple-700 via-violet-500 to-cyan-400';
            }
            if (isSuperCharged) {
              return 'bg-gradient-to-t from-[#8C3B30] via-[#A14639] to-[#C96859]';
            }
            if (streak >= 1) {
              return 'bg-gradient-to-t from-[#1A3326] via-[#244434] to-[#3B6B50]';
            }
            return 'bg-[#E2DDD4]';
          };

          return (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              className={`bg-white border p-5 rounded-3xl flex items-center justify-between relative overflow-hidden transition-all duration-500 ${theme.boxClass}`}
            >
              {/* Animated Background Aura */}
              {streak > 0 && theme.auraColor && (
                <div 
                  className={`absolute -top-12 -right-10 w-44 h-32 bg-gradient-to-br ${theme.auraColor} rounded-full blur-3xl pointer-events-none`}
                />
              )}

              <div className="relative z-10">
                <div className="flex items-center gap-1.5 mb-1">
                  <LivingFlame streak={streak} size="sm" />
                  <h4 className={`text-xs font-black uppercase tracking-wider ${theme.textColor}`}>
                    {theme.title}
                  </h4>
                  {streak >= 10 ? (
                    <span className="text-[9px] font-black tracking-wider px-1.5 py-0.2 rounded-full bg-purple-50 border border-purple-200 text-purple-700 leading-tight">
                      +20 CR
                    </span>
                  ) : streak >= 5 ? (
                    <span className="text-[9px] font-black tracking-wider px-1.5 py-0.2 rounded-full bg-[#F8EFEB] border border-[#EACFC9] text-[#8C3B30] leading-tight">
                      +15 CR
                    </span>
                  ) : null}
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-[#18281E]">
                    {streak}
                  </span>
                  <span className={`text-xs font-bold ${theme.subTextColor}`}>
                    Wins in a row
                  </span>
                </div>
              </div>

              {/* 5-Bar Indicator Display */}
              <div className="flex items-center gap-1.5 h-9 relative z-10">
                {[...Array(5)].map((_, i) => {
                  const isActive = isSuperCharged || i < streak;

                  return (
                    <div 
                      key={i} 
                      className={`w-3 h-6 rounded-full transition-all duration-300 ${
                        isActive 
                          ? getBarStyle() 
                          : 'bg-[#EDEAE3] border border-[#E2DDD4]'
                      }`}
                    />
                  );
                })}
              </div>
            </motion.div>
          );
        })()}
      </div>
    </div>
  );
}
