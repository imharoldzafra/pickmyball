import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { PlusCircle, QrCode, Award } from 'lucide-react';
import PickleballPaddle from '../components/icons/PickleballPaddle';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function Play() {
  const [searchParams] = useSearchParams();
  const defaultAction = searchParams.get('action') || 'create';
  const [mode, setMode] = useState<'create' | 'scan'>(defaultAction as any);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!user) return;
    setCreating(true);
    setTimeout(() => {
      const matchId = `PKB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      navigate(`/match/${matchId}/lobby`);
      setCreating(false);
    }, 400);
  };

  useEffect(() => {
    if (mode === 'scan') {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 220, height: 220 } }, false);
      scanner.render((text) => {
        scanner.clear();
        navigate(`/match/${text}/lobby`);
      }, () => {});
      return () => {
        scanner.clear().catch(() => {});
      };
    }
  }, [mode, navigate]);

  return (
    <div className="p-5 space-y-6">
      {/* Mode Segmented Glass Switcher */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex bg-white/[0.06] backdrop-blur-2xl p-1.5 rounded-full border border-white/10 shadow-sm relative z-10"
      >
        <button 
          onClick={() => setMode('create')}
          className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-2 active:scale-96 ${
            mode === 'create' 
              ? 'bg-primary text-[#050a0a] shadow-[0_0_12px_rgba(16,185,129,0.25)] font-extrabold' 
              : 'text-text-light hover:text-text-main'
          }`}
        >
          <PlusCircle className="w-4 h-4" /> Create Match
        </button>
        <button 
          onClick={() => setMode('scan')}
          className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-full transition-all flex items-center justify-center gap-2 active:scale-96 ${
            mode === 'scan' 
              ? 'bg-primary text-[#050a0a] shadow-[0_0_12px_rgba(16,185,129,0.25)] font-extrabold' 
              : 'text-text-light hover:text-text-main'
          }`}
        >
          <QrCode className="w-4 h-4" /> Join via QR
        </button>
      </motion.div>

      {mode === 'create' && (
        <div className="space-y-6 relative z-10">
          {/* Create Match Glass Hero Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center justify-center text-center space-y-6 bg-white/[0.03] backdrop-blur-md p-8 rounded-3xl border-t border-t-white/25 border-x border-x-white/10 border-b border-b-white/5 relative overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
          >
            <div className="w-16 h-16 rounded-3xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(16,185,129,0.25)] backdrop-blur-md">
              <PickleballPaddle className="w-8 h-8 text-emerald-400" />
            </div>

            <div className="space-y-2 max-w-xs">
              <h2 className="text-2xl font-black tracking-tight text-white">Start a New Match</h2>
              <p className="text-xs text-text-light leading-relaxed">
                Generate a live match room code or QR code for players and referee to join.
              </p>
            </div>

            <button 
              onClick={handleCreate} 
              disabled={creating}
              className="bg-gradient-to-r from-primary to-secondary text-[#050a0a] w-full max-w-xs py-4 rounded-2xl font-black uppercase tracking-wider text-xs shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-transform active:scale-96"
            >
              {creating ? 'Creating Match Room...' : 'Create Match Lobby'}
            </button>
          </motion.div>

          {/* Ranks Breakdown Glass Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="bg-white/[0.03] backdrop-blur-md border-t border-t-white/20 border-x border-x-white/10 border-b border-b-white/5 rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.3)] space-y-4"
          >
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
              <Award className="w-4 h-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-light">Rating Tier System</h3>
            </div>
            
            <div className="space-y-2.5">
              {[
                { label: 'Rookie', range: '0 – 799 CR', icon: '🌱' },
                { label: 'Challenger', range: '800 – 1,199 CR', icon: '🏓' },
                { label: 'Veteran', range: '1,200 – 1,599 CR', icon: '🏆' },
                { label: 'Expert', range: '1,600 – 2,499 CR', icon: '💎' },
                { label: 'Legend', range: '2,500+ CR', icon: '👑' },
              ].map((rank, idx) => (
                <motion.div 
                  key={rank.label} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.03 }}
                  className="flex justify-between items-center text-xs p-2.5 rounded-xl transition-colors"
                >
                  <span className="font-semibold flex items-center gap-2 text-text-main">
                    <span className="text-sm">{rank.icon}</span> {rank.label}
                  </span>
                  <span className="font-mono text-primary text-[11px] font-bold bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                    {rank.range}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {mode === 'scan' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center space-y-5 bg-white/[0.05] backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-sm text-center relative z-10"
        >
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-white">Scan Match QR</h2>
            <p className="text-xs text-text-light">Point your camera at a match host's QR code to join.</p>
          </div>
          <div id="reader" className="w-full max-w-sm rounded-2xl overflow-hidden border border-primary/20 bg-black/40"></div>
        </motion.div>
      )}
    </div>
  );
}
