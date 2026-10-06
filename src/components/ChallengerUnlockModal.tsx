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
        {/* Soft Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#18281E]/60 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-white border border-[#E2DDD4] p-6 shadow-2xl z-10 text-center"
        >
          {/* Header Texts */}
          <div className="space-y-1.5 mb-5 pt-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#244434] bg-[#EBF2EC] border border-[#C6D8CB] px-2.5 py-0.5 rounded-full inline-block">
              Division Promotion
            </span>
            <h2 className="text-xl font-black text-[#18281E] tracking-tight pt-1">
              Welcome to the Big Leagues!
            </h2>
            <p className="text-xs text-[#6B7E72] leading-relaxed px-2">
              You’ve officially graduated from the Rookie Sandbox and stepped into official competitive play.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="space-y-2.5 text-left mb-6">
            <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-[#F8F7F3] border border-[#E2DDD4]">
              <div className="p-1.5 rounded-xl bg-[#EBF2EC] border border-[#C6D8CB] text-[#244434] shrink-0 mt-0.5">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#18281E]">100% Court Stamina</h4>
                <p className="text-[10px] text-[#6B7E72]">
                  Daily ranked energy resets every morning (5 full matches).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-[#F8F7F3] border border-[#E2DDD4]">
              <div className="p-1.5 rounded-xl bg-[#EBF2EC] border border-[#C6D8CB] text-[#244434] shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#18281E]">+10% Win Refund</h4>
                <p className="text-[10px] text-[#6B7E72]">
                  Winning preserves momentum and refunds half your match cost.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-[#F8F7F3] border border-[#E2DDD4]">
              <div className="p-1.5 rounded-xl bg-[#EDF3F7] border border-[#C8D6E0] text-[#263E50] shrink-0 mt-0.5">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#18281E]">+20% Referee Bonus</h4>
                <p className="text-[10px] text-[#6B7E72]">
                  Volunteer to ref matches for others to recharge your battery.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#244434] to-[#1A3326] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all shadow-md"
          >
            <span>Step on the Court</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
