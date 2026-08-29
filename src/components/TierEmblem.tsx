import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Award, Gem, Crown } from 'lucide-react';

interface TierEmblemProps {
  rank: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export default function TierEmblem({
  rank = 'Rookie',
  size = 'md',
  animated = true,
  className = '',
}: TierEmblemProps) {
  const normalizedRank = rank.toLowerCase();

  // Tier specific configurations
  const config = (() => {
    switch (normalizedRank) {
      case 'legend':
        return {
          title: 'Legend',
          icon: Crown,
          glowColor: 'rgba(249, 115, 22, 0.6)',
          borderColor: 'border-orange-500/60',
          bgGradient: 'from-orange-500/25 via-amber-500/15 to-red-500/20',
          iconColor: 'text-orange-400',
          ringColor: 'border-orange-400/40',
          shadow: 'shadow-[0_0_25px_rgba(249,115,22,0.45)]',
          badgeText: 'text-orange-300 bg-orange-500/20 border-orange-500/40',
        };
      case 'expert':
        return {
          title: 'Expert',
          icon: Gem,
          glowColor: 'rgba(251, 191, 36, 0.5)',
          borderColor: 'border-amber-400/50',
          bgGradient: 'from-amber-400/20 via-yellow-400/15 to-amber-500/15',
          iconColor: 'text-amber-300',
          ringColor: 'border-amber-300/30',
          shadow: 'shadow-[0_0_20px_rgba(251,191,36,0.35)]',
          badgeText: 'text-amber-300 bg-amber-400/20 border-amber-400/40',
        };
      case 'veteran':
        return {
          title: 'Veteran',
          icon: Award,
          glowColor: 'rgba(6, 182, 212, 0.45)',
          borderColor: 'border-cyan-400/40',
          bgGradient: 'from-cyan-500/20 via-sky-500/10 to-teal-500/15',
          iconColor: 'text-cyan-300',
          ringColor: 'border-cyan-400/30',
          shadow: 'shadow-[0_0_18px_rgba(6,182,212,0.3)]',
          badgeText: 'text-cyan-300 bg-cyan-500/20 border-cyan-400/40',
        };
      case 'challenger':
        return {
          title: 'Challenger',
          icon: Zap,
          glowColor: 'rgba(16, 185, 129, 0.35)',
          borderColor: 'border-emerald-400/35',
          bgGradient: 'from-emerald-500/15 via-teal-500/10 to-emerald-500/10',
          iconColor: 'text-emerald-300',
          ringColor: 'border-emerald-400/25',
          shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.25)]',
          badgeText: 'text-emerald-300 bg-emerald-500/15 border-emerald-400/30',
        };
      case 'rookie':
      default:
        return {
          title: 'Rookie',
          icon: Shield,
          glowColor: 'rgba(148, 163, 184, 0.25)',
          borderColor: 'border-slate-500/30',
          bgGradient: 'from-slate-500/15 via-slate-600/10 to-slate-500/10',
          iconColor: 'text-slate-300',
          ringColor: 'border-slate-500/20',
          shadow: 'shadow-[0_0_10px_rgba(148,163,184,0.15)]',
          badgeText: 'text-slate-300 bg-slate-500/15 border-slate-500/30',
        };
    }
  })();

  const Icon = config.icon;

  // Size variations
  const sizeStyles = {
    sm: {
      container: 'w-7 h-7 rounded-xl border',
      icon: 'w-3.5 h-3.5',
      glowBlur: 'blur-md',
    },
    md: {
      container: 'w-11 h-11 rounded-2xl border-2',
      icon: 'w-5 h-5',
      glowBlur: 'blur-lg',
    },
    lg: {
      container: 'w-16 h-16 sm:w-20 sm:h-20 rounded-3xl border-2',
      icon: 'w-8 h-8 sm:w-9 sm:h-9',
      glowBlur: 'blur-xl',
    },
  }[size];

  // -------------------------------------------------------------
  // ANIMATION TIERS:
  // - Rookie & Challenger: Calm / Static
  // - Veteran: Chill, breathing pulse
  // - Expert: Radiant shimmer & light sweep
  // - Legend: Intense, rapid pulsating flame aura & crown float
  // -------------------------------------------------------------

  if (!animated || size === 'sm') {
    // Clean static emblem for small lists or non-animated views
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${sizeStyles.container} ${config.borderColor} bg-gradient-to-br ${config.bgGradient} ${config.shadow} ${className}`}>
        <Icon className={`${sizeStyles.icon} ${config.iconColor}`} />
      </div>
    );
  }

  // 👑 LEGEND: Intense, Satisfying Mythic Animation
  if (normalizedRank === 'legend') {
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
        {/* Outer Pulsing Flame Aura */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.4, 0.85, 0.4],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 blur-xl pointer-events-none"
        />

        {/* Rotating Energy Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "linear",
          }}
          className={`absolute -inset-1.5 rounded-3xl border border-dashed border-orange-400/50 pointer-events-none`}
        />

        {/* Main Emblem Container */}
        <motion.div
          animate={{
            y: [-2, 2, -2],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`relative z-10 flex items-center justify-center ${sizeStyles.container} ${config.borderColor} bg-gradient-to-br ${config.bgGradient} ${config.shadow} backdrop-blur-md`}
        >
          {/* Intense Inner Pulse Glow */}
          <div className="absolute inset-0 rounded-3xl bg-orange-500/20 animate-pulse pointer-events-none" />

          {/* Floating Crown with Micro Tilt */}
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              rotate: [-2, 2, -2],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Icon className={`${sizeStyles.icon} ${config.iconColor} drop-shadow-[0_0_12px_rgba(249,115,22,0.9)]`} />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // 💎 EXPERT: Radiant Shimmer & Diamond Light Sweep
  if (normalizedRank === 'expert') {
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
        {/* Amber Ambient Bloom */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.35, 0.65, 0.35],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-3xl bg-amber-400 blur-lg pointer-events-none"
        />

        {/* Main Emblem Container */}
        <div className={`relative z-10 overflow-hidden flex items-center justify-center ${sizeStyles.container} ${config.borderColor} bg-gradient-to-br ${config.bgGradient} ${config.shadow} backdrop-blur-md`}>
          {/* Sweeping Shimmer Beam */}
          <motion.div
            animate={{
              x: ['-120%', '160%'],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              repeatDelay: 1.2,
              ease: "easeInOut",
            }}
            className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-12 pointer-events-none"
          />

          <motion.div
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Icon className={`${sizeStyles.icon} ${config.iconColor} drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]`} />
          </motion.div>
        </div>
      </div>
    );
  }

  // 🏆 VETERAN: Chill Breathing Cyan Aura
  if (normalizedRank === 'veteran') {
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
        {/* Soft Breathing Cyan Glow */}
        <motion.div
          animate={{
            scale: [1, 1.12, 1],
            opacity: [0.25, 0.5, 0.25],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-3xl bg-cyan-400 blur-lg pointer-events-none"
        />

        {/* Gentle Floating Emblem */}
        <motion.div
          animate={{
            y: [-1.5, 1.5, -1.5],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`relative z-10 flex items-center justify-center ${sizeStyles.container} ${config.borderColor} bg-gradient-to-br ${config.bgGradient} ${config.shadow} backdrop-blur-md`}
        >
          <Icon className={`${sizeStyles.icon} ${config.iconColor} drop-shadow-[0_0_8px_rgba(6,182,212,0.7)]`} />
        </motion.div>
      </div>
    );
  }

  // 🌱 ROOKIE & ⚡ CHALLENGER: Crisp, Clean, Steady
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <div className="absolute inset-0 rounded-3xl bg-emerald-400/20 blur-md pointer-events-none" />
      <div className={`relative z-10 flex items-center justify-center ${sizeStyles.container} ${config.borderColor} bg-gradient-to-br ${config.bgGradient} ${config.shadow} backdrop-blur-md`}>
        <Icon className={`${sizeStyles.icon} ${config.iconColor}`} />
      </div>
    </div>
  );
}
