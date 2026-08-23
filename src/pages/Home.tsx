import React from 'react';
import { Link } from 'react-router-dom';
import { User, Flame, Trophy, Swords, Zap, Activity, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

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

  const winRate = profile.battles > 0 ? Math.round((profile.wins / profile.battles) * 100) : 0;
  const lossRate = profile.battles > 0 ? Math.round((profile.losses / profile.battles) * 100) : 0;

  const stats = [
    {
      label: 'Total Matches',
      value: profile.battles,
      icon: Activity,
      tag: 'Recorded',
      accentColor: 'text-sky-400',
      glowBg: 'bg-sky-500/15',
      glowBorder: 'border-sky-500/30',
      glowShadow: 'shadow-[0_0_20px_rgba(56,189,248,0.2)]',
      orbColor: 'bg-sky-500/20',
      badgeBg: 'bg-sky-500/10 text-sky-300 border-sky-500/20'
    },
    {
      label: 'Victories',
      value: profile.wins,
      icon: Trophy,
      tag: `${winRate}% Win Rate`,
      accentColor: 'text-emerald-400',
      glowBg: 'bg-emerald-500/15',
      glowBorder: 'border-emerald-500/30',
      glowShadow: 'shadow-[0_0_20px_rgba(16,185,129,0.25)]',
      orbColor: 'bg-emerald-500/20',
      badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
      badgeIcon: TrendingUp
    },
    {
      label: 'Defeats',
      value: profile.losses,
      icon: ShieldAlert,
      tag: `${lossRate}% Loss Rate`,
      accentColor: 'text-amber-400',
      glowBg: 'bg-amber-500/15',
      glowBorder: 'border-amber-500/30',
      glowShadow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]',
      orbColor: 'bg-amber-500/20',
      badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/20'
    },
    {
      label: 'Best Streak',
      value: profile.longestStreak,
      icon: Sparkles,
      tag: 'Peak Record',
      accentColor: 'text-purple-400',
      glowBg: 'bg-purple-500/15',
      glowBorder: 'border-purple-500/30',
      glowShadow: 'shadow-[0_0_20px_rgba(168,85,247,0.25)]',
      orbColor: 'bg-purple-500/20',
      badgeBg: 'bg-purple-500/10 text-purple-300 border-purple-500/20'
    }
  ];

  return (
    <div className="p-5 space-y-6">
      {/* Friendly Header Profile Link Wrapper */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex justify-between items-center px-1"
      >
        <Link to="/profile" className="flex items-center gap-4 active:scale-98 transition-transform">
          <div className="relative">
            <div className="w-18 h-18 rounded-full bg-primary/10 border-2 border-primary/40 overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-9 h-9 text-primary" />
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-1 bg-primary text-[#050a0a] text-[10px] font-black px-2 py-0.5 rounded-full shadow-md">
              Lv.{profile.level}
            </div>
          </div>
          <div>
            <p className="text-2xl font-black tracking-tight text-white">{profile.displayName}</p>
          </div>
        </Link>
      </motion.div>

      {/* Main Competitive Standing Glass Hero Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false }}
        transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
        className="bg-white/[0.03] backdrop-blur-md rounded-3xl p-6 relative overflow-hidden border-t border-t-white/25 border-x border-x-white/10 border-b border-b-white/5 shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
      >
        <div className="relative z-10 space-y-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Trophy className="w-4.5 h-4.5 text-primary" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-light">Competitive Rank</h2>
            </div>
            
            <div className="flex items-center gap-1.5 bg-primary/15 border border-primary/40 backdrop-blur-md px-3.5 py-1.5 rounded-full text-primary shadow-inner">
              <span className="text-sm">{rankBadge.icon}</span>
              <span className="text-xs font-extrabold uppercase tracking-wider">{rankBadge.label}</span>
            </div>
          </div>

          <div className="flex items-baseline gap-2.5">
            <span className="text-5xl font-black tracking-tight text-white drop-shadow-md">{profile.rating}</span>
            <span className="text-sm font-bold text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-0.5 rounded-md border border-primary/20">CR Score</span>
          </div>

          {/* XP Progress Meter */}
          <div className="space-y-2 pt-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-text-light flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-primary" /> XP Progress</span>
              <span className="text-primary font-mono font-bold">{profile.xp} / {xpRequired} XP</span>
            </div>
            <div className="h-2.5 w-full bg-black/40 backdrop-blur-md rounded-full overflow-hidden p-0.5 border border-white/10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.7)]"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Overview Stats 2x2 Glass Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-text-light px-1 flex items-center gap-1.5">
          <Swords className="w-3.5 h-3.5 text-primary" /> Performance Breakdown
        </h3>

        <div className="grid grid-cols-2 gap-3.5">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            const BadgeIcon = stat.badgeIcon;
            return (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                className="bg-white/[0.03] backdrop-blur-md border-t border-t-white/20 border-x border-x-white/10 border-b border-b-white/5 p-4 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-[0_8px_25px_rgba(0,0,0,0.3)]"
              >
                {/* Background Ambient Glow Orb */}
                <div className={`absolute -top-6 -right-6 w-20 h-20 ${stat.orbColor} rounded-full blur-xl pointer-events-none opacity-60`} />

                {/* Top Row: Label & Glowing Icon Badge */}
                <div className="flex items-center justify-between relative z-10">
                  <span className="text-[11px] font-bold text-text-light uppercase tracking-wider">{stat.label}</span>
                  <div className={`w-7 h-7 rounded-lg ${stat.glowBg} border ${stat.glowBorder} ${stat.glowShadow} flex items-center justify-center`}>
                    <Icon className={`w-3.5 h-3.5 ${stat.accentColor}`} />
                  </div>
                </div>

                {/* Middle Row: Large Stat Value */}
                <div className="my-2 relative z-10">
                  <span className={`text-3xl font-black tracking-tight ${stat.accentColor} drop-shadow-md`}>
                    {stat.value}
                  </span>
                </div>

                {/* Bottom Row: Micro Metric / Tag Pill */}
                <div className="relative z-10 flex items-center">
                  <div className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${stat.badgeBg}`}>
                    {BadgeIcon && <BadgeIcon className="w-2.5 h-2.5" />}
                    <span>{stat.tag}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Victory Chain Glass Box */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          className={profile.currentStreak >= 5 
            ? "bg-orange-500/[0.07] backdrop-blur-md p-5 rounded-3xl border-t border-t-orange-400/40 border-x border-x-orange-500/25 border-b border-b-orange-500/10 flex items-center justify-between shadow-[0_0_30px_rgba(239,68,68,0.25)] relative overflow-hidden"
            : "bg-white/[0.03] backdrop-blur-md p-5 rounded-3xl border-t border-t-emerald-400/30 border-x border-x-emerald-500/15 border-b border-b-white/5 flex items-center justify-between shadow-[0_10px_35px_rgba(0,0,0,0.35)] relative overflow-hidden"
          }
        >
          {/* Animated Background Energy Aura */}
          {profile.currentStreak >= 5 ? (
            <motion.div 
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.25, 0.45, 0.25]
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute -top-12 -right-10 w-44 h-32 bg-gradient-to-br from-orange-500 to-red-600 rounded-full blur-3xl pointer-events-none"
            />
          ) : (
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.15, 0.3, 0.15]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute -top-12 -right-10 w-36 h-28 bg-emerald-500 rounded-full blur-3xl pointer-events-none"
            />
          )}

          <div className="relative z-10">
            {profile.currentStreak >= 5 ? (
              <div className="flex items-center gap-1.5 mb-1">
                {/* 🔥 Flame icon only animates/moves when on 5+ streak */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.25, 1], 
                    rotate: [-5, 5, -5] 
                  }}
                  transition={{ 
                    duration: 0.8, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                >
                  <Flame className="w-4 h-4 text-orange-400 fill-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                </motion.div>
                <h4 className="text-xs font-black uppercase tracking-wider text-orange-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.6)]">
                  ON FIRE (1.5x XP Boost)
                </h4>
              </div>
            ) : (
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-light flex items-center gap-1.5 mb-1">
                {/* Static flame icon when below 5 streak */}
                <Flame className="w-4 h-4 text-emerald-400" /> Current Win Streak
              </h4>
            )}
            <div className="flex items-baseline gap-1.5">
               {/* Displays the dynamic real number beyond 5 (e.g. 6, 7, 8, 12, etc.) */}
               <span className={profile.currentStreak >= 5 ? "text-3xl font-black text-white drop-shadow-[0_0_12px_rgba(249,115,22,0.8)]" : "text-3xl font-extrabold text-white"}>
                 {profile.currentStreak}
               </span>
               <span className={profile.currentStreak >= 5 ? "text-xs font-black text-orange-300" : "text-xs font-bold text-emerald-400"}>
                 Wins in a row
               </span>
            </div>
          </div>

          {/* Living Flame / Equalizer Animated Bars with Progressive Speed */}
          <div className="flex items-center gap-1.5 relative z-10 py-1">
            {(() => {
              // Speed scales dynamically with streak: 1 win = 2.5s (slow), 5+ wins = 0.7s (fast)
              const streakLevel = Math.min(5, Math.max(1, profile.currentStreak));
              const baseDuration = Math.max(0.7, 2.5 - (streakLevel - 1) * 0.45);

              return [...Array(5)].map((_, i) => {
                const isActive = profile.currentStreak >= 5 || i < profile.currentStreak;
                const isSuperCharged = profile.currentStreak >= 5;

                return (
                  <motion.div 
                    key={i} 
                    initial={{ scaleY: 0.8 }}
                    animate={
                      isSuperCharged 
                        ? {
                            scaleY: [0.75, 1.3, 0.85, 1.25, 0.75],
                            opacity: [0.8, 1, 0.85, 1, 0.8]
                          }
                        : isActive
                          ? {
                              scaleY: [0.85, 1.18, 0.9, 1.15, 0.85],
                              opacity: [0.75, 1, 0.8, 1, 0.75]
                            }
                          : { scaleY: 1, opacity: 0.2 }
                    }
                    transition={
                      isActive
                        ? {
                            duration: baseDuration + (i % 2) * (baseDuration * 0.15),
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * (baseDuration * 0.14)
                          }
                        : { duration: 0.2 }
                    }
                    className={`w-3 rounded-full origin-bottom ${
                      isSuperCharged
                        ? 'h-8 bg-gradient-to-t from-red-600 via-orange-500 to-amber-300 shadow-[0_0_15px_rgba(249,115,22,0.9)] border border-orange-400/50'
                        : isActive 
                          ? 'h-7 bg-gradient-to-t from-emerald-600 to-teal-300 shadow-[0_0_12px_rgba(16,185,129,0.8)] border border-emerald-400/40' 
                          : 'h-6 bg-white/10 border border-white/5'
                    }`}
                  />
                );
              });
            })()}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
