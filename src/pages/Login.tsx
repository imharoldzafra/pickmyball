import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, LogIn, ArrowRight, Eye, EyeOff, Mail, CheckCircle, X, User, Lock } from 'lucide-react';
import Pickleball3DSphere from '../components/Pickleball3DSphere';
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
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
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
    setInfoMsg(null);
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (authMode === 'signup') {
      if (!displayName.trim()) {
        setErrorMsg('Please choose a username');
        return;
      }
      if (!email.trim()) {
        setErrorMsg('Please enter your email address');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setErrorMsg('Please enter a valid email address');
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
      } else if (res.needsVerification) {
        setInfoMsg(res.message || 'Verification email sent! Please check your inbox.');
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

        {/* Main Content Area */}
        <div className="flex-1 px-5 sm:px-7 py-3 flex flex-col justify-center relative z-10 overflow-hidden">
          
          <div className="w-full max-w-sm mx-auto my-auto space-y-4">
            {/* Top Brand & Dynamic Tagline */}
            <motion.div 
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="text-center space-y-2"
            >
              {/* 🎾 True 3D Rotating Pickleball Sphere (Mobile-Optimized) */}
              <div className="relative flex items-center justify-center py-1">
                <Pickleball3DSphere size={72} />
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  Pick<span className="text-emerald-400 drop-shadow-[0_0_18px_rgba(16,185,129,0.4)]">MyBall</span>
                </h1>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mt-1">
                  {authMode === 'signin' ? 'Ready to Serve.' : 'Join the Arena.'}
                </p>
                <p className="text-[11px] text-text-light/70 font-medium">
                  {authMode === 'signin' 
                    ? 'Sign in to track your matches & climb the ranks.' 
                    : 'Create your player profile & compete on live courts.'}
                </p>
              </div>
            </motion.div>

            {/* Smoked Glass Arena Shield Card */}
            <motion.div
              key={authMode}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-[#070e14]/90 backdrop-blur-2xl p-5 sm:p-6 rounded-3xl border-t border-t-white/20 border-x border-x-white/10 border-b border-b-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.75)] space-y-3.5"
            >
              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-left backdrop-blur-md"
                >
                  <p className="text-xs text-rose-300 font-semibold">{errorMsg}</p>
                </motion.div>
              )}

              {infoMsg && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-left backdrop-blur-md flex items-start gap-2.5"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-300 font-medium leading-relaxed">{infoMsg}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-light/90 mb-1 px-1">
                      Player Username
                    </label>
                    <div className="relative flex items-center">
                      <input 
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. kakarotbomba"
                        className="w-full bg-black/50 border border-white/12 hover:border-white/25 rounded-2xl pl-11 pr-4 py-2.5 sm:py-3 text-sm text-white placeholder:text-white/40 focus:border-primary focus:bg-black/70 focus:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all outline-none font-medium"
                      />
                      <User className="w-4 h-4 text-emerald-400/80 absolute left-4 pointer-events-none" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-text-light/90 mb-1 px-1">
                    {authMode === 'signup' ? 'Email Address' : 'Username / Email'}
                  </label>
                  <div className="relative flex items-center">
                    <input 
                      type={authMode === 'signup' ? 'email' : 'text'}
                      required
                      value={authMode === 'signup' ? email : displayName}
                      onChange={(e) => authMode === 'signup' ? setEmail(e.target.value) : setDisplayName(e.target.value)}
                      placeholder={authMode === 'signup' ? 'player@email.com' : 'e.g. kakarotbomba'}
                      className="w-full bg-black/50 border border-white/12 hover:border-white/25 rounded-2xl pl-11 pr-4 py-2.5 sm:py-3 text-sm text-white placeholder:text-white/40 focus:border-primary focus:bg-black/70 focus:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all outline-none font-medium"
                    />
                    {authMode === 'signup' ? (
                      <Mail className="w-4 h-4 text-cyan-400/80 absolute left-4 pointer-events-none" />
                    ) : (
                      <User className="w-4 h-4 text-emerald-400/80 absolute left-4 pointer-events-none" />
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1 px-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-light/90">
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
                        className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-wider active:scale-95"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-black/50 border border-white/12 hover:border-white/25 rounded-2xl pl-11 pr-11 py-2.5 sm:py-3 text-sm text-white placeholder:text-white/40 focus:border-primary focus:bg-black/70 focus:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all outline-none font-mono"
                    />
                    <Lock className="w-4 h-4 text-emerald-400/80 absolute left-4 pointer-events-none" />
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
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-text-light/90 mb-1 px-1">
                      Confirm Password
                    </label>
                    <div className="relative flex items-center">
                      <input 
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-black/50 border border-white/12 hover:border-white/25 rounded-2xl pl-11 pr-11 py-2.5 sm:py-3 text-sm text-white placeholder:text-white/40 focus:border-primary focus:bg-black/70 focus:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all outline-none font-mono"
                      />
                      <Lock className="w-4 h-4 text-emerald-400/80 absolute left-4 pointer-events-none" />
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

                {/* ⚡ High-Energy Electric Volt CTA Button with Shimmer */}
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full relative overflow-hidden bg-emerald-400 hover:bg-emerald-300 text-[#04080a] py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_35px_rgba(16,185,129,0.65)] transition-all active:scale-[0.97] flex items-center justify-center gap-2 mt-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {/* Sweeping Light Shimmer Reflection */}
                  <motion.div 
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut", repeatDelay: 1.5 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent -skew-x-12 pointer-events-none"
                  />
                  
                  <span className="relative z-10 font-black">
                    {isSubmitting 
                      ? 'Connecting Arena...' 
                      : (authMode === 'signup' ? 'Create Account' : 'Sign In')}
                  </span>
                  {!isSubmitting && (
                    <ArrowRight className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1" />
                  )}
                </button>
              </form>

              {/* Bottom Switcher Toggle Link inside Card */}
              <div className="pt-2 text-center border-t border-white/5">
                <button
                  type="button"
                  onClick={() => handleModeSwitch(authMode === 'signin' ? 'signup' : 'signin')}
                  className="text-xs text-text-light/80 hover:text-white transition-colors active:scale-96"
                >
                  {authMode === 'signin' ? (
                    <span>New to PickMyBall? <strong className="text-emerald-400 font-bold hover:underline ml-1">Create Account</strong></span>
                  ) : (
                    <span>Already have an account? <strong className="text-emerald-400 font-bold hover:underline ml-1">Sign In</strong></span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>

        </div>

        {/* 🔒 Fixed Pinned Footer (Exact Identical Position on Both Sign In & Sign Up) */}
        <div className="relative z-10 text-center py-2.5 flex-shrink-0">
          <p className="text-[10px] text-text-light/35 font-mono tracking-wider">
            PickMyBall Arena Engine • v1.0
          </p>
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

                <div>
                  <h3 className="text-base font-black text-white">Reset Password</h3>
                  <p className="text-[11px] text-text-light/70">PickMyBall Account Recovery</p>
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
