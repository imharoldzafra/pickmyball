import React from 'react';
import { motion } from 'framer-motion';

interface LivingFlameProps {
  streak: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LivingFlame({ streak, className = '', size = 'md' }: LivingFlameProps) {
  const isGodlike = streak >= 10;
  const isSuperCharged = streak >= 5;
  const isDormant = streak === 0;
  const isStatic = streak < 4;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  }[size];

  // 1. Dormant state (0 Wins): Muted outline, completely still
  if (isDormant) {
    return (
      <div className={`relative flex items-center justify-center ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-white/30">
          <path
            d="M12 2C12 2 6 7.5 6 13C6 16.5 8.7 19.5 12 19.5C15.3 19.5 18 16.5 18 13C18 7.5 12 2 12 2Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  }

  // 2. Streaks 1, 2, 3: Steady glow, no aggressive flickering
  if (isStatic) {
    const staticColor = streak === 2 ? '#06b6d4' : streak === 3 ? '#f59e0b' : '#10b981';
    return (
      <div className={`relative flex items-center justify-center ${sizeClasses} ${className}`}>
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <defs>
            <linearGradient id={`staticFlame-${streak}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={staticColor} stopOpacity="0.9" />
              <stop offset="100%" stopColor={staticColor} stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <path
            d="M12 2C12 2 6 7.5 6 13C6 16.5 8.7 19.5 12 19.5C15.3 19.5 18 16.5 18 13C18 7.5 12 2 12 2Z"
            fill={`url(#staticFlame-${streak})`}
          />
          <path
            d="M12 7C12 7 8.5 10.5 8.5 13.5C8.5 15.5 10 17 12 17C14 17 15.5 15.5 15.5 13.5C15.5 10.5 12 7 12 7Z"
            fill="#ffffff"
            fillOpacity="0.4"
          />
        </svg>
      </div>
    );
  }

  // 3. Living Active Flame (Stage 4, 5-9, 10+): Multi-layered organic flame + floating ember sparks
  const isCosmic = isGodlike;

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses} ${className}`}>
      {/* Outer ambient fire aura blur */}
      <motion.div
        animate={{
          scale: isCosmic ? [1, 1.35, 0.95, 1.25, 1] : [1, 1.25, 1],
          opacity: isCosmic ? [0.6, 0.95, 0.6] : [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: isCosmic ? 0.75 : isSuperCharged ? 1 : 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`absolute inset-0 rounded-full blur-md pointer-events-none ${
          isCosmic 
            ? 'bg-purple-500/60' 
            : isSuperCharged 
              ? 'bg-orange-500/50' 
              : 'bg-amber-500/40'
        }`}
      />

      {/* Rising Floating Ember Sparks (Living Fire Particles) */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [-1, -10 - i * 3],
            x: [0, (i % 2 === 0 ? 3 : -3) + (i === 1 ? -2 : 2)],
            scale: [1, 0],
            opacity: [0.9, 0],
          }}
          transition={{
            duration: isCosmic ? 0.6 + i * 0.15 : 0.8 + i * 0.2,
            repeat: Infinity,
            delay: i * 0.25,
            ease: "easeOut",
          }}
          className={`absolute top-0 w-1 h-1 rounded-full pointer-events-none ${
            isCosmic 
              ? 'bg-cyan-300 shadow-[0_0_6px_#22d3ee]' 
              : 'bg-amber-200 shadow-[0_0_5px_#fde047]'
          }`}
        />
      ))}

      {/* Layered Living Organic Flame SVG */}
      <motion.svg
        viewBox="0 0 24 24"
        className="w-full h-full relative z-10 overflow-visible"
        animate={{
          scale: isCosmic ? [1, 1.15, 0.96, 1.12, 1] : isSuperCharged ? [1, 1.12, 0.98, 1.08, 1] : [1, 1.06, 1],
          rotate: isCosmic ? [-5, 5, -4, 4, -5] : isSuperCharged ? [-4, 4, -4] : [-2, 2, -2],
        }}
        transition={{
          duration: isCosmic ? 0.6 : isSuperCharged ? 0.85 : 1.4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <defs>
          {/* Cosmic Palette (Godlike 10+) */}
          <linearGradient id="cosmicOuter" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="60%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#4c1d95" />
          </linearGradient>
          <linearGradient id="cosmicMid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>

          {/* Molten Fire Palette (On Fire 5-9 & Heating Up 4) */}
          <linearGradient id="fireOuter" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="50%" stopColor="#ea580c" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
          <linearGradient id="fireMid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
        </defs>

        {/* 1. Outer Roaring Flame Tongue (Primary body) */}
        <path
          d="M12 1.5C12 1.5 5.5 7.5 5.5 13.5C5.5 17.5 8.4 20.5 12 20.5C15.6 20.5 18.5 17.5 18.5 13.5C18.5 7.5 12 1.5 12 1.5Z"
          fill={isCosmic ? "url(#cosmicOuter)" : "url(#fireOuter)"}
          filter={isCosmic ? "drop-shadow(0 0 4px rgba(192,132,252,0.8))" : "drop-shadow(0 0 4px rgba(249,115,22,0.8))"}
        />

        {/* 2. Inner Flickering Flame Tongue (Living core wave) */}
        <motion.path
          animate={{
            scaleY: [1, 1.14, 0.92, 1.08, 1],
            scaleX: [1, 0.94, 1.05, 0.96, 1],
          }}
          transition={{
            duration: isCosmic ? 0.45 : 0.65,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "12px 18px" }}
          d="M12 6C12 6 8 10 8 14C8 16.5 9.8 18.5 12 18.5C14.2 18.5 16 16.5 16 14C16 10 12 6 12 6Z"
          fill={isCosmic ? "url(#cosmicMid)" : "url(#fireMid)"}
        />

        {/* 3. White-Hot Burning Heart (Hottest center point) */}
        <ellipse
          cx="12"
          cy="15.2"
          rx="2.2"
          ry="3.2"
          fill="#ffffff"
          opacity={isCosmic ? 0.95 : 0.9}
        />
      </motion.svg>
    </div>
  );
}
