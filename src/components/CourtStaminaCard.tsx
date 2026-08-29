import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  ShieldCheck, 
  Flame, 
  Info, 
  Sparkles,
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ChallengerUnlockModal from './ChallengerUnlockModal';

export default function CourtStaminaCard() {
  const { profile } = useAuth();
  const [showCoachTips, setShowCoachTips] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  if (!profile) return null;

  const rating = profile.rating || 0;
  const isChallengerOrHigher = rating >= 800;
  const stamina = isChallengerOrHigher ? (profile.stamina ?? 100) : 100;
  const matchesRemaining = Math.ceil(stamina / 20);
  const isSecondWind = isChallengerOrHigher && stamina === 0;

  // Trigger celebration modal when stepping on Challenger for the first time
  useEffect(() => {
    if (isChallengerOrHigher) {
      const hasSeen = localStorage.getItem('hasSeenChallengerIntroModal');
      if (!hasSeen) {
        setShowUnlockModal(true);
        localStorage.setItem('hasSeenChallengerIntroModal', 'true');
      }
    }
  }, [isChallengerOrHigher]);

  // Visual battery color calculation
  const getBatteryColor = () => {
    if (!isChallengerOrHigher) return 'from-emerald-400 to-teal-400';
    if (stamina > 50) return 'from-emerald-400 to-teal-300';
    if (stamina > 20) return 'from-amber-400 to-yellow-300';
    return 'from-rose-500 to-amber-500';
  };

  const getBatteryGlow = () => {
    if (!isChallengerOrHigher) return 'rgba(16, 185, 129, 0.4)';
    if (stamina > 50) return 'rgba(16, 185, 129, 0.5)';
    if (stamina > 20) return 'rgba(251, 191, 36, 0.5)';
    return 'rgba(244, 63, 94, 0.5)';
  };

  // ---------------------------------------------------------------------------
  // 🌱 ROOKIE SANDBOX (< 800 CR): Hide stamina card completely for Rookies!
  // ---------------------------------------------------------------------------
  if (!isChallengerOrHigher) {
    return (
      <ChallengerUnlockModal 
        isOpen={showUnlockModal} 
        onClose={() => setShowUnlockModal(false)} 
      />
    );
  }

  return (
    <>
      <ChallengerUnlockModal 
        isOpen={showUnlockModal} 
        onClose={() => setShowUnlockModal(false)} 
      />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="relative overflow-hidden rounded-3xl bg-white/[0.03] backdrop-blur-2xl border-t border-t-white/20 border-x border-x-white/10 border-b border-b-white/5 p-5 shadow-[0_12px_40px_0_rgba(0,0,0,0.4)] space-y-4"
      >
        {/* Background Ambient Glow */}
        <div 
          className="absolute -top-10 -left-10 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-700"
          style={{ backgroundColor: getBatteryGlow() }}
        />

      {/* Header with Title and Mode Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-white/[0.05] border border-white/10 text-primary shadow-inner">
            <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400/30" />
          </div>
          <div>
            <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
              Court Stamina
            </h3>
            <p className="text-[10px] font-bold uppercase tracking-wider text-text-light/60">
              Daily Ranked Energy
            </p>
          </div>
        </div>
      </div>

      {/* Main Stamina Gauge or Rookie Sandbox Banner */}
      <div className="relative z-10 space-y-2">
        {!isChallengerOrHigher ? (
          /* Rookie Sandbox View */
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-black text-emerald-300">
              <span>Unlimited Court Play Active</span>
              <span>100% Free</span>
            </div>
            <p className="text-xs text-text-light leading-relaxed">
              You are in the <strong className="text-white">Rookie Sandbox</strong>! Play as many ranked matches as you want with zero stamina limits. Reach <strong className="text-emerald-400">Challenger (800 CR)</strong> to enter the Competitive Ranked League!
            </p>
          </div>
        ) : (
          /* Challenger+ Battery Gauge */
          <>
            {/* Battery Progress Bar & Segments */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-text-light flex items-center gap-1">
                  {isSecondWind ? (
                    <span className="text-amber-400 font-extrabold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> High Stakes Mode
                    </span>
                  ) : (
                    <span>{matchesRemaining} {matchesRemaining === 1 ? 'Ranked Match' : 'Ranked Matches'} Left</span>
                  )}
                </span>
                <span className="font-mono font-bold text-white text-xs">
                  {stamina} / 100%
                </span>
              </div>

              {/* 5-Segment Battery Meter (Unified Fluid Flow with 5 Distinct Match Windows) */}
              <div className="relative h-3.5 w-full bg-black/50 backdrop-blur-md rounded-full border border-white/10 p-0.5 overflow-hidden flex items-center">
                {/* 1. Underlying Continuous Liquid Stamina Bar (Smooth right-to-left drain) */}
                <motion.div 
                  initial={false}
                  animate={{ width: `${stamina}%` }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className={`h-full rounded-full bg-gradient-to-r ${getBatteryColor()} ${
                    stamina > 0 ? 'shadow-[0_0_12px_rgba(16,185,129,0.5)]' : ''
                  }`}
                />

                {/* 2. Precision Segment Notches (Dividing into 5 Matches at 20%, 40%, 60%, 80%) */}
                <div className="absolute top-0 bottom-0 left-[20%] w-1 -ml-0.5 bg-[#070e0f] z-10 rounded-full border-x border-white/5" />
                <div className="absolute top-0 bottom-0 left-[40%] w-1 -ml-0.5 bg-[#070e0f] z-10 rounded-full border-x border-white/5" />
                <div className="absolute top-0 bottom-0 left-[60%] w-1 -ml-0.5 bg-[#070e0f] z-10 rounded-full border-x border-white/5" />
                <div className="absolute top-0 bottom-0 left-[80%] w-1 -ml-0.5 bg-[#070e0f] z-10 rounded-full border-x border-white/5" />
              </div>
            </div>

            {/* Quick Context / Second Wind Callout */}
            {isSecondWind ? (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex items-start gap-2.5">
                <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-black text-amber-300">
                    Second Wind Mode Activated!
                  </p>
                  <p className="text-text-light leading-relaxed">
                    You can still play doubles and singles! <strong className="text-white">Win your next match to recharge +10% Stamina</strong>. If you lose, full CR rating is at stake.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-2 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-text-light font-medium">
                    <strong className="text-emerald-300 font-bold">+10%</strong> Win Refund
                  </span>
                </div>
                <div className="p-2 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-2 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="text-text-light font-medium">
                    <strong className="text-cyan-300 font-bold">+20%</strong> Ref Bonus
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Friendly Sports Coach Advice (Collapsible) */}
      <div className="relative z-10 border-t border-white/5 pt-2">
        <button
          onClick={() => setShowCoachTips(!showCoachTips)}
          className="w-full flex items-center justify-between text-xs font-bold text-text-light/70 hover:text-white transition-colors py-1"
        >
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-primary" />
            <span>Sports Coach Advice</span>
          </span>
          {showCoachTips ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <AnimatePresence>
          {showCoachTips && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden pt-2 space-y-2 text-xs text-text-light leading-relaxed"
            >
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                <p className="font-bold text-white flex items-center gap-1">
                  🎾 How Stamina Works:
                </p>
                <ul className="space-y-1 text-[11px] text-text-light list-disc list-inside">
                  <li><strong className="text-white">Rookies (&lt; 800 CR)</strong> have unlimited stamina while training.</li>
                  <li><strong className="text-white">Challenger+ (800+ CR)</strong> starts with 100% stamina every day.</li>
                  <li>Playing a match costs <strong className="text-white">20%</strong>. Winning refunds <strong className="text-emerald-400">+10%</strong>.</li>
                  <li>Volunteering to <strong className="text-cyan-400">Referee</strong> a match recharges <strong className="text-cyan-300">+20%</strong>.</li>
                  <li>At 0% stamina, <strong className="text-amber-400">Second Wind</strong> activates so you can still play with friends!</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
    </>
  );
}
