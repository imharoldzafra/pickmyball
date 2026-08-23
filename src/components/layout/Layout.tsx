import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Trophy, Users, History, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function Layout() {
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

        {/* Scrollable Content View */}
        <main className="flex-1 overflow-y-auto pb-24 pt-2 px-1 relative z-10 no-scrollbar">
          <Outlet />
        </main>
        
        {/* Fixed Anchored Glassmorphic Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0b1015]/95 backdrop-blur-2xl border-t border-white/10 px-4 py-2 flex justify-around items-center shadow-[0_-10px_30px_rgba(0,0,0,0.8)] z-50">
          <NavItem to="/" icon={<Home className="w-5 h-5" />} label="Home" />
          <NavItem to="/history" icon={<History className="w-5 h-5" />} label="History" />
          <NavItem to="/play" isCenter icon={<Trophy className="w-5 h-5" />} label="Play" />
          <NavItem to="/friends" icon={<Users className="w-5 h-5" />} label="Friends" />
          <NavItem to="/profile" icon={<User className="w-5 h-5" />} label="Profile" />
        </nav>
      </div>
    </div>
  );
}

function NavItem({ to, icon, label, isCenter }: { to: string, icon: React.ReactNode, label: string, isCenter?: boolean }) {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => 
        cn("relative flex flex-col items-center justify-center py-1.5 px-4 rounded-xl transition-all duration-300", 
          isCenter 
            ? isActive 
              ? "text-[#050a0a]" 
              : "text-primary hover:text-secondary"
            : isActive 
              ? "text-primary font-bold" 
              : "text-text-light hover:text-text-main"
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Active indicator line at top of tab */}
          {isActive && !isCenter && (
            <motion.div 
              layoutId="navTabLine"
              className="absolute -top-2 left-2 right-2 h-0.5 bg-primary rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]"
              transition={{ type: "spring", stiffness: 450, damping: 35 }}
            />
          )}

          {/* Center Play Action Button */}
          {isCenter ? (
            <div className={cn(
              "p-3 rounded-2xl shadow-lg transition-transform duration-300 flex items-center justify-center -mt-5",
              isActive 
                ? "bg-primary text-[#050a0a] shadow-[0_0_20px_rgba(16,185,129,0.8)] scale-110" 
                : "bg-primary/20 text-primary border border-primary/40 hover:scale-105"
            )}>
              {icon}
            </div>
          ) : (
            <>
              {icon}
              <span className="text-[10px] font-bold tracking-tight mt-1">{label}</span>
            </>
          )}
        </>
      )}
    </NavLink>
  );
}
