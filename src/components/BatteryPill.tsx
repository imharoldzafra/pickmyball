import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

interface BatteryPillProps {
  stamina?: number;
  rating?: number;
  className?: string;
  onClick?: () => void;
}

export default function BatteryPill({
  stamina = 100,
  rating = 1000,
  className = '',
  onClick,
}: BatteryPillProps) {
  const isRookieSandbox = (rating || 0) < 800;
  const currentStamina = isRookieSandbox ? 100 : Math.max(0, Math.min(100, stamina));
  const isSecondWind = !isRookieSandbox && currentStamina === 0;

  // Dynamic colors for the liquid battery fill
  const theme = (() => {
    if (isRookieSandbox) {
      return {
        fillGradient: 'from-emerald-500 via-teal-400 to-emerald-400',
        borderColor: 'border-emerald-400/40',
        glowShadow: '',
        terminalColor: 'bg-emerald-400/70',
      };
    }
    if (isSecondWind) {
      return {
        fillGradient: 'from-cyan-500 via-sky-400 to-blue-500',
        borderColor: 'border-cyan-400/50',
        glowShadow: '',
        terminalColor: 'bg-cyan-400/80',
      };
    }
    if (currentStamina <= 25) {
      return {
        fillGradient: 'from-amber-600 via-orange-500 to-red-500',
        borderColor: 'border-red-400/40',
        glowShadow: '',
        terminalColor: 'bg-red-400/70',
      };
    }
    if (currentStamina <= 50) {
      return {
        fillGradient: 'from-amber-500 via-yellow-400 to-amber-400',
        borderColor: 'border-amber-400/40',
        glowShadow: '',
        terminalColor: 'bg-amber-400/70',
      };
    }
    return {
      fillGradient: 'from-emerald-500 via-teal-400 to-emerald-400',
      borderColor: 'border-emerald-400/40',
      glowShadow: '',
      terminalColor: 'bg-emerald-400/70',
    };
  })();

  const labelText = isRookieSandbox
    ? 'Sandbox'
    : isSecondWind
    ? 'Second Wind'
    : `${currentStamina}%`;

  return (
    <div 
      onClick={onClick}
      className={`inline-flex items-center select-none group cursor-pointer ${className}`}
    >
      {/* 🔋 CRISP RECTANGULAR TECH BATTERY (COMPACT) */}
      <div className={`relative h-[17px] min-w-[50px] px-1.5 rounded-[4px] border ${theme.borderColor} bg-black/60 backdrop-blur-md overflow-hidden flex items-center justify-center transition-all duration-300 shadow-inner group-hover:scale-[1.02]`}>
        
        {/* Animated Liquid Battery Fill (Straight clean cut) */}
        <motion.div
          initial={false}
          animate={{
            width: `${isSecondWind ? 22 : currentStamina}%`,
          }}
          transition={{
            type: 'spring',
            stiffness: 110,
            damping: 16,
          }}
          className={`absolute left-0 top-0 bottom-0 bg-gradient-to-r ${theme.fillGradient} ${theme.glowShadow} rounded-l-[2.5px] ${currentStamina >= 98 ? 'rounded-r-[2.5px]' : ''}`}
        >
          {/* Light Sweep Shimmer Reflection */}
          <motion.div
            animate={{
              x: ['-100%', '250%'],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              repeatDelay: 1.2,
              ease: 'easeInOut',
            }}
            className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none"
          />

          {/* Second Wind Pulse */}
          {isSecondWind && (
            <motion.div
              animate={{ opacity: [0.3, 0.85, 0.3] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 bg-cyan-300/40 pointer-events-none"
            />
          )}
        </motion.div>

        {/* Content Sitting On Top of Liquid Fill */}
        <div className="relative z-10 flex items-center justify-center gap-0.5">
          <Zap className="w-2 h-2 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] fill-white/30" />
          <motion.span
            key={labelText}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[9px] font-mono font-black text-white tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]"
          >
            {labelText}
          </motion.span>
        </div>
      </div>

      {/* Battery Positive Terminal Tip (+ Pole on the Right Edge) */}
      <div className={`w-[1.5px] h-[6px] rounded-r-[1px] ${theme.terminalColor} -ml-[0.5px] transition-colors duration-300 shadow-sm`} />
    </div>
  );
}
