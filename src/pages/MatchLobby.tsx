import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Match } from '../types';
import { useAuth } from '../contexts/AuthContext';
import QRCode from 'react-qr-code';
import { Users, User, Shield } from 'lucide-react';

export default function MatchLobby() {
  const { matchId } = useParams<{ matchId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mocked state
  const [match, setMatch] = useState<Match>({
    id: matchId || 'MOCK',
    creatorId: user?.uid || '',
    status: 'WAITING',
    teamA: [],
    teamB: [],
    refereeId: null,
    currentGame: 1,
    teamAScore: 0,
    teamBScore: 0,
    teamAGamesWon: 0,
    teamBGamesWon: 0,
    servingTeam: 'NONE',
    serverNumber: 1,
    gameResults: [],
    matchWinner: 'NONE',
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  const inTeamA = match.teamA.includes(user?.uid || '');
  const inTeamB = match.teamB.includes(user?.uid || '');
  const isReferee = match.refereeId === user?.uid;
  const inMatch = inTeamA || inTeamB || isReferee;

  const joinTeam = (team: 'A' | 'B') => {
    if (!user) return;
    setMatch(prev => {
      const nm = { ...prev };
      if (inTeamA) nm.teamA = nm.teamA.filter(id => id !== user.uid);
      if (inTeamB) nm.teamB = nm.teamB.filter(id => id !== user.uid);
      if (isReferee) nm.refereeId = null;

      if (team === 'A') nm.teamA = [...nm.teamA, user.uid];
      else nm.teamB = [...nm.teamB, user.uid];
      
      return nm;
    });
  };

  const joinReferee = () => {
    if (!user) return;
    setMatch(prev => {
      const nm = { ...prev };
      if (inTeamA) nm.teamA = nm.teamA.filter(id => id !== user.uid);
      if (inTeamB) nm.teamB = nm.teamB.filter(id => id !== user.uid);
      nm.refereeId = user.uid;
      return nm;
    });
  };

  const leaveMatch = () => {
    if (!user) return;
    setMatch(prev => {
      const nm = { ...prev };
      if (inTeamA) nm.teamA = nm.teamA.filter(id => id !== user.uid);
      if (inTeamB) nm.teamB = nm.teamB.filter(id => id !== user.uid);
      if (isReferee) nm.refereeId = null;
      return nm;
    });
  };

  const startMatch = () => {
    navigate(`/match/${matchId}/live`);
  };

  // Mock ability to start without requiring full team for preview purposes
  const canStart = isReferee; 

  return (
    <div className="p-6 pb-24 flex flex-col items-center">
      <div className="bg-card p-6 rounded-2xl border border-[#ffffff10] mb-8 flex flex-col items-center text-center relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_15px_rgba(20,184,166,0.5)]"></div>
        <h2 className="text-[10px] uppercase tracking-widest text-[#ffffff60] mb-4">Session {match.id}</h2>
        <div className="bg-white p-4 rounded-xl shadow-[0_0_15px_rgba(20,184,166,0.2)]">
          <QRCode value={match.id} size={150} />
        </div>
        <p className="text-[10px] uppercase tracking-widest text-[#ffffff40] mt-4 font-mono">Scan to Join</p>
      </div>

      <div className="w-full max-w-md space-y-4">
        {/* Team A */}
        <div className="bg-card p-4 rounded-xl border border-[#ffffff10] relative overflow-hidden">
          <div className="absolute left-0 top-0 w-1 h-full bg-primary shadow-[0_0_15px_rgba(20,184,166,0.5)]"></div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[10px] uppercase tracking-widest flex items-center text-primary"><Users className="w-4 h-4 mr-2" /> Team A</h3>
            {!inTeamA && match.teamA.length < 2 && (
              <button onClick={() => joinTeam('A')} className="text-[10px] uppercase tracking-widest bg-[#ffffff05] border border-[#ffffff10] text-primary px-3 py-1 rounded-full font-bold">Join</button>
            )}
          </div>
          <div className="space-y-2">
            {match.teamA.map((id) => (
              <div key={id} className="text-sm font-light text-text-main flex items-center"><User className="w-4 h-4 mr-2 opacity-50" /> Player {id.substring(0,4)}</div>
            ))}
            {match.teamA.length === 0 && <div className="text-[10px] uppercase tracking-widest text-[#ffffff40] italic">Awaiting connection...</div>}
          </div>
        </div>

        {/* Team B */}
        <div className="bg-card p-4 rounded-xl border border-[#ffffff10] relative overflow-hidden">
          <div className="absolute left-0 top-0 w-1 h-full bg-secondary shadow-[0_0_15px_rgba(74,222,128,0.5)]"></div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[10px] uppercase tracking-widest flex items-center text-secondary"><Users className="w-4 h-4 mr-2" /> Team B</h3>
            {!inTeamB && match.teamB.length < 2 && (
              <button onClick={() => joinTeam('B')} className="text-[10px] uppercase tracking-widest bg-[#ffffff05] border border-[#ffffff10] text-secondary px-3 py-1 rounded-full font-bold">Join</button>
            )}
          </div>
          <div className="space-y-2">
            {match.teamB.map((id) => (
              <div key={id} className="text-sm font-light text-text-main flex items-center"><User className="w-4 h-4 mr-2 opacity-50" /> Player {id.substring(0,4)}</div>
            ))}
            {match.teamB.length === 0 && <div className="text-[10px] uppercase tracking-widest text-[#ffffff40] italic">Awaiting connection...</div>}
          </div>
        </div>

        {/* Referee */}
        <div className="bg-card p-4 rounded-xl border border-[#ffffff10] relative overflow-hidden">
          <div className="absolute left-0 top-0 w-1 h-full bg-[#ffffff40]"></div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[10px] uppercase tracking-widest flex items-center text-[#ffffff60]"><Shield className="w-4 h-4 mr-2" /> Referee</h3>
            {!match.refereeId && !isReferee && (
              <button onClick={joinReferee} className="text-[10px] uppercase tracking-widest bg-[#ffffff05] border border-[#ffffff10] text-[#ffffff80] px-3 py-1 rounded-full font-bold">Assume Control</button>
            )}
          </div>
          <div className="space-y-2">
            {match.refereeId ? (
              <div className="text-sm font-light text-text-main flex items-center"><User className="w-4 h-4 mr-2 opacity-50" /> Referee {match.refereeId.substring(0,4)}</div>
            ) : (
              <div className="text-[10px] uppercase tracking-widest text-[#ffffff40] italic">Awaiting connection...</div>
            )}
          </div>
        </div>
      </div>
      
      {inMatch && match.status === 'WAITING' && (
        <button onClick={leaveMatch} className="mt-6 text-[10px] uppercase tracking-widest font-bold text-[#ffffff40] hover:text-[#ffffff80] underline">Disconnect</button>
      )}

      {isReferee && (
        <div className="fixed bottom-[80px] w-full px-6 max-w-md">
          <button 
            onClick={startMatch} 
            disabled={!canStart}
            className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg transition-all ${canStart ? 'bg-primary text-[#050a0a] active:scale-95 shadow-[0_0_15px_rgba(20,184,166,0.5)]' : 'bg-[#0a1111] text-[#ffffff40] border border-[#ffffff10] cursor-not-allowed'}`}
          >
            Initiate Sequence
          </button>
        </div>
      )}
    </div>
  );
}

