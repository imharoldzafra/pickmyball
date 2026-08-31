import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { PlusCircle, QrCode, Users, User, Trophy, Shield, ArrowRight, ArrowLeft, ChevronRight, ChevronDown, ChevronUp, Sparkles, Camera, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import CourtStaminaCard from '../components/CourtStaminaCard';
import TierEmblem from '../components/TierEmblem';

export default function Play() {
  const [searchParams] = useSearchParams();
  const initialAction = searchParams.get('action');
  
  // View states: 'hub' (1st Page), 'configure' (Match setup page), 'scan' (Join Match)
  const [viewState, setViewState] = useState<'hub' | 'configure' | 'scan'>(
    initialAction === 'scan' ? 'scan' : initialAction === 'create' ? 'configure' : 'hub'
  );

  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Match Customization State
  const [matchType, setMatchType] = useState<'1v1' | '2v2'>('1v1');
  const [gameFormat, setGameFormat] = useState<'single_11' | 'single_15' | 'single_21' | 'best_of_3'>('single_11');
  const [creating, setCreating] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [showEloSystem, setShowEloSystem] = useState(false);

  // On-demand Camera Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Generate Match Room in Supabase
  const handleCreateMatch = async () => {
    if (!user) return;
    setCreating(true);

    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const matchId = `PKB-${randomSuffix}`;

    let targetPoints = 11;
    if (gameFormat === 'single_15') targetPoints = 15;
    if (gameFormat === 'single_21') targetPoints = 21;

    const hostReferee = {
      id: user.id,
      displayName: profile?.displayName || user.email?.split('@')[0] || 'Host',
      photoURL: profile?.photoURL || '',
      rating: profile?.rating || 0,
      rank: profile?.rank || 'Rookie',
    };

    try {
      const { error } = await supabase.from('matches').insert({
        id: matchId,
        host_id: user.id,
        host_name: hostReferee.displayName,
        host_avatar: hostReferee.photoURL,
        match_type: matchType,
        game_format: gameFormat,
        target_points: targetPoints,
        status: 'WAITING',
        team_a: [],
        team_b: [],
        referee_id: user.id,
        referee: hostReferee,
        current_game: 1,
        team_a_score: 0,
        team_b_score: 0,
        team_a_games_won: 0,
        team_b_games_won: 0,
        serving_team: 'A',
        server_number: 2,
        game_results: [],
        match_winner: 'NONE',
      });

      if (error) {
        console.warn('Supabase match insert error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase match creation error:', err);
    }

    setCreating(false);
    navigate(`/match/${matchId}/lobby`);
  };

  // Join via manual code
  const handleManualJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    const cleaned = manualCode.trim().toUpperCase();
    if (!cleaned) {
      setJoinError('Please enter a match code');
      return;
    }
    const finalCode = cleaned.startsWith('PKB-') ? cleaned : `PKB-${cleaned}`;
    if (!/^PKB-[A-Z0-9]{3,12}$/i.test(finalCode)) {
      setJoinError('Invalid match code format. Example: PKB-ABC123');
      return;
    }
    navigate(`/match/${finalCode}/lobby`);
  };

  // On-Demand Rear Camera QR Code Scanner Setup
  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    let isMounted = true;

    if (viewState === 'scan' && isScanning) {
      setCameraStarting(true);
      setCameraError(null);

      // Brief delay to ensure #reader element is fully mounted in DOM
      const timer = setTimeout(() => {
        if (!isMounted) return;

        const readerElem = document.getElementById("reader");
        if (!readerElem) {
          setCameraStarting(false);
          return;
        }

        try {
          html5QrCode = new Html5Qrcode("reader");

          const config = {
            fps: 10,
            qrbox: { width: 240, height: 240 },
            aspectRatio: 1.0,
          };

          const handleScanSuccess = (text: string) => {
            if (html5QrCode && html5QrCode.isScanning) {
              html5QrCode.stop().then(() => {
                html5QrCode?.clear();
              }).catch(() => {});
            }
            const raw = text.trim();
            const matchFound = raw.match(/PKB-[A-Z0-9_-]+/i);
            const matchIdToJoin = matchFound ? matchFound[0].toUpperCase() : raw.toUpperCase();
            navigate(`/match/${matchIdToJoin}/lobby`);
          };

          // Directly launch the rear/environment camera
          html5QrCode
            .start(
              { facingMode: { exact: "environment" } },
              config,
              handleScanSuccess,
              () => {}
            )
            .then(() => {
              if (isMounted) setCameraStarting(false);
            })
            .catch(() => {
              // Fallback to ideal environment or webcam
              html5QrCode
                ?.start(
                  { facingMode: "environment" },
                  config,
                  handleScanSuccess,
                  () => {}
                )
                .then(() => {
                  if (isMounted) setCameraStarting(false);
                })
                .catch(() => {
                  html5QrCode
                    ?.start(
                      { facingMode: "user" },
                      config,
                      handleScanSuccess,
                      () => {}
                    )
                    .then(() => {
                      if (isMounted) setCameraStarting(false);
                    })
                    .catch((err) => {
                      console.warn("Camera start error:", err);
                      if (isMounted) {
                        setCameraStarting(false);
                        setCameraError("Unable to access rear camera. Please ensure permissions are granted or enter room code above.");
                      }
                    });
                });
            });
        } catch (err) {
          console.error("Html5Qrcode init error:", err);
          if (isMounted) {
            setCameraStarting(false);
            setCameraError("Camera initialization failed. Please use room code.");
          }
        }
      }, 50);

      return () => {
        isMounted = false;
        clearTimeout(timer);
        if (html5QrCode && html5QrCode.isScanning) {
          html5QrCode.stop().then(() => {
            html5QrCode?.clear();
          }).catch(() => {});
        }
      };
    } else {
      setCameraStarting(false);
    }
  }, [viewState, isScanning, navigate]);

  return (
    <div className="p-4 sm:p-5 space-y-6">

      {/* ========================================================================= */}
      {/* 🏟️ 1ST PAGE: ARENA HUB (Host Match CTA, Join CTA, Rating Tiers Guide)     */}
      {/* ========================================================================= */}
      {viewState === 'hub' && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4 relative z-10"
        >
          {/* ⚡ Daily Court Stamina & Second Wind Energy Card */}
          <CourtStaminaCard />

          {/* Main Host Action Card */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setViewState('configure')}
            className="cursor-pointer bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent p-6 rounded-3xl border border-emerald-400/30 shadow-[0_10px_35px_rgba(16,185,129,0.15)] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-400/20 transition-all" />
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1.5 w-full">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                  Host Arena
                </div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  Create Match
                </h2>
                <p className="text-xs text-text-light/80 leading-relaxed">
                  Setup a 1v1 Singles or 2v2 Doubles room, invite players via live QR code, and referee the court in real time.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-black text-emerald-400">
              <span>Configure Rules & Create Room</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          {/* Secondary Action: Join Match */}
          <div>
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setViewState('scan')}
              className="cursor-pointer bg-white/[0.03] backdrop-blur-md p-4.5 rounded-3xl border border-white/10 hover:border-white/20 transition-all flex items-center justify-between shadow-[0_10px_35px_rgba(0,0,0,0.3)]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-400/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-white">Join Match</h3>
                  <p className="text-[10px] text-text-light/70">Scan QR code or enter match code</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-text-light/60" />
            </motion.div>
          </div>

          {/* 🏆 Box-less "See Tiers" Minimal Action & Expandable Guide */}
          <div className="pt-1 flex flex-col items-center w-full">
            <button
              onClick={() => setShowEloSystem(!showEloSystem)}
              className="inline-flex items-center gap-1.5 py-1 text-xs font-bold text-text-light/60 hover:text-white active:scale-95 transition-all group tracking-wide"
            >
              <span>See Tiers</span>
              {showEloSystem ? (
                <ChevronUp className="w-3.5 h-3.5 text-text-light/40 group-hover:text-white transition-colors" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-text-light/40 group-hover:text-white transition-colors" />
              )}
            </button>

            <AnimatePresence>
              {showEloSystem && (
                <motion.div
                  initial={{ height: 0, opacity: 0, y: -6 }}
                  animate={{ height: 'auto', opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="w-full overflow-hidden mt-3 p-4 sm:p-5 rounded-3xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.4)] space-y-3"
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-white/90">
                      Official ELO Divisions
                    </span>
                    <Link
                      to="/leaderboard"
                      className="text-[10px] font-bold text-text-light/80 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 px-2.5 py-1 rounded-full flex items-center gap-1 transition-all active:scale-95 group"
                    >
                      <span>Leaderboard</span>
                      <ArrowRight className="w-2.5 h-2.5 text-text-light/50 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>

                  <div className="space-y-2">
                    {[
                      { 
                        name: 'Rookie', 
                        threshold: '—', 
                        crRatio: '+80 / -40',
                        color: 'text-slate-400',
                        activeContainer: 'bg-gradient-to-r from-slate-400/20 via-slate-400/5 to-transparent border-slate-400/60 border-l-[3.5px] border-l-slate-400 shadow-[0_0_20px_rgba(148,163,184,0.2)]',
                        activeText: 'text-text-light/80'
                      },
                      { 
                        name: 'Challenger', 
                        threshold: '800+ CR', 
                        crRatio: '+40 / -20',
                        color: 'text-emerald-400',
                        activeContainer: 'bg-gradient-to-r from-emerald-500/20 via-emerald-500/5 to-transparent border-emerald-400/60 border-l-[3.5px] border-l-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]',
                        activeText: 'text-emerald-300'
                      },
                      { 
                        name: 'Veteran', 
                        threshold: '1,200+ CR', 
                        crRatio: '+30 / -20',
                        color: 'text-cyan-400',
                        activeContainer: 'bg-gradient-to-r from-cyan-500/20 via-cyan-500/5 to-transparent border-cyan-400/60 border-l-[3.5px] border-l-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]',
                        activeText: 'text-cyan-300'
                      },
                      { 
                        name: 'Expert', 
                        threshold: '1,600+ CR', 
                        crRatio: '+25 / -25',
                        color: 'text-amber-400',
                        activeContainer: 'bg-gradient-to-r from-amber-500/20 via-amber-500/5 to-transparent border-amber-400/60 border-l-[3.5px] border-l-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]',
                        activeText: 'text-amber-300'
                      },
                      { 
                        name: 'Legend', 
                        threshold: '2,000+ CR', 
                        crRatio: '+20 / -30',
                        color: 'text-orange-400',
                        activeContainer: 'bg-gradient-to-r from-orange-500/25 via-orange-500/5 to-transparent border-orange-500/60 border-l-[3.5px] border-l-orange-500 shadow-[0_0_25px_rgba(249,115,22,0.25)]',
                        activeText: 'text-orange-300'
                      },
                    ].map((tier) => {
                      const isMyRank = (profile?.rank || 'Challenger').toLowerCase() === tier.name.toLowerCase();
                      const isLegend = tier.name === 'Legend';
                      return (
                        <div
                          key={tier.name}
                          className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all relative overflow-hidden ${
                            isMyRank
                              ? tier.activeContainer
                              : 'bg-white/[0.02] border-white/5'
                          }`}
                        >
                          {/* 👑 Option 3: Apex Grandmaster Effects for Legend */}
                          {isLegend && (
                            <>
                              {/* Breathing Ember Orb */}
                              <div className="absolute -top-4 -left-4 w-28 h-24 bg-gradient-to-br from-orange-500/25 via-amber-500/10 to-transparent rounded-full blur-xl pointer-events-none" />

                              {/* Silky Chrome Light Sweep (Travels full container width) */}
                              <motion.div
                                initial={{ left: '-35%' }}
                                animate={{ left: '135%' }}
                                transition={{
                                  duration: 2.2,
                                  repeat: Infinity,
                                  repeatDelay: 0.8,
                                  ease: 'easeInOut',
                                }}
                                className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/[0.14] to-transparent skew-x-[-25deg] pointer-events-none"
                              />
                            </>
                          )}

                          <div className="flex items-center gap-2.5 relative z-10">
                            <TierEmblem rank={tier.name} size="sm" animated={isMyRank || isLegend} />
                            <span className={`text-xs font-black ${tier.color}`}>
                              {tier.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 relative z-10">
                            <span className={`text-xs font-mono font-bold ${isMyRank ? tier.activeText : 'text-text-light/80'}`}>
                              {tier.threshold}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-[10px] text-text-light/60 text-center leading-relaxed pt-1">
                    Win matches against higher-rated opponents to earn bonus CR and climb through the divisions!
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* ⚙️ 2ND PAGE: MATCH CONFIGURATION PAGE (1v1 vs 2v2, Points, Generate Room)  */}
      {/* ========================================================================= */}
      {viewState === 'configure' && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-5 relative z-10"
        >
          {/* Top Back Navigation */}
          <div className="flex items-center">
            <button
              onClick={() => setViewState('hub')}
              className="w-9 h-9 flex items-center justify-center text-text-light hover:text-white transition-all bg-white/[0.04] hover:bg-white/[0.08] rounded-full border border-white/10 active:scale-95 shadow-sm"
              title="Back to Arena"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Card 1: Match Format (1v1 vs 2v2) */}
          <div className="bg-white/[0.03] backdrop-blur-md p-5 rounded-3xl border border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.3)] space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <label className="text-xs font-black uppercase tracking-wider text-white">
                1. Match Format
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMatchType('1v1')}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center gap-1.5 text-center active:scale-96 ${
                  matchType === '1v1'
                    ? 'bg-emerald-500/15 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                    : 'bg-white/[0.02] border-white/10 text-text-light hover:text-white'
                }`}
              >
                <User className="w-6 h-6 text-emerald-400" />
                <span className="text-xs font-black">Singles (1 vs 1)</span>
                <span className="text-[10px] text-text-light/70">1 Player per team</span>
              </button>

              <button
                type="button"
                onClick={() => setMatchType('2v2')}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center gap-1.5 text-center active:scale-96 ${
                  matchType === '2v2'
                    ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'bg-white/[0.02] border-white/10 text-text-light hover:text-white'
                }`}
              >
                <Users className="w-6 h-6 text-cyan-400" />
                <span className="text-xs font-black">Doubles (2 vs 2)</span>
                <span className="text-[10px] text-text-light/70">2 Players per team</span>
              </button>
            </div>
          </div>

          {/* Card 2: Gameplay Rules & Target Points */}
          <div className="bg-white/[0.03] backdrop-blur-md p-5 rounded-3xl border border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.3)] space-y-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <label className="text-xs font-black uppercase tracking-wider text-white">
                2. Gameplay Rules & Points
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'single_11', title: 'Single Game (11 pts)', desc: 'Standard Pickleball' },
                { id: 'single_15', title: 'Single Game (15 pts)', desc: 'Extended Rally' },
                { id: 'single_21', title: 'Single Game (21 pts)', desc: 'Marathon Clash' },
                { id: 'best_of_3', title: 'Best of 3 Sets', desc: '11 pts per set' },
              ].map((rule) => (
                <button
                  key={rule.id}
                  type="button"
                  onClick={() => setGameFormat(rule.id as any)}
                  className={`p-3 rounded-2xl border text-left transition-all active:scale-96 ${
                    gameFormat === rule.id
                      ? 'bg-emerald-500/15 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                  }`}
                >
                  <p className="text-xs font-black text-white">{rule.title}</p>
                  <p className="text-[10px] text-text-light/60">{rule.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleCreateMatch} 
            disabled={creating}
            className="bg-gradient-to-r from-primary via-emerald-400 to-secondary text-[#050a0a] w-full py-4 rounded-2xl font-black uppercase tracking-wider text-xs shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <span>{creating ? 'Generating Room...' : 'Generate Match Room & QR'}</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* 📱 3RD PAGE: JOIN MATCH (Scan QR or Type Room Code)                       */}
      {/* ========================================================================= */}
      {viewState === 'scan' && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-5 relative z-10"
        >
          {/* Top Back Navigation */}
          <div className="flex items-center">
            <button
              onClick={() => {
                setIsScanning(false);
                setViewState('hub');
              }}
              className="flex items-center gap-2 text-xs font-bold text-text-light hover:text-white transition-colors bg-white/[0.04] px-3.5 py-2 rounded-full border border-white/10"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Arena</span>
            </button>
          </div>

          {/* Manual Match Code Card */}
          <div className="bg-white/[0.03] backdrop-blur-md p-5 rounded-3xl border border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.3)] space-y-3">
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Enter Room Code
              </h3>
              <p className="text-xs text-text-light">
                Type the 6-character match code displayed on the host's screen.
              </p>
            </div>

            <form onSubmit={handleManualJoin} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. PKB-X7K92P"
                  value={manualCode}
                  onChange={(e) => { setManualCode(e.target.value); setJoinError(null); }}
                  className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-mono uppercase tracking-widest placeholder:text-text-light/30 focus:outline-none focus:border-emerald-400 transition-colors"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-primary to-emerald-400 text-[#050a0a] px-5 py-3 rounded-2xl font-black uppercase tracking-wider text-xs shadow-[0_0_18px_rgba(16,185,129,0.4)] active:scale-95 transition-all hover:brightness-105"
                >
                  Join
                </button>
              </div>
              {joinError && (
                <p className="text-xs text-red-400 font-medium">{joinError}</p>
              )}
            </form>
          </div>

          {/* QR Scanner Card (Apple-style minimalist thin-line viewfinder) */}
          <div className="bg-white/[0.03] backdrop-blur-md p-5 rounded-3xl border border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.3)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-light/90">
                  Scan Host QR Code
                </h3>
                <p className="text-[11px] text-text-light/50 mt-0.5">
                  {isScanning ? "Position match QR within the frame" : "Tap frame to open camera"}
                </p>
              </div>
              {isScanning && (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Scanning</span>
                </div>
              )}
            </div>

            {/* Apple-style Minimalist Viewfinder Frame */}
            <div className="relative">
              {!isScanning ? (
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsScanning(true)}
                  className="group cursor-pointer relative aspect-square max-w-[240px] mx-auto w-full rounded-2xl bg-black/40 border border-white/10 hover:border-white/25 hover:bg-black/50 p-6 flex flex-col items-center justify-center text-center transition-all duration-200"
                >
                  {/* Whisper-Thin Corner Brackets */}
                  <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t border-l border-white/50 rounded-tl-[4px] group-hover:border-white transition-colors" />
                  <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t border-r border-white/50 rounded-tr-[4px] group-hover:border-white transition-colors" />
                  <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b border-l border-white/50 rounded-bl-[4px] group-hover:border-white transition-colors" />
                  <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b border-r border-white/50 rounded-br-[4px] group-hover:border-white transition-colors" />

                  {/* Center Minimal Icon & Clean Typography */}
                  <div className="flex flex-col items-center gap-2.5 z-10">
                    <div className="w-11 h-11 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center text-white/70 group-hover:text-white group-hover:scale-105 group-hover:bg-white/[0.08] transition-all">
                      <QrCode className="w-5 h-5" strokeWidth={1.75} />
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold text-white/90 tracking-wide block">
                        Scan QR Code
                      </span>
                      <span className="text-[11px] text-white/40 block">
                        Tap to activate camera
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="relative aspect-square max-w-[240px] mx-auto w-full rounded-2xl overflow-hidden bg-black/90 border border-white/15">
                  {/* Whisper-Thin Corner Brackets over Live Stream */}
                  <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t border-l border-white/80 rounded-tl-[4px] z-20 pointer-events-none" />
                  <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t border-r border-white/80 rounded-tr-[4px] z-20 pointer-events-none" />
                  <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b border-l border-white/80 rounded-bl-[4px] z-20 pointer-events-none" />
                  <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b border-r border-white/80 rounded-br-[4px] z-20 pointer-events-none" />

                  {/* Connecting Loader */}
                  {cameraStarting && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xs gap-2">
                      <div className="w-5 h-5 border-[1.5px] border-white/20 border-t-white rounded-full animate-spin" />
                      <span className="text-[11px] text-white/60 font-medium">
                        Opening camera...
                      </span>
                    </div>
                  )}

                  {/* Video Stream Mount Target */}
                  <div id="reader" className="w-full h-full"></div>
                </div>
              )}

              {/* Error Message if Camera Access Fails */}
              {cameraError && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center max-w-[240px] mx-auto">
                  <p className="text-[11px] text-rose-400 font-medium">{cameraError}</p>
                </div>
              )}

              {/* Minimal Cancel Button when Active */}
              {isScanning && (
                <div className="mt-2.5 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setIsScanning(false)}
                    className="px-4 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-medium text-white/70 hover:text-white transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <X className="w-3 h-3 text-white/50" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
}
