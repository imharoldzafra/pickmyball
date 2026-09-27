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
          borderColor: 'border-orange-500/60',
          bgGradient: 'from-orange-500/25 via-amber-500/15 to-red-500/20',
          iconColor: 'text-orange-400',
          ringColor: 'border-orange-400/40',
          shadow: 'shadow-sm',
          badgeText: 'text-orange-300 bg-orange-500/20 border-orange-500/40',
        };
      case 'expert':
        return {
          title: 'Expert',
          icon: Gem,
          borderColor: 'border-amber-400/50',
          bgGradient: 'from-amber-400/20 via-yellow-400/15 to-amber-500/15',
          iconColor: 'text-amber-300',
          ringColor: 'border-amber-300/30',
          shadow: 'shadow-sm',
          badgeText: 'text-amber-300 bg-amber-400/20 border-amber-400/40',
        };
      case 'veteran':
        return {
          title: 'Veteran',
          icon: Award,
          borderColor: 'border-cyan-400/40',
          bgGradient: 'from-cyan-500/20 via-sky-500/10 to-teal-500/15',
          iconColor: 'text-cyan-300',
          ringColor: 'border-cyan-400/30',
          shadow: 'shadow-sm',
          badgeText: 'text-cyan-300 bg-cyan-500/20 border-cyan-400/40',
        };
      case 'challenger':
        return {
          title: 'Challenger',
          icon: Zap,
          borderColor: 'border-emerald-400/35',
          bgGradient: 'from-emerald-500/15 via-teal-500/10 to-emerald-500/10',
          iconColor: 'text-emerald-300',
          ringColor: 'border-emerald-400/25',
          shadow: 'shadow-sm',
          badgeText: 'text-emerald-300 bg-emerald-500/15 border-emerald-400/30',
        };
      case 'rookie':
      default:
        return {
          title: 'Rookie',
          icon: Shield,
          borderColor: 'border-slate-500/30',
          bgGradient: 'from-slate-500/15 via-slate-600/10 to-slate-500/10',
          iconColor: 'text-slate-300',
          ringColor: 'border-slate-500/20',
          shadow: 'shadow-sm',
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
    },
    md: {
      container: 'w-11 h-11 rounded-2xl border-2',
      icon: 'w-5 h-5',
    },
    lg: {
      container: 'w-16 h-16 sm:w-20 sm:h-20 rounded-3xl border-2',
      icon: 'w-8 h-8 sm:w-9 sm:h-9',
    },
  }[size];

  // -------------------------------------------------------------
  // ANIMATION TIERS:
  // - Rookie & Challenger: Calm / Static
  // - Veteran: Chill, breathing pulse
  // - Expert: Radiant shimmer & light sweep
  // - Legend: Elegant crown float
  // -------------------------------------------------------------

  if (!animated || size === 'sm') {
    // Clean static emblem for small lists or non-animated views
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${sizeStyles.container} ${config.borderColor} bg-gradient-to-br ${config.bgGradient} ${config.shadow} ${className}`}>
        <Icon className={`${sizeStyles.icon} ${config.iconColor}`} />
      </div>
    );
  }

  // 👑 LEGEND: Mythic Animation
  if (normalizedRank === 'legend') {
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
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
            <Icon className={`${sizeStyles.icon} ${config.iconColor}`} />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // 💎 EXPERT: Radiant Shimmer
  if (normalizedRank === 'expert') {
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
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
            <Icon className={`${sizeStyles.icon} ${config.iconColor}`} />
          </motion.div>
        </div>
      </div>
    );
  }

  // 🏆 VETERAN: Gentle Floating Emblem
  if (normalizedRank === 'veteran') {
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
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
          <Icon className={`${sizeStyles.icon} ${config.iconColor}`} />
        </motion.div>
      </div>
    );
  }

  // 🌱 ROOKIE & ⚡ CHALLENGER: Crisp, Clean, Steady
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <div className={`relative z-10 flex items-center justify-center ${sizeStyles.container} ${config.borderColor} bg-gradient-to-br ${config.bgGradient} ${config.shadow} backdrop-blur-md`}>
        <Icon className={`${sizeStyles.icon} ${config.iconColor}`} />
      </div>
    </div>
  );
}
