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
    if (!isChallengerOrHigher) return 'from-[#1A3326] to-[#244434]';
    if (stamina > 50) return 'from-[#1A3326] via-[#244434] to-[#2B4C6F]';
    if (stamina > 20) return 'from-[#2B4C6F] to-[#406892]';
    return 'from-[#8C3B30] to-[#A84A3D]';
  };

  // 🌱 ROOKIE SANDBOX (< 800 CR): Hide stamina card completely for Rookies!
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
        className="relative overflow-hidden rounded-3xl bg-white border border-[#E2DDD4] p-5 shadow-[0_4px_20px_rgba(24,40,30,0.06)] space-y-4"
      >
        {/* Background Ambient Glow */}
        <div 
          className="absolute -top-10 -left-10 w-48 h-48 rounded-full blur-3xl pointer-events-none bg-[#EBF2EC] opacity-60"
        />

        {/* Header with Title and Mode Badge */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-[#EBF2EC] border border-[#D1DDD3] text-[#244434] shadow-inner">
              <Zap className="w-4 h-4 fill-[#244434]/20" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-tight text-[#18281E] flex items-center gap-1.5">
                Court Stamina
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B7E72]">
                Daily Ranked Energy
              </p>
            </div>
          </div>
        </div>

        {/* Main Stamina Gauge */}
        <div className="relative z-10 space-y-2">
          {/* Battery Progress Bar & Segments */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#6B7E72] flex items-center gap-1">
                {isSecondWind ? (
                  <span className="text-[#8C3B30] font-extrabold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> High Stakes Mode
                  </span>
                ) : (
                  <span>{matchesRemaining} {matchesRemaining === 1 ? 'Ranked Match' : 'Ranked Matches'} Left</span>
                )}
              </span>
              <span className="font-mono font-bold text-[#18281E] text-xs">
                {stamina} / 100%
              </span>
            </div>

            {/* 5-Segment Battery Meter */}
            <div className="relative h-3.5 w-full bg-[#EBF2EC] rounded-full border border-[#D1DDD3] p-0.5 overflow-hidden flex items-center">
              {/* Underlying Continuous Liquid Stamina Bar */}
              <motion.div 
                initial={false}
                animate={{ width: `${stamina}%` }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className={`h-full rounded-full bg-gradient-to-r ${getBatteryColor()}`}
              />

              {/* Precision Segment Notches */}
              <div className="absolute top-0 bottom-0 left-[20%] w-1 -ml-0.5 bg-white z-10 rounded-full" />
              <div className="absolute top-0 bottom-0 left-[40%] w-1 -ml-0.5 bg-white z-10 rounded-full" />
              <div className="absolute top-0 bottom-0 left-[60%] w-1 -ml-0.5 bg-white z-10 rounded-full" />
              <div className="absolute top-0 bottom-0 left-[80%] w-1 -ml-0.5 bg-white z-10 rounded-full" />
            </div>
          </div>

          {/* Quick Context / Second Wind Callout */}
          {isSecondWind ? (
            <div className="p-3 rounded-2xl bg-[#F8EFEB] border border-[#EACFC9] flex items-start gap-2.5">
              <Flame className="w-4 h-4 text-[#8C3B30] shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-black text-[#8C3B30]">
                  Second Wind Mode Activated!
                </p>
                <p className="text-[#6B7E72] leading-relaxed">
                  You can still play doubles and singles! <strong className="text-[#18281E]">Win your next match to recharge +10% Stamina</strong>. If you lose, full CR rating is at stake.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2 rounded-2xl bg-[#F8F7F3] border border-[#E2DDD4] flex items-center gap-2 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-[#244434] shrink-0" />
                <span className="text-[#6B7E72] font-medium">
                  <strong className="text-[#244434] font-bold">+10%</strong> Win Refund
                </span>
              </div>
              <div className="p-2 rounded-2xl bg-[#F8F7F3] border border-[#E2DDD4] flex items-center gap-2 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#263E50] shrink-0" />
                <span className="text-[#6B7E72] font-medium">
                  <strong className="text-[#263E50] font-bold">+20%</strong> Ref Bonus
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Friendly Sports Coach Advice (Collapsible) */}
        <div className="relative z-10 border-t border-[#E2DDD4] pt-2">
          <button
            onClick={() => setShowCoachTips(!showCoachTips)}
            className="w-full flex items-center justify-between text-xs font-bold text-[#6B7E72] hover:text-[#18281E] transition-colors py-1"
          >
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#244434]" />
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
                className="overflow-hidden pt-2 space-y-2 text-xs text-[#6B7E72] leading-relaxed"
              >
                <div className="p-3 rounded-2xl bg-[#F8F7F3] border border-[#E2DDD4] space-y-1.5">
                  <p className="font-bold text-[#18281E] flex items-center gap-1">
                    🎾 How Stamina Works:
                  </p>
                  <ul className="space-y-1 text-[11px] text-[#6B7E72] list-disc list-inside">
                    <li><strong className="text-[#18281E]">Rookies (&lt; 800 CR)</strong> have unlimited stamina while training.</li>
                    <li><strong className="text-[#18281E]">Challenger+ (800+ CR)</strong> starts with 100% stamina every day.</li>
                    <li>Playing a match costs <strong className="text-[#18281E]">20%</strong>. Winning refunds <strong className="text-[#244434]">+10%</strong>.</li>
                    <li>Volunteering to <strong className="text-[#263E50]">Referee</strong> a match recharges <strong className="text-[#263E50]">+20%</strong>.</li>
                    <li>At 0% stamina, <strong className="text-[#8C3B30]">Second Wind</strong> activates so you can still play with friends!</li>
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
