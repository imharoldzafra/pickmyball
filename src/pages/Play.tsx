import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { PlusCircle, QrCode, Users, User, Trophy, Shield, ArrowRight, ArrowLeft, ChevronRight, Sparkles } from 'lucide-react';
import PickleballPaddle from '../components/icons/PickleballPaddle';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

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

  // QR Code Scanner Setup
  useEffect(() => {
    if (viewState === 'scan') {
      const scanner = new Html5QrcodeScanner(
        "reader", 
        { 
          fps: 10, 
          qrbox: { width: 220, height: 220 },
          videoConstraints: {
            facingMode: { ideal: "environment" }
          }
        }, 
        false
      );
      scanner.render((text) => {
        scanner.clear();
        const raw = text.trim();
        // Support both full URL and raw match ID
        const matchFound = raw.match(/PKB-[A-Z0-9_-]+/i);
        const matchIdToJoin = matchFound ? matchFound[0].toUpperCase() : raw.toUpperCase();
        navigate(`/match/${matchIdToJoin}/lobby`);
      }, () => {});
      return () => {
        scanner.clear().catch(() => {});
      };
    }
  }, [viewState, navigate]);

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
          className="space-y-5 relative z-10"
        >
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
            {/* Join Room Card */}
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

          {/* 🏆 Competitive Tiers & CR Rating Guide */}
          <div className="bg-white/[0.03] backdrop-blur-md p-5 rounded-3xl border border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.3)] space-y-3.5">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-bold text-text-light/60">
                Official ELO System
              </span>
            </div>

            <div className="space-y-2">
              {[
                { name: 'Rookie', range: '0 - 499 CR', color: 'text-slate-400', dot: 'bg-slate-400' },
                { name: 'Challenger', range: '500 - 999 CR', color: 'text-emerald-400', dot: 'bg-emerald-400' },
                { name: 'Veteran', range: '1,000 - 1,499 CR', color: 'text-cyan-400', dot: 'bg-cyan-400' },
                { name: 'Expert', range: '1,500 - 2,499 CR', color: 'text-amber-400', dot: 'bg-amber-400' },
                { name: 'Legend', range: '2,500+ CR', color: 'text-orange-400', dot: 'bg-orange-400' },
              ].map((tier) => {
                const isMyRank = (profile?.rank || 'Challenger').toLowerCase() === tier.name.toLowerCase();
                return (
                  <div
                    key={tier.name}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                      isMyRank
                        ? 'bg-emerald-500/[0.12] border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                        : 'bg-white/[0.02] border-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2 h-2 rounded-full ${tier.dot}`} />
                      <span className={`text-xs font-black ${tier.color}`}>
                        {tier.name}
                      </span>
                      {isMyRank && (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950">
                          Your Tier
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-mono font-bold text-text-light/80">
                      {tier.range}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="text-[10px] text-text-light/60 text-center leading-relaxed">
              Win matches against higher-rated players to earn more CR and rank up through the divisions!
            </p>
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
          <div className="flex items-center justify-between">
            <button
              onClick={() => setViewState('hub')}
              className="flex items-center gap-2 text-xs font-bold text-text-light hover:text-white transition-colors bg-white/[0.04] px-3.5 py-2 rounded-full border border-white/10"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Arena</span>
            </button>
            <h2 className="text-xs font-black uppercase tracking-wider text-emerald-400">
              Match Setup
            </h2>
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
            <PickleballPaddle className="w-4 h-4 text-[#050a0a]" />
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
          <div className="flex items-center justify-between">
            <button
              onClick={() => setViewState('hub')}
              className="flex items-center gap-2 text-xs font-bold text-text-light hover:text-white transition-colors bg-white/[0.04] px-3.5 py-2 rounded-full border border-white/10"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Arena</span>
            </button>
            <h2 className="text-xs font-black uppercase tracking-wider text-cyan-400">
              Join Match
            </h2>
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
                  className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white font-mono uppercase tracking-widest placeholder:text-text-light/30 focus:outline-none focus:border-cyan-400 transition-colors"
                />
                <button
                  type="submit"
                  className="bg-cyan-400 text-slate-950 px-5 py-3 rounded-2xl font-black uppercase tracking-wider text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95 transition-all"
                >
                  Join
                </button>
              </div>
              {joinError && (
                <p className="text-xs text-red-400 font-medium">{joinError}</p>
              )}
            </form>
          </div>

          {/* QR Scanner Card */}
          <div className="bg-white/[0.03] backdrop-blur-md p-5 rounded-3xl border border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.3)] space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Scan Host QR Code
              </h3>
              <p className="text-xs text-text-light">
                Point your camera at the host's match QR code to enter the room automatically.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
              <div id="reader" className="w-full"></div>
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
}
