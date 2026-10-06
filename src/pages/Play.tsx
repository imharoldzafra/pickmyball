import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { QrCode, Users, User, Trophy, ArrowRight, ArrowLeft, ChevronRight, ChevronDown, ChevronUp, X } from 'lucide-react';
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

  useEffect(() => {
    if (initialAction === 'create') {
      setViewState('configure');
    } else if (initialAction === 'scan') {
      setViewState('scan');
    }
  }, [initialAction]);

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

  // Start Direct Friendly Match
  const handleStartFriendlyMatch = () => {
    setCreating(true);

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let randomSuffix = '';
    for (let i = 0; i < 6; i++) {
      randomSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const matchId = `PKB-FR-${randomSuffix}`;

    let targetPoints = 11;
    if (gameFormat === 'single_15') targetPoints = 15;
    if (gameFormat === 'single_21') targetPoints = 21;

    const hostReferee = {
      id: 'friendly_ref',
      displayName: 'Court Referee',
      photoURL: '',
      rating: 0,
      rank: 'Rookie',
    };

    const teamA = matchType === '2v2'
      ? [
          { id: 'friendly_a1', displayName: 'Alpha 1', rating: 0, rank: 'Rookie' },
          { id: 'friendly_a2', displayName: 'Alpha 2', rating: 0, rank: 'Rookie' },
        ]
      : [
          { id: 'friendly_a1', displayName: 'Team Alpha', rating: 0, rank: 'Rookie' },
        ];

    const teamB = matchType === '2v2'
      ? [
          { id: 'friendly_b1', displayName: 'Beta 1', rating: 0, rank: 'Rookie' },
          { id: 'friendly_b2', displayName: 'Beta 2', rating: 0, rank: 'Rookie' },
        ]
      : [
          { id: 'friendly_b1', displayName: 'Team Beta', rating: 0, rank: 'Rookie' },
        ];

    const matchPayload = {
      id: matchId,
      creatorId: hostReferee.id,
      hostId: hostReferee.id,
      hostName: hostReferee.displayName,
      hostAvatar: hostReferee.photoURL,
      matchType,
      gameFormat,
      targetPoints,
      status: 'IN_PROGRESS',
      teamA,
      teamB,
      refereeId: hostReferee.id,
      referee: hostReferee,
      currentGame: 1,
      teamAScore: 0,
      teamBScore: 0,
      teamAGamesWon: 0,
      teamBGamesWon: 0,
      servingTeam: 'A' as const,
      serverNumber: 2,
      gameResults: [],
      matchWinner: 'NONE' as const,
      isFriendly: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      sessionStorage.setItem(`pkb_match_${matchId}`, JSON.stringify(matchPayload));
      localStorage.setItem(`pkb_match_${matchId}`, JSON.stringify(matchPayload));
      sessionStorage.setItem(`pkb_is_friendly_${matchId}`, 'true');
    } catch (e) {
      console.warn('Friendly match cache error:', e);
    }

    setCreating(false);
    navigate(`/match/${matchId}/live`);
  };

  // Join match by manual typed code
  const handleManualJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError(null);
    let code = manualCode.trim().toUpperCase();
    if (!code) {
      setJoinError('Please enter a match code.');
      return;
    }

    if (!code.startsWith('PKB-')) {
      code = `PKB-${code}`;
    }

    try {
      const { data, error } = await supabase
        .from('matches')
        .select('id, status')
        .eq('id', code)
        .maybeSingle();

      if (error || !data) {
        setJoinError('Match room not found. Please verify the code.');
        return;
      }

      if (data.status === 'FINISHED') {
        setJoinError('This match has already completed.');
        return;
      }

      navigate(`/match/${code}/lobby`);
    } catch {
      setJoinError('Could not connect to match server.');
    }
  };

  // Setup QR scanner when in scan view
  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    let timer: any = null;

    if (viewState === 'scan' && isScanning) {
      setCameraStarting(true);
      setCameraError(null);

      timer = setTimeout(() => {
        try {
          html5QrCode = new Html5Qrcode('reader');
          const config = { fps: 10, qrbox: { width: 220, height: 220 } };

          html5QrCode.start(
            { facingMode: 'environment' },
            config,
            (decodedText) => {
              if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().then(() => {
                  html5QrCode?.clear();
                  let code = decodedText;
                  if (code.includes('/match/')) {
                    const matchParts = code.split('/match/');
                    if (matchParts[1]) {
                      code = matchParts[1].split('/')[0];
                    }
                  }
                  navigate(`/match/${code}/lobby`);
                }).catch(() => {});
              }
            },
            () => {}
          ).then(() => {
            setCameraStarting(false);
          }).catch((err) => {
            console.warn('QR camera start failure:', err);
            setCameraStarting(false);
            setCameraError('Camera access required. Please allow camera permissions or type match code.');
          });
        } catch (err) {
          console.warn('QR init error:', err);
          setCameraStarting(false);
          setCameraError('Unable to open camera on this device.');
        }
      }, 300);

      return () => {
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

          {/* Main Host Action Card: Hero Deep Court Green */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setViewState('configure')}
            className="cursor-pointer court-hero-card p-6 rounded-3xl relative overflow-hidden group"
          >
            {/* Subtle court chalk accent in corner */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-white/[0.06] rounded-full blur-2xl pointer-events-none group-hover:bg-white/[0.12] transition-all" />
            
            <div className="relative z-10 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Create Match
              </h2>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-medium">
                Setup a 1v1 Singles or 2v2 Doubles room, invite players via live QR code, and referee the court in real time.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-white/15 flex items-center justify-between text-xs font-bold text-white group-hover:text-white/90">
              <span>Configure Rules & Create Room</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-white" />
            </div>
          </motion.div>

          {/* Secondary Action: Join Match */}
          <div>
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setViewState('scan')}
              className="cursor-pointer bg-white border border-[#E2DDD4] p-4.5 rounded-3xl hover:border-[#244434]/40 transition-all flex items-center justify-between shadow-[0_2px_12px_rgba(24,40,30,0.04)]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EBF2EC] border border-[#D1DDD3] flex items-center justify-center text-[#244434] shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#18281E]">Join Match</h3>
                  <p className="text-[10px] text-[#6B7E72]">Scan QR code or enter match code</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#94A49A]" />
            </motion.div>
          </div>

          {/* 🏆 "See Tiers" Action & Expandable Guide */}
          <div className="pt-1 flex flex-col items-center w-full">
            <button
              onClick={() => setShowEloSystem(!showEloSystem)}
              className="inline-flex items-center gap-1.5 py-1 text-xs font-bold text-[#6B7E72] hover:text-[#18281E] active:scale-95 transition-all group tracking-wide"
            >
              <span>See Tiers</span>
              {showEloSystem ? (
                <ChevronUp className="w-3.5 h-3.5 text-[#94A49A] group-hover:text-[#18281E] transition-colors" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-[#94A49A] group-hover:text-[#18281E] transition-colors" />
              )}
            </button>

            <AnimatePresence>
              {showEloSystem && (
                <motion.div
                  initial={{ height: 0, opacity: 0, y: -6 }}
                  animate={{ height: 'auto', opacity: 1, y: 0 }}
                  exit={{ height: 0, opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="w-full overflow-hidden mt-3 p-4 sm:p-5 rounded-3xl bg-white border border-[#E2DDD4] shadow-[0_4px_20px_rgba(24,40,30,0.06)] space-y-3"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#E2DDD4]">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#18281E]">
                      Official ELO Divisions
                    </span>
                    <Link
                      to="/leaderboard"
                      className="text-[10px] font-bold text-[#244434] hover:text-[#1A3326] bg-[#EBF2EC] hover:bg-[#DCE7DE] border border-[#D1DDD3] px-2.5 py-1 rounded-full flex items-center gap-1 transition-all active:scale-95 group"
                    >
                      <span>Leaderboard</span>
                      <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>

                  <div className="space-y-2">
                    {[
                      { 
                        name: 'Rookie', 
                        threshold: '—', 
                        crRatio: '+80 / -40',
                        color: 'text-[#6B7E72]',
                        activeContainer: 'bg-[#F7F6F1] border-[#E2DDD4] border-l-[4px] border-l-[#6B7E72]',
                        activeText: 'text-[#6B7E72]'
                      },
                      { 
                        name: 'Challenger', 
                        threshold: '800+ CR', 
                        crRatio: '+40 / -20',
                        color: 'text-[#244434]',
                        activeContainer: 'bg-[#EBF2EC] border-[#C6D8CB] border-l-[4px] border-l-[#244434]',
                        activeText: 'text-[#244434]'
                      },
                      { 
                        name: 'Veteran', 
                        threshold: '1,200+ CR', 
                        crRatio: '+30 / -20',
                        color: 'text-[#263E50]',
                        activeContainer: 'bg-[#EDF3F7] border-[#C8D6E0] border-l-[4px] border-l-[#263E50]',
                        activeText: 'text-[#263E50]'
                      },
                      { 
                        name: 'Expert', 
                        threshold: '1,600+ CR', 
                        crRatio: '+25 / -25',
                        color: 'text-amber-800',
                        activeContainer: 'bg-amber-50 border-amber-200 border-l-[4px] border-l-amber-600',
                        activeText: 'text-amber-800'
                      },
                      { 
                        name: 'Legend', 
                        threshold: '2,000+ CR', 
                        crRatio: '+20 / -30',
                        color: 'text-[#8C3B30]',
                        activeContainer: 'bg-[#F8EFEB] border-[#EACFC9] border-l-[4px] border-l-[#8C3B30]',
                        activeText: 'text-[#8C3B30]'
                      },
                    ].map((tier) => {
                      const isMyRank = (profile?.rank || 'Challenger').toLowerCase() === tier.name.toLowerCase();
                      return (
                        <div
                          key={tier.name}
                          className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                            isMyRank
                              ? tier.activeContainer
                              : 'bg-[#F8F7F3] border-[#E2DDD4]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <TierEmblem rank={tier.name} size="sm" animated={isMyRank} />
                            <span className={`text-xs font-black ${tier.color}`}>
                              {tier.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-mono font-bold ${isMyRank ? tier.activeText : 'text-[#6B7E72]'}`}>
                              {tier.threshold}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-[10px] text-[#6B7E72] text-center leading-relaxed pt-1">
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
              onClick={() => {
                if (!user || sessionStorage.getItem('pkb_guest_offline') === 'true') {
                  navigate('/login');
                } else {
                  setViewState('hub');
                }
              }}
              className="w-9 h-9 flex items-center justify-center text-[#3A4C40] hover:text-[#18281E] transition-all bg-white hover:bg-[#EBF2EC] rounded-full border border-[#E2DDD4] active:scale-95 shadow-sm"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Card 1: Match Format (1v1 vs 2v2) */}
          <div className="bg-white p-5 rounded-3xl border border-[#E2DDD4] shadow-[0_4px_20px_rgba(24,40,30,0.06)] space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#244434]" />
              <label className="text-xs font-black uppercase tracking-wider text-[#18281E]">
                1. Match Format
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMatchType('1v1')}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center gap-1.5 text-center active:scale-96 ${
                  matchType === '1v1'
                    ? 'bg-[#EBF2EC] border-[#244434] text-[#244434] shadow-sm'
                    : 'bg-[#F8F7F3] border-[#E2DDD4] text-[#3A4C40] hover:border-[#C6D8CB]'
                }`}
              >
                <User className="w-6 h-6 text-[#244434]" />
                <span className="text-xs font-black">Singles (1 vs 1)</span>
                <span className="text-[10px] text-[#6B7E72]">1 Player per team</span>
              </button>

              <button
                type="button"
                onClick={() => setMatchType('2v2')}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center gap-1.5 text-center active:scale-96 ${
                  matchType === '2v2'
                    ? 'bg-[#EDF3F7] border-[#263E50] text-[#263E50] shadow-sm'
                    : 'bg-[#F8F7F3] border-[#E2DDD4] text-[#3A4C40] hover:border-[#C8D6E0]'
                }`}
              >
                <Users className="w-6 h-6 text-[#263E50]" />
                <span className="text-xs font-black">Doubles (2 vs 2)</span>
                <span className="text-[10px] text-[#6B7E72]">2 Players per team</span>
              </button>
            </div>
          </div>

          {/* Card 2: Gameplay Rules & Target Points */}
          <div className="bg-white p-5 rounded-3xl border border-[#E2DDD4] shadow-[0_4px_20px_rgba(24,40,30,0.06)] space-y-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#244434]" />
              <label className="text-xs font-black uppercase tracking-wider text-[#18281E]">
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
                      ? 'bg-[#EBF2EC] border-[#244434] text-[#244434] shadow-sm'
                      : 'bg-[#F8F7F3] border-[#E2DDD4] text-[#3A4C40] hover:border-[#C6D8CB]'
                  }`}
                >
                  <p className="text-xs font-black text-[#18281E]">{rule.title}</p>
                  <p className="text-[10px] text-[#6B7E72]">{rule.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-3 flex flex-col items-center">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleStartFriendlyMatch} 
              disabled={creating}
              className="w-[78%] max-w-[280px] flex items-center justify-center bg-gradient-to-r from-[#244434] to-[#1A3326] text-white py-3.5 rounded-2xl font-black uppercase tracking-wider text-xs shadow-md transition-all disabled:opacity-70"
            >
              <span>{creating ? 'Starting Match...' : 'Start Friendly Match'}</span>
            </motion.button>

            {user && (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleCreateMatch} 
                disabled={creating}
                className="w-[78%] max-w-[280px] flex items-center justify-center bg-white hover:bg-[#F3F1EB] border border-[#244434] text-[#244434] py-3.5 rounded-2xl font-black uppercase tracking-wider text-xs transition-all disabled:opacity-50"
              >
                <span>{creating ? 'Generating Room...' : 'Generate Match Room & QR'}</span>
              </motion.button>
            )}
          </div>
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
              className="flex items-center gap-2 text-xs font-bold text-[#3A4C40] hover:text-[#18281E] transition-colors bg-white px-3.5 py-2 rounded-full border border-[#E2DDD4] shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Arena</span>
            </button>
          </div>

          {/* Manual Match Code Card */}
          <div className="bg-white p-5 rounded-3xl border border-[#E2DDD4] shadow-[0_4px_20px_rgba(24,40,30,0.06)] space-y-3">
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#18281E]">
                Enter Room Code
              </h3>
              <p className="text-xs text-[#6B7E72]">
                Type the 6-character match code displayed on the host's screen.
              </p>
            </div>

            <form onSubmit={handleManualJoin} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. PKB-X7K92P"
                  value={manualCode}
                  maxLength={10}
                  onChange={(e) => {
                    const sanitized = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
                    setManualCode(sanitized);
                    setJoinError(null);
                  }}
                  className="flex-1 bg-[#F8F7F3] border border-[#E2DDD4] rounded-2xl px-4 py-3 text-sm text-[#18281E] font-mono uppercase tracking-widest placeholder:text-[#94A49A] focus:outline-none focus:border-[#244434] focus:bg-white transition-colors"
                />
                <button
                  type="submit"
                  className="bg-[#244434] hover:bg-[#1A3326] text-white px-5 py-3 rounded-2xl font-black uppercase tracking-wider text-xs shadow-sm active:scale-95 transition-all"
                >
                  Join
                </button>
              </div>
              {joinError && (
                <p className="text-xs text-rose-500 font-medium">{joinError}</p>
              )}
            </form>
          </div>

          {/* QR Scanner Card */}
          <div className="bg-white p-5 rounded-3xl border border-[#E2DDD4] shadow-[0_4px_20px_rgba(24,40,30,0.06)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#18281E]">
                  Scan Host QR Code
                </h3>
                <p className="text-[11px] text-[#6B7E72] mt-0.5">
                  {isScanning ? "Position match QR within the frame" : "Tap frame to open camera"}
                </p>
              </div>
              {isScanning && (
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBF2EC] border border-[#C6D8CB] text-[#244434] text-[10px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#244434] animate-pulse" />
                  <span>Scanning</span>
                </div>
              )}
            </div>

            {/* Viewfinder Frame */}
            <div className="relative">
              {!isScanning ? (
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsScanning(true)}
                  className="group cursor-pointer relative aspect-square max-w-[240px] mx-auto w-full rounded-2xl bg-[#F8F7F3] border border-[#E2DDD4] hover:border-[#244434]/40 p-6 flex flex-col items-center justify-center text-center transition-all duration-200"
                >
                  {/* Corner Brackets in Court Green */}
                  <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-[#244434] rounded-tl-[4px]" />
                  <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-2 border-r-2 border-[#244434] rounded-tr-[4px]" />
                  <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-2 border-l-2 border-[#244434] rounded-bl-[4px]" />
                  <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-[#244434] rounded-br-[4px]" />

                  {/* Center Icon & Typography */}
                  <div className="flex flex-col items-center gap-2.5 z-10">
                    <div className="w-11 h-11 rounded-xl bg-[#EBF2EC] border border-[#D1DDD3] flex items-center justify-center text-[#244434] group-hover:scale-105 transition-all">
                      <QrCode className="w-5 h-5" strokeWidth={1.75} />
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold text-[#18281E] tracking-wide block">
                        Scan QR Code
                      </span>
                      <span className="text-[11px] text-[#6B7E72] block">
                        Tap to activate camera
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="relative aspect-square max-w-[240px] mx-auto w-full rounded-2xl overflow-hidden bg-black/90 border border-[#E2DDD4]">
                  {/* Corner Brackets over Live Stream */}
                  <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-white rounded-tl-[4px] z-20 pointer-events-none" />
                  <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-2 border-r-2 border-white rounded-tr-[4px] z-20 pointer-events-none" />
                  <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-2 border-l-2 border-white rounded-bl-[4px] z-20 pointer-events-none" />
                  <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-white rounded-br-[4px] z-20 pointer-events-none" />

                  {/* Connecting Loader */}
                  {cameraStarting && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xs gap-2">
                      <div className="w-5 h-5 border-[1.5px] border-white/20 border-t-white rounded-full animate-spin" />
                      <span className="text-[11px] text-white/70 font-medium">
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
                <div className="mt-2.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-center max-w-[240px] mx-auto">
                  <p className="text-[11px] text-rose-600 font-medium">{cameraError}</p>
                </div>
              )}

              {/* Cancel Button when Active */}
              {isScanning && (
                <div className="mt-2.5 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setIsScanning(false)}
                    className="px-4 py-1.5 rounded-full bg-[#F3F1EB] hover:bg-[#EAE6DE] border border-[#E2DDD4] text-xs font-medium text-[#18281E] transition-all flex items-center gap-1.5 active:scale-95"
                  >
                    <X className="w-3 h-3 text-[#6B7E72]" />
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
