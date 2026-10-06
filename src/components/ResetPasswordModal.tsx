import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, CheckCircle, ShieldCheck, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ResetPasswordModal() {
  const { isPasswordRecovery, setIsPasswordRecovery, updateUserPassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isPasswordRecovery) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!password) {
      setErrorMsg('Please enter a new password');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    const res = await updateUserPassword(password);
    setIsSubmitting(false);

    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setSuccessMsg('Your password has been updated successfully!');
      setTimeout(() => {
        setIsPasswordRecovery(false);
        setPassword('');
        setConfirmPassword('');
      }, 2000);
    }
  };

  const handleClose = () => {
    if (window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery')) {
      window.history.replaceState(null, '', window.location.pathname);
    }
    setIsPasswordRecovery(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="w-full max-w-sm bg-white border border-[#E2DDD4] rounded-3xl p-6 shadow-2xl relative space-y-4 overflow-hidden"
        >

          {/* Close Button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 text-[#6B7E72] hover:text-[#18281E] p-1.5 rounded-full hover:bg-[#F8F7F3] transition-colors z-10 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center space-y-1.5 pt-2">
            <div className="w-12 h-12 rounded-2xl bg-[#EAF4ED] border border-[#C8DFD0] flex items-center justify-center mx-auto text-[#244434] shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black text-[#18281E] tracking-tight">
              Create New Password
            </h2>
            <p className="text-xs text-[#6B7E72] max-w-[260px] mx-auto">
              Choose a secure password for your PickMyBall account.
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-[#FDF3F1] border border-[#F2D2CC] rounded-xl text-left"
            >
              <p className="text-xs text-[#8C3B30] font-semibold">{errorMsg}</p>
            </motion.div>
          )}

          {/* Success Message */}
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3.5 bg-[#EAF4ED] border border-[#C8DFD0] rounded-xl text-left flex items-center gap-2.5"
            >
              <CheckCircle className="w-5 h-5 text-[#244434] shrink-0" />
              <p className="text-xs text-[#244434] font-medium">{successMsg}</p>
            </motion.div>
          )}

          {/* Password Form */}
          {!successMsg && (
            <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B7E72] mb-1 px-1">
                  New Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full bg-[#F8F7F3] border border-[#E2DDD4] focus:border-[#244434] focus:bg-white rounded-xl pl-11 pr-11 py-3 text-sm text-[#18281E] placeholder-[#9BAAA0] transition-all outline-none"
                  />
                  <Lock className="w-4 h-4 text-[#244434]/70 absolute left-4 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-[#6B7E72] hover:text-[#18281E] transition-colors p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B7E72] mb-1 px-1">
                  Confirm New Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full bg-[#F8F7F3] border border-[#E2DDD4] focus:border-[#244434] focus:bg-white rounded-xl pl-11 pr-11 py-3 text-sm text-[#18281E] placeholder-[#9BAAA0] transition-all outline-none"
                  />
                  <Lock className="w-4 h-4 text-[#244434]/70 absolute left-4 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 text-[#6B7E72] hover:text-[#18281E] transition-colors p-1"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full relative overflow-hidden bg-[#244434] hover:bg-[#1A3326] text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4 disabled:opacity-50 group cursor-pointer"
              >
                {/* Sweeping Light Shimmer Reflection */}
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut", repeatDelay: 1.5 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent -skew-x-12 pointer-events-none"
                />

                <span className="relative z-10 font-black">
                  {isSubmitting ? 'Updating Password...' : 'Save New Password'}
                </span>
                {!isSubmitting && (
                  <ArrowRight className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1" />
                )}
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
