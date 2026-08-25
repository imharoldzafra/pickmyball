import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, LogIn, ArrowRight, Eye, EyeOff, Mail, CheckCircle, X, KeyRound } from 'lucide-react';
import PickleballPaddle from '../components/icons/PickleballPaddle';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const { user, signIn, signUp, resetPassword } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  if (user) return <Navigate to="/" />;

  const handleModeSwitch = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setErrorMsg(null);
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (authMode === 'signup') {
      if (!displayName.trim()) {
        setErrorMsg('Please choose a username');
        return;
      }
      if (!password) {
        setErrorMsg('Please enter a password');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password should be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match');
        return;
      }
      
      setIsSubmitting(true);
      const res = await signUp(displayName.trim(), email.trim(), password);
      setIsSubmitting(false);
      
      if (res.error) {
        setErrorMsg(res.error);
      }
    } else {
      if (!displayName.trim()) {
        setErrorMsg('Please enter your username or email');
        return;
      }
      if (!password) {
        setErrorMsg('Please enter your password');
        return;
      }

      setIsSubmitting(true);
      const res = await signIn(displayName.trim(), password);
      setIsSubmitting(false);

      if (res.error) {
        setErrorMsg(res.error);
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg(null);
    if (!forgotEmail.trim()) {
      setForgotMsg('Please enter your registered email address');
      return;
    }

    setIsResetting(true);
    const res = await resetPassword(forgotEmail.trim());
    setIsResetting(false);

    if (res.error) {
      setForgotMsg(res.error);
      setForgotSuccess(false);
    } else {
      setForgotSuccess(true);
      setForgotMsg('Password reset link sent! Please check your email inbox.');
    }
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
        <div className="flex-1 overflow-y-auto p-6 flex flex-col relative z-10 no-scrollbar">
          
          <div className="flex-1 flex flex-col justify-center py-2">
            {/* Top Brand & Logo */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center pt-2 pb-3 space-y-2.5"
            >
              {/* Glowing Pickleball Paddle Logo Badge */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400/20 via-teal-500/10 to-cyan-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_30px_rgba(16,185,129,0.35)] backdrop-blur-md">
                <PickleballPaddle className="w-7 h-7 text-emerald-400" />
              </div>

              <div>
                <h1 className="text-3xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
                  Pick<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">MyBall</span>
                </h1>
                <p className="text-xs font-bold uppercase tracking-widest text-text-light/70 mt-1">
                  Next-Gen Pickleball Scoring & Rankings
                </p>
              </div>
            </motion.div>

            {/* Auth Card (Smoked Crystal Glass) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white/[0.03] backdrop-blur-md p-6 rounded-3xl border-t border-t-white/25 border-x border-x-white/10 border-b border-b-white/5 shadow-[0_12px_40px_rgba(0,0,0,0.4)] mt-5 space-y-4"
            >
              {/* Segmented Switcher: Sign In vs Sign Up */}
              <div className="flex bg-white/[0.05] p-1 rounded-full border border-white/10">
                <button
                  type="button"
                  onClick={() => handleModeSwitch('signin')}
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
                  onClick={() => handleModeSwitch('signup')}
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
                      Username
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
                    {authMode === 'signup' ? 'Email (Optional)' : 'Username / Email'}
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
                  <div className="flex items-center justify-between mb-1 px-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-light">
                      Password
                    </label>
                    {authMode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotModal(true);
                          setForgotEmail(email || displayName.includes('@') ? displayName : '');
                          setForgotMsg(null);
                          setForgotSuccess(false);
                        }}
                        className="text-[10px] font-bold text-emerald-400/80 hover:text-emerald-300 transition-colors uppercase tracking-wider active:scale-96"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/[0.04] border border-white/10 rounded-2xl pl-4 pr-11 py-3 text-sm text-white placeholder:text-white/30 focus:border-primary/60 focus:bg-white/[0.06] transition-all outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-text-light/60 hover:text-white transition-colors p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {authMode === 'signup' && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-light mb-1 px-1">
                      Confirm Password
                    </label>
                    <div className="relative flex items-center">
                      <input 
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-2xl pl-4 pr-11 py-3 text-sm text-white placeholder:text-white/30 focus:border-primary/60 focus:bg-white/[0.06] transition-all outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 text-text-light/60 hover:text-white transition-colors p-1"
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-[#050a0a] py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-transform active:scale-96 flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>
                    {isSubmitting 
                      ? 'Connecting Arena...' 
                      : (authMode === 'signup' ? 'Create Account & Play' : 'Sign In to Arena')}
                  </span>
                  {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </motion.div>
          </div>

          {/* Footer note pinned cleanly at bottom */}
          <div className="text-center pt-2 pb-1 mt-auto">
            <p className="text-[10px] text-text-light/35 font-mono tracking-wider">
              PickMyBall Arena Engine • v1.0
            </p>
          </div>

        </div>

        {/* 🔒 Forgot Password Modal */}
        <AnimatePresence>
          {showForgotModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-6"
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0, y: 10 }}
                className="w-full max-w-sm bg-[#0a1015] border border-white/15 rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative space-y-4"
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="absolute top-4 right-4 text-text-light/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Reset Password</h3>
                    <p className="text-[11px] text-text-light/70">PickMyBall Account Recovery</p>
                  </div>
                </div>

                <p className="text-xs text-text-light/80 leading-relaxed">
                  Enter your registered email address and we'll send you a secure link to reset your password.
                </p>

                {forgotMsg && (
                  <div className={`p-3 rounded-2xl text-xs flex items-start gap-2 ${
                    forgotSuccess 
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300' 
                      : 'bg-red-500/15 border border-red-500/30 text-red-300'
                  }`}>
                    {forgotSuccess && <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />}
                    <p className="font-medium">{forgotMsg}</p>
                  </div>
                )}

                {!forgotSuccess ? (
                  <form onSubmit={handleForgotPassword} className="space-y-3 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-text-light mb-1 px-1">
                        Your Email Address
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="player@email.com"
                          className="w-full bg-white/[0.04] border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-primary/60 focus:bg-white/[0.06] transition-all outline-none"
                        />
                        <Mail className="w-4 h-4 text-text-light/50 absolute left-3.5 pointer-events-none" />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(false)}
                        className="flex-1 py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] text-text-light hover:text-white text-xs font-bold transition-all active:scale-96"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isResetting}
                        className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-[#050a0a] text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-transform active:scale-96 disabled:opacity-50"
                      >
                        {isResetting ? 'Sending...' : 'Send Link'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="w-full py-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.12] text-white text-xs font-bold transition-all active:scale-96"
                    >
                      Back to Sign In
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
