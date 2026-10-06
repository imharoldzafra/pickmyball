import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Trophy, Users, History, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

export default function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const isMatchView = location.pathname.includes('/match/');
  const isLiveMatch = location.pathname.includes('/live');
  const isLeaderboard = location.pathname.includes('/leaderboard');
  const isFirstPageTab = ['/', '/history', '/play', '/friends', '/profile'].includes(location.pathname);

  return (
    <div className="min-h-screen h-[100dvh] bg-[#EBE8E1] flex justify-center selection:bg-[#244434]/20 overflow-hidden">
      {/* Phone container on desktop with rounded screen mock */}
      <div className="w-full max-w-md flex flex-col bg-[#F7F6F1] relative shadow-[0_10px_40px_rgba(24,40,30,0.08)] sm:border-x border-[#E2DDD4] sm:rounded-3xl overflow-hidden my-0 sm:my-3 h-[100dvh] max-h-[100dvh] sm:max-h-[96vh]">
        
        {/* 🎾 Elegant Pickleball Court Chalk Lines Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <svg 
            className="absolute inset-0 w-full h-full opacity-[0.06]" 
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 400 800"
            preserveAspectRatio="none"
          >
            <rect x="24" y="30" width="352" height="740" rx="12" fill="none" stroke="#244434" strokeWidth="2" strokeDasharray="8 5" />
            <line x1="24" y1="280" x2="376" y2="280" stroke="#263E50" strokeWidth="1.5" />
            <line x1="24" y1="520" x2="376" y2="520" stroke="#263E50" strokeWidth="1.5" />
            <line x1="24" y1="400" x2="376" y2="400" stroke="#244434" strokeWidth="2.5" />
            <line x1="200" y1="30" x2="200" y2="280" stroke="#244434" strokeWidth="1.5" />
            <line x1="200" y1="520" x2="200" y2="770" stroke="#244434" strokeWidth="1.5" />
            <rect x="24" y="280" width="352" height="240" fill="rgba(36,68,52,0.04)" />
          </svg>

          {/* Gentle warm ambient lighting */}
          <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-[#244434]/[0.05] blur-[90px]" />
          <div className="absolute -bottom-24 -right-16 w-80 h-80 rounded-full bg-[#8C3B30]/[0.03] blur-[90px]" />
        </div>

        {/* Content View */}
        <main className={cn(
          "flex-1 relative z-10 no-scrollbar flex flex-col",
          (isLiveMatch || isLeaderboard)
            ? "overflow-hidden p-0" 
            : isMatchView 
              ? "overflow-y-auto pb-4 pt-1 px-1 justify-center"
              : isFirstPageTab
                ? "overflow-y-auto pb-24 pt-2 sm:pt-1 px-1 overscroll-contain"
                : "overflow-y-auto pb-4 pt-1 px-1 overscroll-contain"
        )}>
          <Outlet />
        </main>
        
        {/* Fixed Anchored Floating Natural Pill Navigation Bar */}
        {isFirstPageTab && !isMatchView && Boolean(user) && (
          <nav className="fixed bottom-3.5 inset-x-4 max-w-[390px] mx-auto bg-white/95 backdrop-blur-2xl border border-[#E2DDD4] rounded-full px-3 py-1.5 flex justify-between items-center shadow-[0_8px_30px_rgba(24,40,30,0.08)] z-50">
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
                  ? "text-[#244434] font-bold" 
                  : "text-[#7B8D82] hover:text-[#244434]"
              )
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Floating Elevated Center Button */}
          {isCenter ? (
            <div className="relative group flex flex-col items-center">
              {/* Elevated Center Circular Badge */}
              <div className={cn(
                "relative w-[48px] h-[48px] rounded-full flex items-center justify-center transition-all duration-300 border active:scale-95",
                isActive 
                  ? "bg-gradient-to-b from-[#244434] to-[#1A3326] text-white border-[#244434] shadow-[0_6px_18px_rgba(36,68,52,0.35)] scale-105" 
                  : "bg-[#EBF2EC] text-[#244434] border-[#D1DDD3] shadow-sm group-hover:scale-105 group-hover:border-[#244434]/40"
              )}>
                {/* 🎾 Bouncing Pickleball in Crisp White */}
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
                      ? "bg-white" 
                      : "bg-[#244434]"
                  )}
                />
                
                <div className={cn(
                  "transition-all duration-300 mt-1", 
                  isActive ? "scale-105 text-white" : "text-[#244434]"
                )}>
                  {icon}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative flex flex-col items-center justify-center py-1">
              {/* Icon with scale */}
              <div className={cn(
                "transition-all duration-200", 
                isActive 
                  ? "scale-110 text-[#244434]" 
                  : "text-[#7B8D82] group-hover:text-[#244434]"
              )}>
                {icon}
              </div>

              {/* Label */}
              <span className={cn(
                "text-[10px] tracking-tight mt-0.5 transition-colors duration-200",
                isActive ? "font-black text-[#244434]" : "font-medium text-[#7B8D82]"
              )}>
                {label}
              </span>

              {/* Clean Micro-Dot on Active Tab */}
              {isActive && (
                <motion.div 
                  layoutId="activeNavDot"
                  className="absolute -bottom-1 w-1.5 h-1.5 bg-[#244434] rounded-full"
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
