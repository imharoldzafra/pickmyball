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

        {/* Victory Chain Glass Box with Progressive Thermal Heat */}
        {(() => {
          const streak = profile.currentStreak;
          const isSuperCharged = streak >= 5;

          // Distinct 5-Stage Progressive Theme Configuration
          const getStreakTheme = (count: number) => {
            if (count >= 5) {
              return {
                title: 'ON FIRE (1.5x XP Boost)',
                flameClass: 'text-orange-400 fill-orange-500 drop-shadow-[0_0_14px_rgba(249,115,22,0.95)]',
                textColor: 'text-orange-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.6)]',
                subTextColor: 'text-orange-300 font-bold',
                boxClass: 'bg-orange-500/[0.08] border-t-orange-400/50 border-x-orange-500/25 border-b-orange-500/10 shadow-[0_0_35px_rgba(239,68,68,0.3)]',
                auraColor: 'from-red-600 via-orange-500 to-amber-400',
              };
            }
            if (count === 4) {
              return {
                title: 'Igniting Streak',
                flameClass: 'text-orange-500 fill-orange-500/80 drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]',
                textColor: 'text-orange-400',
                subTextColor: 'text-orange-300',
                boxClass: 'bg-orange-500/[0.05] border-t-orange-500/40 border-x-orange-500/20 border-b-white/5 shadow-[0_8px_30px_rgba(249,115,22,0.25)]',
                auraColor: 'from-orange-600 to-amber-500',
              };
            }
            if (count === 3) {
              return {
                title: 'Heating Up',
                flameClass: 'text-amber-400 fill-amber-400/70 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]',
                textColor: 'text-amber-400',
                subTextColor: 'text-amber-300',
                boxClass: 'bg-amber-500/[0.05] border-t-amber-400/40 border-x-amber-500/20 border-b-white/5 shadow-[0_8px_30px_rgba(245,158,11,0.25)]',
                auraColor: 'from-amber-500 to-yellow-400',
              };
            }
            if (count === 2) {
              return {
                title: 'Building Momentum',
                flameClass: 'text-lime-400 fill-lime-400/60 drop-shadow-[0_0_8px_rgba(132,204,22,0.7)]',
                textColor: 'text-lime-400',
                subTextColor: 'text-lime-300',
                boxClass: 'bg-lime-500/[0.04] border-t-lime-400/35 border-x-lime-500/15 border-b-white/5 shadow-[0_8px_30px_rgba(132,204,22,0.2)]',
                auraColor: 'from-lime-500 to-emerald-400',
              };
            }
            // 0 or 1
            return {
              title: 'Current Win Streak',
              flameClass: 'text-emerald-400 fill-emerald-400/50 drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]',
              textColor: 'text-text-light',
              subTextColor: 'text-emerald-400',
              boxClass: 'bg-white/[0.03] border-t-emerald-400/30 border-x-emerald-500/15 border-b-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.35)]',
              auraColor: 'from-emerald-500 to-teal-400',
            };
          };

          const theme = getStreakTheme(streak);

          // Distinct Bar Style for each thermal stage
          const getBarStyle = () => {
            if (isSuperCharged) {
              // 🔥 STAGE 5+ (MAX): ALL BARS TURN INTO BLAZING MOLTEN FIRE
              return 'bg-gradient-to-t from-red-600 via-orange-500 to-amber-300 shadow-[0_0_16px_rgba(249,115,22,0.95)] border border-orange-400/70';
            }
            if (streak === 4) {
              // 🟠 STAGE 4: BLAZING CRIMSON ORANGE
              return 'bg-gradient-to-t from-orange-600 via-orange-500 to-amber-300 shadow-[0_0_14px_rgba(249,115,22,0.85)] border border-orange-400/60';
            }
            if (streak === 3) {
              // 🟡 STAGE 3: GOLDEN YELLOW / WARM AMBER
              return 'bg-gradient-to-t from-amber-600 via-yellow-400 to-yellow-200 shadow-[0_0_14px_rgba(234,179,8,0.85)] border border-amber-400/60';
            }
            if (streak === 2) {
              // 🟢 STAGE 2: ELECTRIC NEON LIME
              return 'bg-gradient-to-t from-lime-600 via-lime-400 to-emerald-200 shadow-[0_0_12px_rgba(132,204,22,0.8)] border border-lime-400/50';
            }
            // 🟩 STAGE 1: COOL EMERALD / TEAL
            return 'bg-gradient-to-t from-emerald-600 via-teal-400 to-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.8)] border border-emerald-400/50';
          };

          return (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              className={`backdrop-blur-md p-5 rounded-3xl border-t border-x border-b flex items-center justify-between relative overflow-hidden transition-all duration-500 ${theme.boxClass}`}
            >
              {/* Animated Background Aura */}
              <motion.div 
                animate={{ 
                  scale: isSuperCharged ? [1, 1.35, 1] : [1, 1.2, 1],
                  opacity: isSuperCharged ? [0.25, 0.5, 0.25] : [0.12, 0.25, 0.12]
                }}
                transition={{ 
                  duration: isSuperCharged ? 2 : 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className={`absolute -top-12 -right-10 w-44 h-32 bg-gradient-to-br ${theme.auraColor} rounded-full blur-3xl pointer-events-none`}
              />

              <div className="relative z-10">
                <div className="flex items-center gap-1.5 mb-1">
                  {/* Dynamic Flame that animates and changes color */}
                  <motion.div
                    animate={
                      isSuperCharged 
                        ? { scale: [1, 1.3, 1], rotate: [-6, 6, -6] }
                        : streak >= 3
                          ? { scale: [1, 1.15, 1], rotate: [-3, 3, -3] }
                          : { scale: [1, 1.05, 1] }
                    }
                    transition={{ 
                      duration: isSuperCharged ? 0.7 : 1.2, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                  >
                    <Flame className={`w-4 h-4 ${theme.flameClass}`} />
                  </motion.div>
                  <h4 className={`text-xs font-black uppercase tracking-wider ${theme.textColor}`}>
                    {theme.title}
                  </h4>
                </div>

                <div className="flex items-baseline gap-1.5">
                  <span className={`text-3xl font-black text-white ${isSuperCharged ? 'drop-shadow-[0_0_15px_rgba(249,115,22,0.9)]' : 'drop-shadow-md'}`}>
                    {streak}
                  </span>
                  <span className={`text-xs font-bold ${theme.subTextColor}`}>
                    Wins in a row
                  </span>
                </div>
              </div>

              {/* 📊 Sleek Vertical Equalizer Bars (Always True Bars, Never Dots) */}
              <div className="flex items-center gap-1.5 h-9 relative z-10">
                {(() => {
                  const isAnimated = streak >= 3;

                  // Fluid Equalizer Bar Height Profiles (Always maintaining tall pill bar shape: 18px - 32px):
                  const getBassProfile = (barIndex: number) => {
                    if (isSuperCharged) {
                      // 🔥 STAGE 5+ (MOLTEN FIRE CHILL BASS WAVE): 0.78s fluid vertical dancing
                      const heights = [
                        [18, 30, 22, 28, 18],
                        [22, 28, 18, 32, 22],
                        [18, 32, 24, 26, 18],
                        [24, 26, 18, 30, 24],
                        [18, 28, 22, 30, 18],
                      ];
                      return {
                        duration: 0.8 + (barIndex % 2) * 0.08,
                        height: heights[barIndex % heights.length],
                        opacity: [0.85, 1, 0.9, 1, 0.85],
                        delay: barIndex * 0.1,
                      };
                    }

                    if (streak === 4) {
                      // 🟠 STAGE 4 (WARM BOUNCY WAVE): 0.95s smooth vertical dancing
                      const heights = [
                        [18, 28, 22, 26, 18],
                        [22, 26, 18, 28, 22],
                        [18, 30, 20, 24, 18],
                        [24, 24, 18, 28, 24],
                        [18, 26, 22, 26, 18],
                      ];
                      return {
                        duration: 0.95 + (barIndex % 2) * 0.1,
                        height: heights[barIndex % heights.length],
                        opacity: [0.8, 1, 0.85, 1, 0.8],
                        delay: barIndex * 0.12,
                      };
                    }

                    // 🟡 STAGE 3 (CHILL LO-FI WAVE): 1.15s relaxed vertical dancing
                    const heights = [
                      [18, 26, 20, 24, 18],
                      [22, 24, 18, 26, 22],
                      [18, 28, 22, 22, 18],
                      [20, 24, 18, 26, 20],
                      [18, 24, 20, 24, 18],
                    ];
                    return {
                      duration: 1.15 + (barIndex % 3) * 0.12,
                      height: heights[barIndex % heights.length],
                      opacity: [0.75, 1, 0.8, 1, 0.75],
                      delay: barIndex * 0.14,
                    };
                  };

                  return [...Array(5)].map((_, i) => {
                    const isActive = isSuperCharged || i < streak;
                    const anim = getBassProfile(i);

                    // At Stage 1 and 2: Steady / Still vertical bars
                    if (!isAnimated) {
                      return (
                        <div 
                          key={i} 
                          className={`w-3 rounded-full transition-all duration-300 ${
                            isActive 
                              ? `h-6 ${getBarStyle()}` 
                              : 'h-6 bg-white/10 border border-white/5 opacity-25'
                          }`}
                        />
                      );
                    }

                    // At Stage 3+: Moving Vertical Equalizer Bars (Always Tall Bars)
                    return (
                      <motion.div 
                        key={i} 
                        animate={
                          isActive
                            ? {
                                height: anim.height,
                                opacity: anim.opacity,
                              }
                            : { height: 24, opacity: 0.18 }
                        }
                        transition={
                          isActive
                            ? {
                                duration: anim.duration,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: anim.delay,
                              }
                            : { duration: 0.2 }
                        }
                        className={`w-3 rounded-full transition-colors duration-300 ${
                          isActive 
                            ? getBarStyle() 
                            : 'bg-white/10 border border-white/5'
                        }`}
                        style={{ minHeight: '18px' }}
                      />
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
