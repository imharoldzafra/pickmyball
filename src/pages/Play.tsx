import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
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
      // Mock match creation
      const matchId = `PKB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      navigate(`/match/${matchId}/lobby`);
      setCreating(false);
    }, 500);
  };


  useEffect(() => {
    if (mode === 'scan') {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
      scanner.render((text) => {
        scanner.clear();
        navigate(`/match/${text}/lobby`);
      }, (err) => {
        // ignore scan errors
      });
      return () => {
        scanner.clear().catch(() => {});
      };
    }
  }, [mode, navigate]);

  return (
    <div className="p-6">
      <div className="flex bg-card p-1 rounded-xl mb-8 border border-[#ffffff10]">
        <button 
          onClick={() => setMode('create')}
          className={`flex-1 py-2 text-[10px] uppercase tracking-widest font-bold rounded-lg transition-colors ${mode === 'create' ? 'bg-[#050a0a] text-primary border border-[#ffffff10] shadow-[0_0_15px_rgba(20,184,166,0.2)]' : 'text-[#ffffff40]'}`}
        >
          Create
        </button>
        <button 
          onClick={() => setMode('scan')}
          className={`flex-1 py-2 text-[10px] uppercase tracking-widest font-bold rounded-lg transition-colors ${mode === 'scan' ? 'bg-[#050a0a] text-primary border border-[#ffffff10] shadow-[0_0_15px_rgba(20,184,166,0.2)]' : 'text-[#ffffff40]'}`}
        >
          Join
        </button>
      </div>

      {mode === 'create' && (
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-6 mt-12 bg-card p-8 rounded-2xl border border-[#ffffff10] relative overflow-hidden">
            <div className="text-center space-y-2 relative z-10">
              <h2 className="text-2xl font-light tracking-tight text-text-main">Start a New Match</h2>
              <p className="text-[10px] uppercase tracking-widest text-[#ffffff60]">Establish a secure session for others to sync.</p>
            </div>
            <button 
              onClick={handleCreate} 
              disabled={creating}
              className="bg-primary text-[#050a0a] w-full max-w-xs py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] active:scale-95 transition-transform hover:shadow-[0_0_20px_rgba(20,184,166,0.6)] relative z-10"
            >
              {creating ? 'Establishing...' : 'Execute'}
            </button>
          </div>

          <div className="w-full mt-4 bg-[#0a1111] border border-[#ffffff10] rounded-xl p-6 overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <h3 className="text-[10px] uppercase tracking-widest text-[#ffffff60] mb-4 text-center">System Ranks & CR</h3>
            <div className="space-y-3">
              {[
                { label: 'Rookie', range: '0–799', icon: '🌱' },
                { label: 'Challenger', range: '800–999', icon: '🏓' },
                { label: 'Contender', range: '1,000–1,199', icon: '🏓' },
                { label: 'Ace', range: '1,200–1,399', icon: '⭐' },
                { label: 'Veteran', range: '1,400–1,599', icon: '🏆' },
                { label: 'Expert', range: '1,600–1,799', icon: '💎' },
                { label: 'Legend', range: '1,800+', icon: '👑' },
              ].map(rank => (
                <div key={rank.label} className="flex justify-between items-center text-sm border-b border-[#ffffff05] pb-2 last:border-0 last:pb-0">
                  <span className="font-light flex items-center gap-2">
                    <span className="opacity-80">{rank.icon}</span> 
                    <span className="text-text-main">{rank.label}</span>
                  </span>
                  <span className="font-mono text-primary text-[10px] uppercase tracking-widest">{rank.range} CR</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {mode === 'scan' && (
        <div className="flex flex-col items-center justify-center space-y-6 mt-8 bg-card p-6 rounded-2xl border border-[#ffffff10] relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-secondary shadow-[0_0_15px_rgba(74,222,128,0.5)]"></div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-light tracking-tight text-text-main">Optical Sync</h2>
            <p className="text-[10px] uppercase tracking-widest text-[#ffffff60]">Scan session code to join network.</p>
          </div>
          <div id="reader" className="w-full max-w-sm rounded-2xl overflow-hidden border border-[#ffffff10] shadow-[0_0_15px_rgba(74,222,128,0.1)]"></div>
        </div>
      )}
    </div>
  );
}
