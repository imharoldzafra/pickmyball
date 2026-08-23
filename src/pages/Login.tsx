import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Trophy, Zap, Sparkles, UserPlus, LogIn, ArrowRight } from 'lucide-react';
import PickleballPaddle from '../components/icons/PickleballPaddle';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const { user, loginMock, signupMock } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (user) return <Navigate to="/" />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (authMode === 'signup') {
      if (!displayName.trim()) {
        setErrorMsg('Please choose a player nickname');
        return;
      }
      signupMock(displayName.trim(), email.trim());
    } else {
      loginMock(displayName.trim() || 'nasty');
    }
  };

  const handleGuestPlay = () => {
    loginMock('Guest Player');
  };

  return (
    <div className="min-h-screen bg-[#040709] flex justify-center selection:bg-primary/30 relative overflow-hidden">
      {/* Phone Mock Container */}
      <div className="w-full max-w-md min-h-screen flex flex-col bg-[#05080c] relative shadow-[0_0_80px_rgba(0,0,0,0.9)] sm:border-x border-white/5 sm:rounded-3xl overflow-hidden my-0 sm:my-3 sm:max-h-[96vh]">
        
        {/* 🎾 Relaxing Pickleball Court & Floating Aurora Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <svg 
            className="absolute inset-0 w-full h-full opacity-25" 
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 400 800"
            preserveAspectRatio="none"
          >
            <rect x="24" y="30" width="352" height="740" rx="12" fill="none" stroke="rgba(16, 185, 129, 0.45)" strokeWidth="1.5" strokeDasharray="8 5" />
            <line x1="24" y1="280" x2="376" y2="280" stroke="rgba(6, 182, 212, 0.55)" strokeWidth="1.5" />
            <line x1="24" y1="520" x2="376" y2="520" stroke="rgba(6, 182, 212, 0.55)" strokeWidth="1.5" />
            <line x1="24" y1="400" x2="376" y2="400" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="2.5" />
            <line x1="200" y1="30" x2="200" y2="280" stroke="rgba(16, 185, 129, 0.35)" strokeWidth="1.5" />
            <line x1="200" y1="520" x2="200" y2="770" stroke="rgba(16, 185, 129, 0.35)" strokeWidth="1.5" />
            <rect x="24" y="280" width="352" height="240" fill="rgba(16, 185, 129, 0.03)" />
          </svg>

          {/* Sweeping Light Waves */}
          <motion.div 
            animate={{ y: [-300, 850], opacity: [0, 0.6, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
            className="absolute left-0 right-0 h-44 bg-gradient-to-b from-transparent via-emerald-400/10 to-transparent pointer-events-none -skew-y-12"
          />

          {/* Aurora Orbs */}
          <motion.div 
            animate={{ x: [0, 35, -25, 0], y: [0, -25, 20, 0], scale: [1, 1.2, 0.95, 1], opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-16 -left-16 w-80 h-80 rounded-full bg-emerald-500/25 blur-[85px]"
          />
          <motion.div 
            animate={{ x: [0, -35, 25, 0], y: [0, 30, -25, 0], scale: [1, 1.25, 0.9, 1], opacity: [0.25, 0.45, 0.25] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-cyan-500/20 blur-[95px]"
          />
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-between relative z-10 no-scrollbar">
          
          {/* Top Brand & Logo */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center pt-6 pb-4 space-y-3"
          >
            {/* Glowing Pickleball Paddle Logo Badge */}
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-400/20 via-teal-500/10 to-cyan-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_30px_rgba(16,185,129,0.35)] backdrop-blur-md">
              <PickleballPaddle className="w-8 h-8 text-emerald-400" />
            </div>

            <div>
              <h1 className="text-3xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
                Pick<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">MyBall</span>
              </h1>
              <p className="text-xs font-bold uppercase tracking-widest text-text-light/70 mt-1">
                Next-Gen Pickleball Scoring & Rankings
              </p>
            </div>

            {/* Feature Chips */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3" /> Live Ref
              </span>
              <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Trophy className="w-3 h-3" /> ELO Ranks
              </span>
              <span className="text-[10px] font-bold text-orange-300 bg-orange-500/15 border border-orange-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Streaks
              </span>
            </div>
          </motion.div>

          {/* Auth Card (Smoked Crystal Glass) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white/[0.03] backdrop-blur-md p-6 rounded-3xl border-t border-t-white/25 border-x border-x-white/10 border-b border-b-white/5 shadow-[0_12px_40px_rgba(0,0,0,0.4)] my-auto space-y-4"
          >
            {/* Segmented Switcher: Sign In vs Sign Up */}
            <div className="flex bg-white/[0.05] p-1 rounded-full border border-white/10">
              <button
                type="button"
                onClick={() => { setAuthMode('signin'); setErrorMsg(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 active:scale-96 ${
                  authMode === 'signin'
                    ? 'bg-primary text-[#050a0a] font-extrabold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'text-text-light hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setErrorMsg(null); }}
                className={`flex-1 py-2 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-1.5 active:scale-96 ${
                  authMode === 'signup'
                    ? 'bg-primary text-[#050a0a] font-extrabold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'text-text-light hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" /> Create Account
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-left">
                <p className="text-xs text-red-400 font-semibold">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-text-light mb-1 px-1">
                    Player Nickname
                  </label>
                  <input 
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. PickleMaster"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-primary/60 focus:bg-white/[0.06] transition-all outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-text-light mb-1 px-1">
                  {authMode === 'signup' ? 'Email (Optional)' : 'Player Nickname / Email'}
                </label>
                <input 
                  type={authMode === 'signup' ? 'email' : 'text'}
                  value={authMode === 'signup' ? email : displayName}
                  onChange={(e) => authMode === 'signup' ? setEmail(e.target.value) : setDisplayName(e.target.value)}
                  placeholder={authMode === 'signup' ? 'you@email.com' : 'e.g. nasty'}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-primary/60 focus:bg-white/[0.06] transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-text-light mb-1 px-1">
                  Password
                </label>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-primary/60 focus:bg-white/[0.06] transition-all outline-none font-mono"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-[#050a0a] py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-transform active:scale-96 flex items-center justify-center gap-2 mt-2"
              >
                <span>{authMode === 'signup' ? 'Create Account & Play' : 'Sign In to Arena'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-2 text-center border-t border-white/10">
              <button 
                type="button"
                onClick={handleGuestPlay}
                className="text-xs font-bold text-text-light/70 hover:text-emerald-400 transition-colors uppercase tracking-wider inline-flex items-center gap-1.5 active:scale-96"
              >
                <span>⚡ Instant Guest Demo Play</span>
              </button>
            </div>
          </motion.div>

          {/* Footer note */}
          <div className="text-center pt-4 pb-2">
            <p className="text-[10px] text-text-light/40 font-mono">
              PickMyBall Arena Engine • v1.0
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
