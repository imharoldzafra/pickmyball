import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Trophy, Users, History, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function Layout() {
  const location = useLocation();
  const isMatchView = location.pathname.includes('/match/');
  const isLiveMatch = location.pathname.includes('/live');

  return (
    <div className="min-h-screen bg-[#040709] flex justify-center selection:bg-primary/30">
      {/* Phone container on desktop with rounded screen mock */}
      <div className="w-full max-w-md min-h-screen flex flex-col bg-[#05080c] relative shadow-[0_0_80px_rgba(0,0,0,0.9)] sm:border-x border-white/5 sm:rounded-3xl overflow-hidden my-0 sm:my-3 sm:max-h-[96vh]">
        
        {/* 🎾 Relaxing Pickleball Court & Floating Aurora Ambient Background Layer (App-Wide) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* Pickleball Court Blueprint Blueprint Lines */}
          <svg 
            className="absolute inset-0 w-full h-full opacity-20" 
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 400 800"
            preserveAspectRatio="none"
          >
            {/* Outer Court Boundary */}
            <rect x="24" y="30" width="352" height="740" rx="12" fill="none" stroke="rgba(16, 185, 129, 0.45)" strokeWidth="1.5" strokeDasharray="8 5" />
            
            {/* Non-Volley Kitchen Zones & Net Line */}
            <line x1="24" y1="280" x2="376" y2="280" stroke="rgba(6, 182, 212, 0.55)" strokeWidth="1.5" />
            <line x1="24" y1="520" x2="376" y2="520" stroke="rgba(6, 182, 212, 0.55)" strokeWidth="1.5" />
            <line x1="24" y1="400" x2="376" y2="400" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="2.5" />

            {/* Center Service Dividing Lines */}
            <line x1="200" y1="30" x2="200" y2="280" stroke="rgba(16, 185, 129, 0.35)" strokeWidth="1.5" />
            <line x1="200" y1="520" x2="200" y2="770" stroke="rgba(16, 185, 129, 0.35)" strokeWidth="1.5" />

            {/* Center Kitchen Zone Tint */}
            <rect x="24" y="280" width="352" height="240" fill="rgba(16, 185, 129, 0.03)" />
          </svg>

          {/* 🌊 Gentle Sweeping Light Wave Shimmer */}
          <motion.div 
            animate={{
              y: [-300, 850],
              opacity: [0, 0.6, 0]
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: "easeInOut",
              repeatDelay: 2
            }}
            className="absolute left-0 right-0 h-44 bg-gradient-to-b from-transparent via-emerald-400/10 to-transparent pointer-events-none -skew-y-12"
          />

          {/* Diagonal Light Streak Shimmer */}
          <motion.div 
            animate={{
              x: [-250, 450],
              opacity: [0, 0.4, 0]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3.5,
              repeatDelay: 2.5
            }}
            className="absolute top-0 bottom-0 w-32 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent pointer-events-none -skew-x-12"
          />

          {/* Top Emerald/Mint Aurora Orb */}
          <motion.div 
            animate={{
              x: [0, 35, -25, 0],
              y: [0, -25, 20, 0],
              scale: [1, 1.2, 0.95, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-16 -left-16 w-80 h-80 rounded-full bg-emerald-500/20 blur-[85px]"
          />

          {/* Center-Right Deep Cyan/Sky Aurora Orb */}
          <motion.div 
            animate={{
              x: [0, -35, 25, 0],
              y: [0, 30, -25, 0],
              scale: [1, 1.25, 0.9, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              duration: 22,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-cyan-500/15 blur-[95px]"
          />

          {/* Lower Teal/Emerald Ambient Drift */}
          <motion.div 
            animate={{
              x: [0, 25, -35, 0],
              y: [0, -30, 25, 0],
              scale: [0.95, 1.2, 1, 0.95],
              opacity: [0.18, 0.35, 0.18]
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 4
            }}
            className="absolute -bottom-16 left-6 w-88 h-88 rounded-full bg-teal-600/18 blur-[105px]"
          />

          {/* Soft vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60 pointer-events-none" />
        </div>

        {/* Content View */}
        <main className={cn(
          "flex-1 relative z-10 no-scrollbar flex flex-col",
          isLiveMatch 
            ? "overflow-hidden p-1" 
            : isMatchView 
              ? "overflow-y-auto pb-4 pt-1 px-1 justify-center"
              : "overflow-y-auto pb-16 pt-1 px-1"
        )}>
          <Outlet />
        </main>
        
        {/* Fixed Anchored Floating Ultra-Slim Organic Pill Navigation Bar (Hidden in matches & victory screen) */}
        {!isMatchView && (
          <nav className="fixed bottom-3.5 inset-x-4 max-w-[390px] mx-auto bg-[#070b10]/90 backdrop-blur-2xl border border-white/10 rounded-full px-3 py-1.5 flex justify-between items-center shadow-[0_15px_40px_rgba(0,0,0,0.85),0_0_20px_rgba(16,185,129,0.06)] z-50">
            <NavItem to="/" icon={<Home className="w-5 h-5" />} label="Home" />
            <NavItem to="/history" icon={<History className="w-5 h-5" />} label="History" />
            <NavItem to="/play" isCenter icon={<Trophy className="w-6 h-6" />} label="Play" />
            <NavItem to="/friends" icon={<Users className="w-5 h-5" />} label="Friends" />
            <NavItem to="/profile" icon={<User className="w-5 h-5" />} label="Profile" />
          </nav>
        )}
      </div>
    </div>
  );
}

function NavItem({ to, icon, label, isCenter }: { to: string, icon: React.ReactNode, label: string, isCenter?: boolean }) {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => 
        cn("relative flex flex-col items-center justify-center transition-all duration-300", 
          isCenter 
            ? "px-2 py-0 -mt-6" 
            : cn(
                "py-0.5 px-2.5 rounded-full min-w-[54px]",
                isActive 
                  ? "text-emerald-400 font-bold" 
                  : "text-text-light/50 hover:text-white"
              )
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Cyber-Sport Floating Elevated Center Button */}
          {isCenter ? (
            <div className="relative group flex flex-col items-center">
              {/* Soothing Ambient Aurora Glow */}
              <div className={cn(
                "absolute -inset-1 rounded-full blur-md transition-all duration-300 pointer-events-none",
                isActive 
                  ? "bg-gradient-to-r from-emerald-500/35 via-teal-400/30 to-cyan-500/35 opacity-90 scale-105" 
                  : "bg-emerald-500/15 opacity-40 group-hover:opacity-75 group-hover:blur-lg"
              )} />
              
              {/* The Elevated Center Circular Badge */}
              <div className={cn(
                "relative w-[48px] h-[48px] rounded-full flex items-center justify-center transition-all duration-300 border shadow-2xl active:scale-95",
                isActive 
                  ? "bg-gradient-to-b from-[#0f212c] via-[#09161e] to-[#050d12] text-emerald-300 border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.25),0_6px_20px_rgba(0,0,0,0.8)] scale-105" 
                  : "bg-gradient-to-b from-[#0e1820] to-[#060c10] text-emerald-400/70 border-white/10 shadow-[0_4px_15px_rgba(0,0,0,0.7)] group-hover:scale-105 group-hover:border-emerald-400/40 group-hover:text-emerald-400"
              )}>
                {/* 🎾 Satisfying Bouncing Neon Pickleball with Physics Squash & Stretch */}
                <motion.div
                  animate={{
                    y: [-4, 3.5, -4],
                    scaleX: [0.92, 1.3, 0.92],
                    scaleY: [1.12, 0.7, 1.12],
                  }}
                  transition={{
                    duration: 0.85,
                    repeat: Infinity,
                    ease: ['easeOut', 'easeIn', 'easeOut'],
                  }}
                  className={cn(
                    "absolute top-1.5 w-[5px] h-[5px] rounded-full transition-all",
                    isActive 
                      ? "bg-gradient-to-tr from-emerald-400 to-lime-300 shadow-[0_0_10px_#34d399,0_0_4px_#10b981]" 
                      : "bg-emerald-400/70 shadow-[0_0_6px_rgba(16,185,129,0.5)]"
                  )}
                />
                
                <div className={cn(
                  "transition-all duration-300 mt-1", 
                  isActive ? "scale-105 text-emerald-300 drop-shadow-[0_0_10px_rgba(52,211,153,0.7)]" : "text-emerald-400/70"
                )}>
                  {icon}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative flex flex-col items-center justify-center py-1">
              {/* Icon with scale & glow */}
              <div className={cn(
                "transition-all duration-200", 
                isActive 
                  ? "scale-110 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]" 
                  : "text-text-light/50 group-hover:text-white/80"
              )}>
                {icon}
              </div>

              {/* Label */}
              <span className={cn(
                "text-[10px] tracking-tight mt-0.5 transition-colors duration-200",
                isActive ? "font-black text-emerald-300" : "font-medium text-text-light/40"
              )}>
                {label}
              </span>

              {/* Glowing Micro-Dot on Active Tab */}
              {isActive && (
                <motion.div 
                  layoutId="activeNavDot"
                  className="absolute -bottom-1 w-1.5 h-1.5 bg-emerald-400 rounded-full shadow-[0_0_8px_#10b981]"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
            </div>
          )}
        </>
      )}
    </NavLink>
  );
}
