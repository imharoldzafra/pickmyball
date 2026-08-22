import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Match, Team } from '../types';
import { useAuth } from '../contexts/AuthContext';

export default function LiveMatch() {
  const { matchId } = useParams<{ matchId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [finishing, setFinishing] = useState(false);

  // Mock initial state
  const [match, setMatch] = useState<Match>({
    id: matchId || 'MOCK',
    creatorId: user?.uid || '',
    status: 'IN_PROGRESS',
    teamA: [user?.uid || 'A1'],
    teamB: ['B1'],
    refereeId: user?.uid || null,
    currentGame: 1,
    teamAScore: 0,
    teamBScore: 0,
    teamAGamesWon: 0,
    teamBGamesWon: 0,
    servingTeam: 'A',
    serverNumber: 2,
    gameResults: [],
    matchWinner: 'NONE',
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  const isReferee = match.refereeId === user?.uid;

  const handleScore = async (winner: Team) => {
    if (!isReferee) return;
    
    setMatch(prev => {
      const nextState = { ...prev };
      
      if (winner === nextState.servingTeam) {
        // Point scored!
        if (nextState.servingTeam === 'A') nextState.teamAScore++;
        else nextState.teamBScore++;
        
        // Check game win
        const winBy2 = Math.abs(nextState.teamAScore - nextState.teamBScore) >= 2;
        const reached11 = nextState.teamAScore >= 11 || nextState.teamBScore >= 11;
        
        if (reached11 && winBy2) {
          // End of game
          nextState.gameResults = [...nextState.gameResults, {
            gameNumber: nextState.currentGame,
            teamAScore: nextState.teamAScore,
            teamBScore: nextState.teamBScore
          }];
          
          if (nextState.teamAScore > nextState.teamBScore) nextState.teamAGamesWon++;
          else nextState.teamBGamesWon++;
          
          // Match over?
          if (nextState.teamAGamesWon === 2 || nextState.teamBGamesWon === 2) {
            nextState.matchWinner = nextState.teamAGamesWon === 2 ? 'A' : 'B';
            nextState.status = 'FINISHED';
          } else {
            nextState.currentGame++;
            nextState.teamAScore = 0;
            nextState.teamBScore = 0;
            // Alternate starting team per game (simplification)
            nextState.servingTeam = nextState.currentGame % 2 === 0 ? 'B' : 'A';
            nextState.serverNumber = 2; // Exception rule applies to start of any game
          }
        }
      } else {
        // Side out logic
        // First service of a game starts on Server 2
        const isFirstService = nextState.teamAScore === 0 && nextState.teamBScore === 0 && nextState.serverNumber === 2;
        
        if (nextState.serverNumber === 1 && !isFirstService) {
          nextState.serverNumber = 2;
        } else {
          // Side out
          nextState.servingTeam = nextState.servingTeam === 'A' ? 'B' : 'A';
          nextState.serverNumber = 1;
        }
      }

      nextState.updatedAt = Date.now();
      return nextState;
    });
  };

  if (match.status === 'FINISHED') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050a0a] p-6 text-center space-y-6 relative overflow-hidden">
        <div className="text-6xl mb-4 drop-shadow-[0_0_15px_rgba(20,184,166,0.8)]">🏆</div>
        <h1 className="text-5xl font-light tracking-tighter text-text-main">VICTORY</h1>
        <h2 className="text-2xl text-primary font-mono uppercase tracking-widest drop-shadow-[0_0_10px_rgba(20,184,166,0.4)]">TEAM {match.matchWinner}</h2>
        <div className="space-y-4 mt-6 bg-[#0a1111] p-8 rounded-2xl border border-[#ffffff10] w-full max-w-sm relative z-10">
          {match.gameResults.map(gr => (
            <div key={gr.gameNumber} className="flex justify-between text-xl font-mono">
              <span className="text-[#ffffff60]">G.{gr.gameNumber}</span>
              <span className={gr.teamAScore > gr.teamBScore ? "text-primary drop-shadow-[0_0_5px_rgba(20,184,166,0.5)]" : "text-[#ffffff40]"}>{gr.teamAScore}</span>
              <span className="text-[#ffffff20]">-</span>
              <span className={gr.teamBScore > gr.teamAScore ? "text-secondary drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]" : "text-[#ffffff40]"}>{gr.teamBScore}</span>
            </div>
          ))}
        </div>
        <div className="pt-8 relative z-10">
          <button onClick={() => navigate('/')} className="bg-primary text-[#050a0a] px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:shadow-[0_0_15px_rgba(20,184,166,0.8)] transition-all">Exit Match</button>
        </div>
      </div>
    );
  }

  const tAScore = match.teamAScore;
  const tBScore = match.teamBScore;
  const serverStr = match.servingTeam === 'A' ? `${tAScore} - ${tBScore} - ${match.serverNumber}` : `${tBScore} - ${tAScore} - ${match.serverNumber}`;

  return (
    <div className="p-6 pb-24 max-w-lg mx-auto">
      <div className="text-center mb-10 relative">
        <h2 className="text-[10px] font-bold text-[#ffffff60] tracking-widest uppercase">Sequence {match.currentGame}</h2>
        <div className="text-7xl font-light text-text-main my-6 font-mono tracking-tighter relative z-10 drop-shadow-[0_0_15px_rgba(20,184,166,0.2)]">
          {serverStr}
        </div>
        <p className="text-[10px] text-primary uppercase tracking-widest drop-shadow-[0_0_5px_rgba(20,184,166,0.5)]">
          {match.servingTeam === 'A' ? 'Alpha Transmitting' : 'Beta Transmitting'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className={`p-6 rounded-2xl flex flex-col items-center justify-center border relative overflow-hidden ${match.servingTeam === 'A' ? 'border-primary bg-[#ffffff05]' : 'border-[#ffffff10] bg-card'}`}>
          {match.servingTeam === 'A' && <div className="absolute top-0 left-0 w-full h-1 bg-primary shadow-[0_0_15px_rgba(20,184,166,0.8)]"></div>}
          <span className="text-[10px] font-bold text-[#ffffff60] mb-2 uppercase tracking-widest">Alpha</span>
          <span className={`text-5xl font-light font-mono ${match.servingTeam === 'A' ? 'text-primary drop-shadow-[0_0_10px_rgba(20,184,166,0.5)]' : 'text-[#ffffff40]'}`}>{tAScore}</span>
          <span className="text-[10px] text-primary mt-4 uppercase tracking-widest font-mono">{match.teamAGamesWon} WON</span>
        </div>
        <div className={`p-6 rounded-2xl flex flex-col items-center justify-center border relative overflow-hidden ${match.servingTeam === 'B' ? 'border-secondary bg-[#ffffff05]' : 'border-[#ffffff10] bg-card'}`}>
          {match.servingTeam === 'B' && <div className="absolute top-0 left-0 w-full h-1 bg-secondary shadow-[0_0_15px_rgba(74,222,128,0.8)]"></div>}
          <span className="text-[10px] font-bold text-[#ffffff60] mb-2 uppercase tracking-widest">Beta</span>
          <span className={`text-5xl font-light font-mono ${match.servingTeam === 'B' ? 'text-secondary drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]' : 'text-[#ffffff40]'}`}>{tBScore}</span>
          <span className="text-[10px] text-secondary mt-4 uppercase tracking-widest font-mono">{match.teamBGamesWon} WON</span>
        </div>
      </div>

      {isReferee ? (
        <div className="space-y-4 mt-12">
          <button 
            onClick={() => handleScore('A')}
            disabled={finishing}
            className="w-full bg-[#0a1111] text-primary border border-primary py-6 rounded-2xl font-mono text-lg uppercase tracking-widest active:scale-95 transition-transform hover:shadow-[0_0_15px_rgba(20,184,166,0.4)]"
          >
            Alpha Success
          </button>
          <button 
            onClick={() => handleScore('B')}
            disabled={finishing}
            className="w-full bg-[#0a1111] text-secondary border border-secondary py-6 rounded-2xl font-mono text-lg uppercase tracking-widest active:scale-95 transition-transform hover:shadow-[0_0_15px_rgba(74,222,128,0.4)]"
          >
            Beta Success
          </button>
        </div>
      ) : (
        <div className="mt-12 text-center p-6 bg-card rounded-2xl border border-[#ffffff10] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-primary opacity-50"></div>
          <p className="text-[#ffffff60] text-[10px] uppercase tracking-widest flex items-center justify-center font-mono">
            <span className="relative flex h-2 w-2 mr-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Awaiting referee input...
          </p>
        </div>
      )}
    </div>
  );
}
