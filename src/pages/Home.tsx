import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Flame, Trophy, Zap, Activity, Sparkles, TrendingUp, TrendingDown, ChevronRight, Infinity as InfinityIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import TierEmblem from '../components/TierEmblem';
import BatteryPill from '../components/BatteryPill';
import LivingFlame from '../components/LivingFlame';

const getTierBadgeStyle = (rank: string) => {
  switch (rank.toLowerCase()) {
    case 'legend': return 'text-orange-300 bg-orange-500/20 border-orange-500/40';
    case 'expert': return 'text-amber-300 bg-amber-400/20 border-amber-400/40';
    case 'veteran': return 'text-cyan-300 bg-cyan-500/20 border-cyan-400/40';
    case 'challenger': return 'text-emerald-300 bg-emerald-500/20 border-emerald-400/35';
    case 'rookie':
    default: return 'text-slate-300 bg-slate-500/20 border-slate-500/30';
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
      orbColor: 'bg-white/5',
    },
    {
      label: 'Victories',
      value: profile.wins,
      orbColor: 'bg-white/5',
    },
    {
      label: 'Defeats',
      value: profile.losses,
      orbColor: 'bg-white/5',
    },
    {
      label: 'Best Streak',
      value: safeLongestStreak,
      orbColor: 'bg-white/5',
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
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-2 border-primary/60 overflow-hidden bg-white/[0.03] shadow-md flex items-center justify-center transition-all group-hover:border-primary group-hover:scale-105 duration-300">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-text-light/70" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#040709] rounded-full p-0.5 border border-primary/40 shadow-lg">
              <span className="text-[11px] font-black text-slate-950 bg-primary px-2 py-0.5 rounded-full leading-tight block">
                Lv.{profile.level}
              </span>
            </div>
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-primary transition-colors tracking-tight leading-tight">
              {profile.displayName || 'Player'}
            </h2>
            <p className="text-[11px] font-bold text-text-light/60 mt-0.5">
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

      {/* Main Glass Rating Card (Option A: Balanced Battle Card) */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-3xl bg-white/[0.03] backdrop-blur-2xl border-t border-t-white/20 border-x border-x-white/10 border-b border-b-white/5 px-5 pt-3.5 pb-4.5 sm:px-6 sm:pt-4 sm:pb-5 shadow-[0_12px_40px_0_rgba(0,0,0,0.4)]"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-3">
          {/* Main Stats Row: Big Rating Number on Left, Tier Badge + Animated Emblem on Right */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-text-light/60 block">
                Competitive Rating (CR)
              </span>
              <span className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md block mt-0.5">
                {profile.rating}
              </span>
            </div>

            {/* 🏅 Clean Tier Title (No Box) above the Animated Emblem */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-light/60 mb-1 block">
                {profile.rank}
              </span>
              <TierEmblem rank={profile.rank} size="md" animated={true} />
            </div>
          </div>

          {/* User Level & XP Progress Meter */}
          <div className="space-y-2 pt-1">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-xs font-bold font-mono text-text-light">
                {profile.level}
              </span>
              <span className="text-primary font-mono font-bold">{profile.xp} / {xpRequired} XP</span>
            </div>
            <div className="h-2.5 w-full bg-black/40 backdrop-blur-md rounded-full overflow-hidden p-0.5 border border-white/10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Overview Stats 2x2 Glass Grid */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-text-light px-1">
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
                className="bg-white/[0.03] backdrop-blur-md border-t border-t-white/20 border-x border-x-white/10 border-b border-b-white/5 px-4 py-3 sm:py-3.5 rounded-2xl flex flex-col justify-between relative overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.25)] min-h-[82px] sm:min-h-[86px]"
              >
                {/* Background Ambient Glow Orb */}
                <div className={`absolute -top-6 -right-6 w-20 h-20 ${stat.orbColor} rounded-full blur-xl pointer-events-none opacity-25`} />

                {/* Top: Label */}
                <div className="relative z-10">
                  <span className="text-[10.5px] font-bold text-text-light/60 uppercase tracking-wider block leading-tight">
                    {stat.label}
                  </span>
                </div>

                {/* Bottom: Stat Value */}
                <div className="relative z-10 mt-auto pt-1.5">
                  <span className="text-2xl sm:text-2xl font-black tracking-tight text-white drop-shadow-md block leading-none">
                    {stat.value}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Victory Chain Glass Box with Progressive Thermal Heat */}
        {(() => {
          const streak = safeCurrentStreak;
          const isGodlike = streak >= 10;
          const isSuperCharged = streak >= 5;

          // Distinct Progressive Theme Configuration (0 to 10+ Secret Tier)
          const getStreakTheme = (count: number) => {
            if (count >= 10) {
              return {
                title: 'GODLIKE',
                flameClass: 'text-purple-400 fill-purple-400',
                textColor: 'text-purple-300 font-black',
                subTextColor: 'text-purple-300 font-bold',
                boxClass: 'bg-purple-600/[0.09] border-t-purple-400/60 border-x-purple-500/30 border-b-purple-500/10 shadow-lg',
                auraColor: 'from-purple-600 via-violet-500 to-cyan-400',
              };
            }
            if (count >= 5) {
              return {
                title: 'ON FIRE',
                flameClass: 'text-orange-400 fill-orange-500',
                textColor: 'text-orange-400',
                subTextColor: 'text-orange-300 font-bold',
                boxClass: 'bg-orange-500/[0.08] border-t-orange-400/50 border-x-orange-500/25 border-b-orange-500/10 shadow-lg',
                auraColor: 'from-red-600 via-orange-500 to-amber-400',
              };
            }
            if (count === 4) {
              return {
                title: 'Heating Up',
                flameClass: 'text-orange-500 fill-orange-500/80',
                textColor: 'text-orange-400',
                subTextColor: 'text-orange-300',
                boxClass: 'bg-orange-500/[0.05] border-t-orange-500/40 border-x-orange-500/20 border-b-white/5 shadow-md',
                auraColor: 'from-orange-600 to-amber-500',
              };
            }
            if (count === 3) {
              return {
                title: 'Current Win Streak',
                flameClass: 'text-amber-400 fill-amber-400/70',
                textColor: 'text-amber-400',
                subTextColor: 'text-amber-300',
                boxClass: 'bg-amber-500/[0.05] border-t-amber-400/40 border-x-amber-500/20 border-b-white/5 shadow-md',
                auraColor: 'from-amber-500 to-yellow-400',
              };
            }
            if (count === 2) {
              return {
                title: 'Current Win Streak',
                flameClass: 'text-cyan-400 fill-cyan-400/60',
                textColor: 'text-cyan-300',
                subTextColor: 'text-cyan-400',
                boxClass: 'bg-cyan-500/[0.04] border-t-cyan-400/35 border-x-cyan-500/15 border-b-white/5 shadow-md',
                auraColor: 'from-cyan-500 to-teal-400',
              };
            }
            if (count === 1) {
              return {
                title: 'Current Win Streak',
                flameClass: 'text-emerald-400 fill-emerald-400/50',
                textColor: 'text-text-light',
                subTextColor: 'text-emerald-400',
                boxClass: 'bg-white/[0.03] border-t-emerald-400/30 border-x-emerald-500/15 border-b-white/5 shadow-md',
                auraColor: 'from-emerald-500 to-teal-400',
              };
            }
            // 0 wins (Dormant Clean State - No green glow)
            return {
              title: 'Current Win Streak',
              flameClass: 'text-text-light/40 fill-none',
              textColor: 'text-text-light/70',
              subTextColor: 'text-text-light/50',
              boxClass: 'bg-white/[0.03] border-t-white/15 border-x-white/10 border-b-white/5 shadow-[0_6px_20px_rgba(0,0,0,0.25)]',
              auraColor: '',
            };
          };

          const theme = getStreakTheme(streak);

          // Distinct Bar Style for each thermal stage
          const getBarStyle = () => {
            if (isGodlike) {
              return 'bg-gradient-to-t from-purple-700 via-violet-500 to-cyan-300 border border-cyan-300/80';
            }
            if (isSuperCharged) {
              return 'bg-gradient-to-t from-red-600 via-orange-500 to-amber-300 border border-orange-400/70';
            }
            if (streak === 4) {
              return 'bg-gradient-to-t from-orange-600 via-orange-500 to-amber-300 border border-orange-400/60';
            }
            if (streak === 3) {
              return 'bg-gradient-to-t from-amber-600 via-yellow-400 to-yellow-200 border border-amber-400/60';
            }
            if (streak === 2) {
              return 'bg-gradient-to-t from-cyan-600 via-cyan-400 to-teal-200 border border-cyan-400/50';
            }
            return 'bg-gradient-to-t from-emerald-600 via-teal-400 to-emerald-200 border border-emerald-400/50';
          };

          return (
            <motion.div 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                className={`backdrop-blur-md p-5 rounded-3xl border-t border-x border-b flex items-center justify-between relative overflow-hidden transition-all duration-500 ${theme.boxClass}`}
              >
              {/* Animated Background Aura (Only when streak > 0) */}
              {streak > 0 && theme.auraColor && (
                <motion.div 
                  animate={{ 
                    scale: isGodlike ? [1, 1.4, 1] : isSuperCharged ? [1, 1.35, 1] : [1, 1.2, 1],
                    opacity: isGodlike ? [0.35, 0.6, 0.35] : isSuperCharged ? [0.25, 0.5, 0.25] : [0.12, 0.25, 0.12]
                  }}
                  transition={{ 
                    duration: isGodlike ? 1.6 : isSuperCharged ? 2 : 3, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className={`absolute -top-12 -right-10 w-44 h-32 bg-gradient-to-br ${theme.auraColor} rounded-full blur-3xl pointer-events-none`}
                />
              )}

              {/* ✨ Ambient Living Fire / Cosmic Stardust Particles (Drifting upward inside the card on 5+ streaks) */}
              {streak >= 5 && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                  {(isGodlike
                    ? Array.from({ length: 54 }, (_, i) => ({
                        left: `${(i * 1.78 + 2).toFixed(1)}%`,
                        duration: 1.8 + (i % 6) * 0.25,
                        delay: (i * 0.05) % 2.2,
                        xSway: [
                          (i % 2 === 0 ? -1 : 1) * (2 + (i % 3)),
                          (i % 2 === 0 ? 1 : -1) * (2 + ((i + 1) % 3)),
                          (i % 2 === 0 ? -1 : 1) * (1 + (i % 2)),
                        ],
                        size: i % 4 === 0 ? 'w-[0.75px] h-[0.75px]' : i % 4 === 1 ? 'w-[1px] h-[1px]' : i % 4 === 2 ? 'w-[1.2px] h-[1.2px]' : 'w-[0.85px] h-[0.85px]',
                      }))
                    : [
                        { left: '6%', duration: 2.6, delay: 0, xSway: [-3, 4, -2], size: 'w-[1px] h-[1px]' },
                        { left: '13%', duration: 3.2, delay: 1.1, xSway: [3, -4, 2], size: 'w-[1.5px] h-[1.5px]' },
                        { left: '20%', duration: 2.8, delay: 0.5, xSway: [-4, 3, -3], size: 'w-[1px] h-[1px]' },
                        { left: '27%', duration: 3.4, delay: 1.8, xSway: [4, -3, 2], size: 'w-[1.5px] h-[1.5px]' },
                        { left: '34%', duration: 2.7, delay: 0.8, xSway: [-3, 5, -2], size: 'w-[1px] h-[1px]' },
                        { left: '42%', duration: 3.1, delay: 1.5, xSway: [5, -4, 3], size: 'w-[1.5px] h-[1.5px]' },
                        { left: '50%', duration: 2.6, delay: 0.3, xSway: [-4, 4, -3], size: 'w-[1px] h-[1px]' },
                        { left: '58%', duration: 3.5, delay: 2.0, xSway: [3, -5, 2], size: 'w-[1.5px] h-[1.5px]' },
                        { left: '66%', duration: 2.9, delay: 0.9, xSway: [-5, 3, -2], size: 'w-[1px] h-[1px]' },
                        { left: '74%', duration: 3.3, delay: 1.7, xSway: [4, -4, 3], size: 'w-[1.5px] h-[1.5px]' },
                        { left: '82%', duration: 2.7, delay: 0.6, xSway: [-3, 5, -3], size: 'w-[1px] h-[1px]' },
                        { left: '90%', duration: 3.2, delay: 1.4, xSway: [4, -3, 2], size: 'w-[1.5px] h-[1.5px]' },
                        { left: '96%', duration: 2.8, delay: 0.2, xSway: [-3, 4, -2], size: 'w-[1px] h-[1px]' },
                      ]
                  ).map((ember, i) => (
                    <motion.div
                      key={i}
                      style={{ left: ember.left }}
                      initial={{ y: 0, opacity: 0, scale: 0.3 }}
                      animate={{
                        y: [0, isGodlike ? -64 : -54],
                        x: [0, ember.xSway[0], ember.xSway[1], ember.xSway[2], 0],
                        opacity: isGodlike ? [0, 0.95, 0.45, 0.95, 0.35, 0] : [0, 0.95, 0.95, 0.6, 0],
                        scale: isGodlike ? [0.3, 1.1, 0.7, 1.0, 0] : [0.4, 1.2, 1.0, 0.7, 0],
                      }}
                      transition={{
                        duration: ember.duration,
                        repeat: Infinity,
                        delay: ember.delay,
                        ease: "easeOut",
                      }}
                      className={`absolute bottom-0 rounded-full ${ember.size} ${
                        isGodlike
                          ? i % 3 === 0
                            ? 'bg-cyan-300'
                            : i % 3 === 1
                              ? 'bg-purple-300'
                              : 'bg-white'
                          : i % 2 === 0
                            ? 'bg-amber-200'
                            : 'bg-orange-400'
                      }`}
                    />
                  ))}
                </div>
              )}

              <div className="relative z-10">
                <div className="flex items-center gap-1.5 mb-1">
                  {/* Living Organic Multi-Layer Flame with Floating Sparks */}
                  <LivingFlame streak={streak} size="sm" />
                  <h4 className={`text-xs font-black uppercase tracking-wider ${theme.textColor}`}>
                    {theme.title}
                  </h4>
                  {streak >= 10 ? (
                    <span className="text-[9px] font-black tracking-wider px-1.5 py-0.2 rounded-full bg-purple-500/25 border border-purple-400/40 text-purple-200 leading-tight">
                      +20 CR
                    </span>
                  ) : streak >= 5 ? (
                    <span className="text-[9px] font-black tracking-wider px-1.5 py-0.2 rounded-full bg-orange-500/25 border border-orange-400/40 text-orange-200 leading-tight">
                      +15 CR
                    </span>
                  ) : null}
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-white">
                    {streak}
                  </span>
                  <span className={`text-xs font-bold ${theme.subTextColor}`}>
                    Wins in a row
                  </span>
                </div>
              </div>

              {/* 5-Bar Equalizer Display (Active across all streaks, with Godlike Cosmic Overdrive on 10+) */}
              <div className="flex items-center gap-1.5 h-9 relative z-10">
                {(() => {
                  const isAnimated = streak >= 4;

                  // Fluid Equalizer Bar Profiles via GPU-accelerated scaleY (120 FPS buttery smooth):
                  const getBassProfile = (barIndex: number) => {
                    if (isGodlike) {
                      // ⚡ STAGE 10+ (GODLIKE COSMIC HARMONIC OVERDRIVE):
                      // Ultra-smooth, higher peak harmonic wave with laser-smooth flow
                      const scales = [
                        [0.55, 1.38, 0.75, 1.28, 0.55],
                        [0.75, 1.28, 0.55, 1.42, 0.75],
                        [0.55, 1.42, 0.85, 1.22, 0.55],
                        [0.85, 1.22, 0.55, 1.36, 0.85],
                        [0.55, 1.32, 0.80, 1.40, 0.55],
                      ];
                      return {
                        duration: 0.68 + (barIndex % 2) * 0.06,
                        scaleY: scales[barIndex % scales.length],
                        opacity: [0.92, 1, 0.95, 1, 0.92],
                        delay: barIndex * 0.06,
                      };
                    }

                    if (isSuperCharged) {
                      // 🔥 STAGE 5-9 (MOLTEN FIRE CHILL BASS WAVE): 0.78s rapid GPU vertical dance
                      const scales = [
                        [0.62, 1.22, 0.75, 1.15, 0.62],
                        [0.75, 1.15, 0.62, 1.25, 0.75],
                        [0.62, 1.25, 0.82, 1.10, 0.62],
                        [0.82, 1.10, 0.62, 1.20, 0.82],
                        [0.62, 1.18, 0.78, 1.22, 0.62],
                      ];
                      return {
                        duration: 0.78 + (barIndex % 2) * 0.08,
                        scaleY: scales[barIndex % scales.length],
                        opacity: [0.85, 1, 0.9, 1, 0.85],
                        delay: barIndex * 0.08,
                      };
                    }

                    if (streak === 4) {
                      // 🟠 STAGE 4 (WARM CONTROLLED WAVE): 1.5s smooth GPU wave
                      const scales = [
                        [0.65, 1.12, 0.78, 1.05, 0.65],
                        [0.78, 1.05, 0.65, 1.15, 0.78],
                        [0.65, 1.18, 0.72, 1.02, 0.65],
                        [0.82, 1.02, 0.65, 1.12, 0.82],
                        [0.65, 1.08, 0.78, 1.08, 0.65],
                      ];
                      return {
                        duration: 1.5 + (barIndex % 2) * 0.1,
                        scaleY: scales[barIndex % scales.length],
                        opacity: [0.8, 1, 0.85, 1, 0.8],
                        delay: barIndex * 0.1,
                      };
                    }

                    // 🟡 STAGE 3 (CHILL LO-FI RELAXED WAVE): 2.2s liquid-smooth gentle wave
                    const scales = [
                      [0.68, 1.05, 0.80, 0.98, 0.68],
                      [0.80, 0.98, 0.68, 1.08, 0.80],
                      [0.68, 1.10, 0.82, 0.95, 0.68],
                      [0.75, 0.95, 0.68, 1.05, 0.75],
                      [0.68, 1.02, 0.80, 1.02, 0.68],
                    ];
                    return {
                      duration: 2.2 + (barIndex % 3) * 0.15,
                      scaleY: scales[barIndex % scales.length],
                      opacity: [0.78, 1, 0.85, 1, 0.78],
                      delay: barIndex * 0.12,
                    };
                  };

                  return [...Array(5)].map((_, i) => {
                    const isActive = isSuperCharged || i < streak;
                    const anim = getBassProfile(i);

                    // At Stage 0, 1, 2, and 3: Steady / Still vertical bars (laser-aligned at h-6)
                    if (!isAnimated) {
                      return (
                        <div 
                          key={i} 
                          className={`w-3 h-6 rounded-full transition-all duration-300 ${
                            isActive 
                              ? getBarStyle() 
                              : 'bg-white/10 border border-white/5 opacity-20'
                          }`}
                        />
                      );
                    }

                    // At Stage 4+: Inactive bars remain steady and centered at h-6
                    if (!isActive) {
                      return (
                        <div 
                          key={i} 
                          className="w-3 h-6 rounded-full bg-white/10 border border-white/5 opacity-20 transition-all"
                        />
                      );
                    }

                    // Active animated bars: Pulse symmetrically from the exact center axis
                    return (
                      <motion.div 
                        key={i} 
                        animate={{
                          scaleY: anim.scaleY,
                          opacity: anim.opacity,
                        }}
                        transition={{
                          duration: anim.duration,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: anim.delay,
                        }}
                        className={`w-3 h-6 rounded-full transition-colors duration-300 relative overflow-hidden ${getBarStyle()}`}
                        style={{
                          transformOrigin: "center center",
                          willChange: "transform",
                        }}
                      >
                        {isGodlike && (
                          <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-200 rounded-full" />
                        )}
                      </motion.div>
                    );
                  });
                })()}
              </div>
            </motion.div>
        );
      })()}
      </div>
    </div>
  );
}
