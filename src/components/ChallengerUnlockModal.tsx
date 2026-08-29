import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Trophy, ShieldCheck, Flame, Users, Sparkles, ArrowRight } from 'lucide-react';

interface ChallengerUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChallengerUnlockModal({ isOpen, onClose }: ChallengerUnlockModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-[#091313] border border-emerald-400/40 p-6 shadow-[0_0_50px_rgba(16,185,129,0.35)] z-10 text-center"
        >
          {/* Ambient Top Glow */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/25 rounded-full blur-3xl pointer-events-none" />

          {/* Header Texts */}
          <div className="space-y-1.5 mb-5 pt-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-400/25 px-2.5 py-0.5 rounded-full inline-block">
              Division Promotion
            </span>
            <h2 className="text-xl font-black text-white tracking-tight pt-1">
              Welcome to the Big Leagues!
            </h2>
            <p className="text-xs text-text-light/70 leading-relaxed px-2">
              You’ve officially graduated from the Rookie Sandbox and stepped into official competitive play.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="space-y-2.5 text-left mb-6">
            <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="p-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 shrink-0 mt-0.5">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">100% Court Stamina</h4>
                <p className="text-[10px] text-text-light/60">
                  Daily ranked energy resets every morning (5 full matches).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="p-1.5 rounded-xl bg-teal-500/15 border border-teal-400/30 text-teal-300 shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">+10% Win Refund</h4>
                <p className="text-[10px] text-text-light/60">
                  Winning preserves momentum and refunds half your match cost.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="p-1.5 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 shrink-0 mt-0.5">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">+20% Referee Bonus</h4>
                <p className="text-[10px] text-text-light/60">
                  Volunteer to ref matches for others to recharge your battery.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]"
          >
            <span>Step on the Court</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
