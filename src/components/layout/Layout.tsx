import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Trophy, Users } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>
      
      <nav className="fixed bottom-0 w-full bg-card border-t border-[#ffffff10] px-6 py-3 flex justify-between items-center shadow-[0_-5px_15px_rgba(0,0,0,0.5)] pb-safe">
        <NavItem to="/" icon={<Home className="w-6 h-6" />} label="Home" />
        <NavItem to="/play" icon={<div className="bg-[#0a1111] text-[#14b8a6] p-3 rounded-full -mt-6 shadow-[0_0_15px_rgba(20,184,166,0.5)] border-2 border-[#14b8a6]"><Trophy className="w-6 h-6" /></div>} label="Play" activeClassName="text-primary shadow-[0_0_15px_rgba(20,184,166,0.2)]" />
        <NavItem to="/friends" icon={<Users className="w-6 h-6" />} label="Friends" />
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label, activeClassName = "text-primary" }: { to: string, icon: React.ReactNode, label: string, activeClassName?: string }) {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => 
        cn("nav-btn flex flex-col items-center justify-center space-y-1 text-text-light rounded-xl p-1 transition-colors", isActive ? activeClassName : "hover:text-text-main")
      }
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </NavLink>
  );
}
