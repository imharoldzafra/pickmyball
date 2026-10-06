import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowRight, Eye, EyeOff, Mail, CheckCircle, X, User, Lock, ShieldAlert } from 'lucide-react';
import Pickleball3DSphere from '../components/Pickleball3DSphere';
import { motion, AnimatePresence } from 'framer-motion';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 3 * 60 * 1000; // 3 minutes lockout
const RATE_LIMIT_STORAGE_KEY = 'pkb_auth_rate_limit';

const formatCooldown = (totalSeconds: number): string => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
};

const formatErrorWithExclamation = (text: string): string => {
  const cleaned = text.trim().replace(/[.!]+$/, '');
  return `${cleaned}!`;
};

export default function Login() {
  const { user, signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const handleQuickOfflineScoreboard = () => {
    sessionStorage.setItem('pkb_guest_offline', 'true');
    navigate('/play?action=create');
  };
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorField, setErrorField] = useState<'identifier' | 'password' | 'username' | 'email' | 'confirmPassword' | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bot Protection (Honeypot)
  const [honeypot, setHoneypot] = useState('');

  // Rate Limiting & Security Lockout State
  const [lockoutSecondsLeft, setLockoutSecondsLeft] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.lockedUntil && parsed.lockedUntil > Date.now()) {
          return Math.ceil((parsed.lockedUntil - Date.now()) / 1000);
        }
      }
    } catch {
      // ignore
    }
    return 0;
  });

  // Countdown timer effect for lockout
  useEffect(() => {
    if (lockoutSecondsLeft <= 0) return;

    const timer = setInterval(() => {
      setLockoutSecondsLeft((prev) => {
        if (prev <= 1) {
          // Lockout ended, reset attempts in localStorage
          try {
            localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify({ attempts: 0, lockedUntil: null }));
          } catch {
            // ignore
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutSecondsLeft]);

  // 🔑 Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Check if user opened an expired/invalid reset link
  useEffect(() => {
    const hash = window.location.hash;
    const search = window.location.search;
    if (
      hash.includes('error=access_denied') || 
      hash.includes('otp_expired') || 
      search.includes('error=access_denied') || 
      search.includes('otp_expired')
    ) {
      setErrorMsg('This password reset link has expired or has already been used. Please request a fresh one below.');
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  if (user) return <Navigate to="/" />;

  const handleModeSwitch = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setErrorMsg(null);
    setErrorField(null);
    setInfoMsg(null);
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const recordFailedAttempt = (errorMessage: string, field?: 'identifier' | 'password') => {
    setErrorField(field || null);
    try {
      let currentAttempts = 0;
      const stored = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        currentAttempts = Number(parsed.attempts) || 0;
      }

      const nextAttempts = currentAttempts + 1;

      if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
        const lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
        localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify({ attempts: nextAttempts, lockedUntil }));
        setLockoutSecondsLeft(Math.ceil(LOCKOUT_DURATION_MS / 1000));
        setErrorField(null);
        setErrorMsg(null);
      } else {
        localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify({ attempts: nextAttempts, lockedUntil: null }));
        const remaining = MAX_FAILED_ATTEMPTS - nextAttempts;
        if (remaining <= 2) {
          setErrorMsg(`${errorMessage} • ${remaining} attempt${remaining === 1 ? '' : 's'} left`);
        } else {
          setErrorMsg(errorMessage);
        }
      }
    } catch {
      setErrorMsg(errorMessage);
    }
  };

  const clearFailedAttempts = () => {
    try {
      localStorage.removeItem(RATE_LIMIT_STORAGE_KEY);
    } catch {
      // ignore
    }
    setLockoutSecondsLeft(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    // Bot detection check
    if (honeypot.trim() !== '') {
      setErrorMsg('Automated submission detected');
      return;
    }

    if (authMode === 'signup') {
      const trimmedName = displayName.trim();
      if (!trimmedName) {
        setErrorMsg('Please choose a username');
        setErrorField('username');
        return;
      }
      if (trimmedName.length < 2) {
        setErrorMsg('Username must be at least 2 characters');
        setErrorField('username');
        return;
      }
      const finalEmail = email.trim();
      if (!finalEmail) {
        setErrorMsg('Please enter your email address');
        setErrorField('email');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(finalEmail)) {
        setErrorMsg('Please enter a valid email address');
        setErrorField('email');
        return;
      }
      if (!password) {
        setErrorMsg('Please enter a password');
        setErrorField('password');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password should be at least 6 characters');
        setErrorField('password');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match');
        setErrorField('confirmPassword');
        return;
      }

      setIsSubmitting(true);
      const res = await signUp(trimmedName, finalEmail, password);
      setIsSubmitting(false);

      if (res.error) {
        setErrorMsg(res.error);
        if (res.errorField) {
          setErrorField(res.errorField);
        }
      } else if (res.needsVerification) {
        setInfoMsg(res.message || 'Verification email sent! Please check your inbox.');
      }
    } else {
      // Sign In Flow (Username only)
      if (lockoutSecondsLeft > 0) {
        setErrorMsg(`Account locked • Retry in ${formatCooldown(lockoutSecondsLeft)}`);
        return;
      }

      const trimmedUser = displayName.trim();
      if (!trimmedUser) {
        setErrorMsg('Please enter your username');
        setErrorField('identifier');
        return;
      }
      if (trimmedUser.includes('@')) {
        setErrorMsg('Please enter your username, not your email');
        setErrorField('identifier');
        return;
      }
      if (!password) {
        setErrorMsg('Please enter your password');
        setErrorField('password');
        return;
      }

      setIsSubmitting(true);
      const res = await signIn(trimmedUser, password);
      setIsSubmitting(false);

      if (res.error) {
        recordFailedAttempt(res.error, res.errorField);
      } else {
        clearFailedAttempts();
        setErrorField(null);
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg(null);
    const cleaned = forgotEmail.trim();
    if (!cleaned) {
      setForgotMsg('Please enter your registered email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleaned)) {
      setForgotMsg('Please enter a valid email address');
      return;
    }

    setIsResetting(true);
    const res = await resetPassword(cleaned);
    setIsResetting(false);

    if (res.error) {
      setForgotMsg(res.error);
      setForgotSuccess(false);
    } else {
      setForgotSuccess(true);
      setForgotMsg('Password reset link sent! Please check your email inbox and click the reset link.');
    }
  };

  return (
    <div className="min-h-screen bg-[#EBE8E1] flex justify-center selection:bg-[#244434]/20 relative overflow-hidden">
      {/* Phone Mock Container */}
      <div className="w-full max-w-md min-h-screen flex flex-col bg-[#F7F6F1] relative shadow-[0_10px_40px_rgba(24,40,30,0.08)] sm:border-x border-[#E2DDD4] sm:rounded-3xl overflow-hidden my-0 sm:my-3 sm:max-h-[96vh]">

        {/* 🎾 Gentle Court Lines & Natural Ambient Background */}
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
            <rect x="24" y="280" width="352" height="240" fill="rgba(36, 68, 52, 0.04)" />
          </svg>

          {/* Soft Court Ambient Lighting */}
          <div className="absolute -top-16 -left-16 w-80 h-80 rounded-full bg-[#244434]/[0.06] blur-[85px]" />
          <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-[#8C3B30]/[0.04] blur-[95px]" />
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
              {/* 🎾 True 3D Rotating Pickleball Sphere in Tournament Optic Lime */}
              <div className="relative flex items-center justify-center py-1">
                <Pickleball3DSphere size={74} />
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#244434]">
                  PickMyBall
                </h1>
                <p className="text-xs font-bold uppercase tracking-widest text-[#3B6B50] mt-1">
                  {authMode === 'signin' ? 'Ready to Serve.' : 'Join the Arena.'}
                </p>
                <p className="text-[11px] text-[#6B7E72] font-medium">
                  {authMode === 'signin'
                    ? 'Sign in to track your matches & climb the ranks.'
                    : 'Create your player profile & compete on live courts.'}
                </p>
              </div>
            </motion.div>

            {/* Elevated Crisp Court Card */}
            <motion.div
              key={authMode}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white/95 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-[#E2DDD4] shadow-[0_12px_40px_rgba(24,40,30,0.06)] space-y-3.5"
            >

              {infoMsg && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3.5 bg-[#EBF2EC] border border-[#C6D8CB] rounded-2xl text-left flex items-start gap-2.5"
                >
                  <CheckCircle className="w-4 h-4 text-[#244434] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#244434] font-medium leading-relaxed">{infoMsg}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* 🛡️ Hidden Honeypot Field for Bot Protection */}
                <input
                  type="text"
                  name="b_profile_validation"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden absolute -left-[9999px]"
                  aria-hidden="true"
                />

                {authMode === 'signup' && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#3A4C40] mb-1 px-1">
                      Player Username
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => {
                          setDisplayName(e.target.value);
                          if (errorMsg && errorField === 'username') {
                            setErrorMsg(null);
                            setErrorField(null);
                          }
                        }}
                        placeholder="e.g. kakarotbomba"
                        className={`w-full bg-[#F8F7F3] border rounded-2xl pl-11 pr-4 py-2.5 sm:py-3 text-sm text-[#18281E] placeholder:text-[#94A49A] focus:bg-white transition-all outline-none font-medium ${
                          errorField === 'username'
                            ? 'border-rose-500 focus:border-rose-400'
                            : 'border-[#E2DDD4] hover:border-[#C6D8CB] focus:border-[#244434]'
                        }`}
                      />
                      <User className="w-4 h-4 text-[#3B6B50] absolute left-4 pointer-events-none" />
                    </div>
                    {errorField === 'username' && errorMsg && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[11px] font-semibold text-rose-500 mt-1.5 px-1 leading-tight"
                      >
                        {formatErrorWithExclamation(errorMsg)}
                      </motion.p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#3A4C40] mb-1 px-1">
                    {authMode === 'signup' ? 'Email Address' : 'Username'}
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={authMode === 'signup' ? 'email' : 'text'}
                      required
                      disabled={isSubmitting || (authMode === 'signin' && lockoutSecondsLeft > 0)}
                      value={authMode === 'signup' ? email : displayName}
                      onChange={(e) => {
                        if (authMode === 'signup') {
                          setEmail(e.target.value);
                          if (errorMsg && errorField === 'email') {
                            setErrorMsg(null);
                            setErrorField(null);
                          }
                        } else {
                          setDisplayName(e.target.value);
                          if (errorMsg && errorField === 'identifier') {
                            setErrorMsg(null);
                            setErrorField(null);
                          }
                        }
                      }}
                      placeholder={authMode === 'signup' ? 'player@email.com' : 'e.g. imharoldzafra'}
                      className={`w-full bg-[#F8F7F3] border rounded-2xl pl-11 pr-4 py-2.5 sm:py-3 text-sm text-[#18281E] placeholder:text-[#94A49A] focus:bg-white transition-all outline-none font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                        ((authMode === 'signin' && errorField === 'identifier') || (authMode === 'signup' && errorField === 'email')) && lockoutSecondsLeft === 0
                          ? 'border-rose-500 focus:border-rose-400'
                          : 'border-[#E2DDD4] hover:border-[#C6D8CB] focus:border-[#244434]'
                      }`}
                    />
                    {authMode === 'signup' ? (
                      <Mail className="w-4 h-4 text-[#263E50] absolute left-4 pointer-events-none" />
                    ) : (
                      <User className="w-4 h-4 text-[#3B6B50] absolute left-4 pointer-events-none" />
                    )}
                  </div>
                  {lockoutSecondsLeft === 0 && ((authMode === 'signin' && errorField === 'identifier') || (authMode === 'signup' && errorField === 'email')) && errorMsg && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[11px] font-semibold text-rose-500 mt-1.5 px-1 leading-tight"
                    >
                      {formatErrorWithExclamation(errorMsg)}
                    </motion.p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1 px-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#3A4C40]">
                      Password
                    </label>
                    {authMode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotModal(true);
                          setForgotEmail(email || '');
                          setForgotMsg(null);
                          setForgotSuccess(false);
                        }}
                        className="text-[10px] font-bold text-[#244434] hover:text-[#1A3326] transition-colors uppercase tracking-wider active:scale-95"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      disabled={isSubmitting || (authMode === 'signin' && lockoutSecondsLeft > 0)}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errorMsg && errorField === 'password') {
                          setErrorMsg(null);
                          setErrorField(null);
                        }
                      }}
                      placeholder="••••••••"
                      className={`w-full bg-[#F8F7F3] border rounded-2xl pl-11 pr-11 py-2.5 sm:py-3 text-sm text-[#18281E] placeholder:text-[#94A49A] focus:bg-white transition-all outline-none font-mono disabled:opacity-50 disabled:cursor-not-allowed ${
                        errorField === 'password' && lockoutSecondsLeft === 0
                          ? 'border-rose-500 focus:border-rose-400'
                          : 'border-[#E2DDD4] hover:border-[#C6D8CB] focus:border-[#244434]'
                      }`}
                    />
                    <Lock className="w-4 h-4 text-[#3B6B50] absolute left-4 pointer-events-none" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-[#7B8D82] hover:text-[#18281E] transition-colors p-1"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {lockoutSecondsLeft === 0 && errorField === 'password' && errorMsg && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[11px] font-semibold text-rose-500 mt-1.5 px-1 leading-tight"
                    >
                      {formatErrorWithExclamation(errorMsg)}
                    </motion.p>
                  )}
                </div>

                {authMode === 'signup' && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#3A4C40] mb-1 px-1">
                      Confirm Password
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (errorMsg && errorField === 'confirmPassword') {
                            setErrorMsg(null);
                            setErrorField(null);
                          }
                        }}
                        placeholder="••••••••"
                        className={`w-full bg-[#F8F7F3] border rounded-2xl pl-11 pr-11 py-2.5 sm:py-3 text-sm text-[#18281E] placeholder:text-[#94A49A] focus:bg-white transition-all outline-none font-mono ${
                          errorField === 'confirmPassword'
                            ? 'border-rose-500 focus:border-rose-400'
                            : 'border-[#E2DDD4] hover:border-[#C6D8CB] focus:border-[#244434]'
                        }`}
                      />
                      <Lock className="w-4 h-4 text-[#3B6B50] absolute left-4 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 text-[#7B8D82] hover:text-[#18281E] transition-colors p-1"
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errorField === 'confirmPassword' && errorMsg && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[11px] font-semibold text-rose-500 mt-1.5 px-1 leading-tight"
                      >
                        {formatErrorWithExclamation(errorMsg)}
                      </motion.p>
                    )}
                  </div>
                )}

                {/* General fallback error if not tied to specific input column */}
                {lockoutSecondsLeft === 0 && !errorField && errorMsg && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[11px] font-semibold text-rose-500 text-center px-1 leading-tight"
                  >
                    {formatErrorWithExclamation(errorMsg)}
                  </motion.p>
                )}

                {authMode === 'signin' && lockoutSecondsLeft > 0 ? (
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    tabIndex={-1}
                    className="w-full py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 mt-3 bg-rose-50 border border-rose-200 text-rose-600 shadow-none cursor-not-allowed select-none transition-none"
                  >
                    <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="font-mono font-bold tracking-wider">LOCKED ({formatCooldown(lockoutSecondsLeft)})</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full relative overflow-hidden py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 mt-3 group ${
                      isSubmitting
                        ? 'bg-[#244434]/70 text-white cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#244434] to-[#1A3326] hover:from-[#1A3326] hover:to-[#244434] text-white shadow-[0_4px_16px_rgba(36,68,52,0.25)] active:scale-[0.98]'
                    }`}
                  >
                    <span className="relative z-10 font-black">
                      {isSubmitting ? 'Connecting Arena...' : (authMode === 'signup' ? 'Create Account' : 'Sign In')}
                    </span>
                    {!isSubmitting && (
                      <ArrowRight className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1" />
                    )}
                  </button>
                )}
              </form>

              {/* Bottom Switcher Toggle Link inside Card */}
              <div className="pt-2 text-center border-t border-[#E2DDD4]">
                <p className="text-xs text-[#6B7E72]">
                  {authMode === 'signin' ? (
                    <>
                      <span>New to PickMyBall?</span>
                      <button
                        type="button"
                        onClick={() => handleModeSwitch('signup')}
                        className="text-[#244434] hover:text-[#1A3326] font-bold hover:underline transition-colors ml-1.5 focus:outline-none focus:underline"
                      >
                        Create Account
                      </button>
                    </>
                  ) : (
                    <>
                      <span>Already have an account?</span>
                      <button
                        type="button"
                        onClick={() => handleModeSwitch('signin')}
                        className="text-[#244434] hover:text-[#1A3326] font-bold hover:underline transition-colors ml-1.5 focus:outline-none focus:underline"
                      >
                        Sign In
                      </button>
                    </>
                  )}
                </p>
              </div>

              {/* ⚡ Quick Offline Scoreboard (Court Utility without Login) */}
              <div className="pt-2 text-center border-t border-[#E2DDD4]">
                <button
                  type="button"
                  onClick={handleQuickOfflineScoreboard}
                  className="w-full py-2.5 px-3 rounded-xl border border-[#D1DDD3] hover:border-[#244434]/40 bg-[#EBF2EC] hover:bg-[#E0EBE2] text-[#244434] transition-all text-xs font-bold flex items-center justify-center active:scale-[0.98]"
                >
                  Quick Offline Scoreboard
                </button>
              </div>
            </motion.div>
          </div>

        </div>



        {/* 🔒 Reset Password Modal */}
        <AnimatePresence>
          {showForgotModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-[#18281E]/60 backdrop-blur-sm flex items-center justify-center p-5"
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0, y: 10 }}
                className="w-full max-w-sm bg-white border border-[#E2DDD4] rounded-3xl p-6 shadow-[0_20px_60px_rgba(24,40,30,0.2)] relative space-y-4"
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotMsg(null);
                    setForgotSuccess(false);
                  }}
                  className="absolute top-4 right-4 text-[#7B8D82] hover:text-[#18281E] p-1 rounded-full hover:bg-[#F3F1EB] transition-colors z-10"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div>
                  <h3 className="text-base font-black text-[#18281E]">Reset Password</h3>
                  <p className="text-[11px] text-[#6B7E72]">PickMyBall Account Recovery</p>
                </div>

                {!forgotSuccess && (
                  <p className="text-xs text-[#3A4C40] leading-relaxed">
                    Enter your registered email address and we'll send you a secure link to choose a new password.
                  </p>
                )}

                {/* Status / Error Message */}
                {forgotMsg && (
                  <div
                    className={`p-3 rounded-2xl text-xs flex items-start gap-2 ${
                      forgotSuccess
                        ? 'bg-[#EBF2EC] border border-[#C6D8CB] text-[#244434]'
                        : 'bg-rose-50 border border-rose-200 text-rose-600'
                    }`}
                  >
                    {forgotSuccess && <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#244434]" />}
                    <p className="font-medium leading-tight">{forgotMsg}</p>
                  </div>
                )}

                {!forgotSuccess ? (
                  <form onSubmit={handleForgotPassword} className="space-y-3 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#3A4C40] mb-1 px-1">
                        Your Email Address
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="player@email.com"
                          className="w-full bg-[#F8F7F3] border border-[#E2DDD4] rounded-2xl pl-10 pr-4 py-3 text-sm text-[#18281E] placeholder:text-[#94A49A] focus:border-[#244434] focus:bg-white transition-all outline-none"
                        />
                        <Mail className="w-4 h-4 text-[#3B6B50] absolute left-3.5 pointer-events-none" />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(false)}
                        className="flex-1 py-3 rounded-2xl bg-[#F3F1EB] hover:bg-[#EAE6DE] text-[#3A4C40] text-xs font-bold transition-all active:scale-96"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isResetting}
                        className="flex-1 py-3 rounded-2xl bg-[#244434] hover:bg-[#1A3326] text-white text-xs font-black uppercase tracking-wider shadow-sm transition-transform active:scale-96 disabled:opacity-50"
                      >
                        {isResetting ? 'Sending...' : 'Send Reset Link'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotModal(false);
                        setForgotSuccess(false);
                        setForgotMsg(null);
                      }}
                      className="w-full py-3 rounded-2xl bg-[#244434] hover:bg-[#1A3326] text-white text-xs font-bold transition-all active:scale-96"
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
