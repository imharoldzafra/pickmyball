import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Match, UserProfile } from '../types';

const getRankIcon = (rank: string) => {
  switch (rank.toLowerCase()) {
    case 'rookie': return '🌱';
    case 'challenger': return '🏓';
    case 'contender': return '🏓';
    case 'ace': return '⭐';
    case 'veteran': return '🏆';
    case 'expert': return '💎';
    case 'legend': return '👑';
    default: return '🌱';
  }
};

export default function Home() {
  const { profile, user, logoutMock } = useAuth();
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [playerNames, setPlayerNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!profile || !user) return;
    
    // Backend removed, mocking empty matches
    setRecentMatches([]);
    setLoadingMatches(false);
  }, [profile, user]);

  if (!profile) return null;


  const xpRequired = profile.level * 1000;
  const progressPercent = Math.min(100, Math.round((profile.xp / xpRequired) * 100));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start border-b border-[#ffffff10] pb-6">
        <Link to="/profile" className="nav-btn p-2 -m-2 rounded-2xl flex flex-col items-start gap-3 group">
          <div className="w-16 h-16 rounded-full bg-[#0a1111] border-2 border-primary/50 overflow-hidden shadow-[0_0_15px_rgba(20,184,166,0.3)] group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(20,184,166,0.6)] transition-all">
            {profile.photoURL ? (
              <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary">
                <User className="w-8 h-8" />
              </div>
            )}
          </div>
          <div>
            <h1 className="text-[10px] uppercase tracking-widest text-[#ffffff60] mb-1">Active User</h1>
            <p className="text-3xl font-light tracking-tight text-text-main">{profile.displayName}</p>
          </div>
        </Link>
        <div className="text-right mt-2">
          <p className="text-[10px] uppercase tracking-widest text-primary mb-1">Core Level</p>
          <p className="text-2xl font-mono text-text-main">{profile.level}</p>
        </div>
      </div>

      {/* Main Stats Card */}
      <div className="bg-card rounded-2xl p-6 relative overflow-hidden group border border-[#ffffff10]">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary shadow-[0_0_15px_rgba(20,184,166,0.5)]"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-[10px] uppercase tracking-widest text-[#ffffff60] mt-2">Competitive Standing</h2>
            <div className="flex flex-col items-center gap-1 bg-[#ffffff05] px-4 py-2 rounded-xl border border-[#ffffff10]">
              <span className="text-xl opacity-90">{getRankIcon(profile.rank)}</span>
              <span className="text-[10px] tracking-widest uppercase text-primary font-bold">{profile.rank}</span>
            </div>
          </div>
          <div className="text-5xl font-light tracking-tighter text-text-main mb-6">
            {profile.rating} <span className="text-sm font-normal text-text-light uppercase tracking-widest">CR</span>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between text-xs font-mono text-primary">
              <span>XP.STREAM</span>
              <span>{profile.xp} / {xpRequired}</span>
            </div>
            <div className="h-1 w-full bg-[#ffffff05] rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all shadow-[0_0_10px_rgba(20,184,166,0.4)]" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats Group */}
      <div className="space-y-4">
        {/* Player Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#0a1111] border border-[#ffffff10] p-4 rounded-xl flex flex-col justify-center space-y-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-[#ffffff20]"></div>
            <span className="text-[10px] uppercase tracking-widest text-[#ffffff60]">Total Battles</span>
            <span className="text-2xl font-light tracking-tight text-text-main">{profile.battles}</span>
          </div>
          <div className="bg-[#0a1111] border border-[#ffffff10] p-4 rounded-xl flex flex-col justify-center space-y-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-primary/40"></div>
            <span className="text-[10px] uppercase tracking-widest text-primary">Victories</span>
            <span className="text-2xl font-light tracking-tight text-text-main">{profile.wins}</span>
          </div>
          <div className="bg-[#0a1111] border border-[#ffffff10] p-4 rounded-xl flex flex-col justify-center space-y-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-accent-terra/40"></div>
            <span className="text-[10px] uppercase tracking-widest text-accent-terra">Defeats</span>
            <span className="text-2xl font-light tracking-tight text-text-main">{profile.losses}</span>
          </div>
          <div className="bg-[#0a1111] border border-[#ffffff10] p-4 rounded-xl flex flex-col justify-center space-y-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-secondary/40"></div>
            <span className="text-[10px] uppercase tracking-widest text-secondary">Longest Win Streak</span>
            <span className="text-2xl font-light tracking-tight text-text-main">{profile.longestStreak}</span>
          </div>
        </div>

        {/* Recent Streak */}
        <div className="bg-card p-6 rounded-2xl border border-[#ffffff10] flex items-center justify-between">
          <div>
            <h2 className="text-[10px] uppercase tracking-widest text-[#ffffff60] mb-2">Victory Chain</h2>
            <div className="flex items-baseline gap-2">
               <span className="text-3xl font-light tracking-tighter text-text-main">{profile.currentStreak}</span>
               <span className="text-xs text-secondary uppercase tracking-widest font-mono">Wins</span>
            </div>
          </div>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`h-8 w-2 rounded-sm ${i < profile.currentStreak ? 'bg-secondary shadow-[0_0_10px_rgba(74,222,128,0.4)]' : 'bg-[#ffffff05]'}`}></div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Match History */}
      <div className="bg-[#0a1111] rounded-2xl border border-[#ffffff10] overflow-hidden relative">
        <div className="p-4 border-b border-[#ffffff10]">
          <h2 className="text-[10px] uppercase tracking-widest text-[#ffffff60]">Combat Log</h2>
        </div>
        <div className="p-4 space-y-3">
          {loadingMatches ? (
            <div className="text-center text-[#ffffff40] text-sm py-4">Scanning records...</div>
          ) : recentMatches.length === 0 ? (
            <div className="text-center text-[#ffffff40] text-sm py-4">No recent matches found.</div>
          ) : (
            recentMatches.map((match) => {
              const isTeamA = match.teamA.includes(user!.uid);
              const isWinner = (match.matchWinner === 'A' && isTeamA) || (match.matchWinner === 'B' && !isTeamA);
              const myScore = isTeamA ? match.teamAGamesWon : match.teamBGamesWon;
              const theirScore = isTeamA ? match.teamBGamesWon : match.teamAGamesWon;
              
              const opponentIds = isTeamA ? match.teamB : match.teamA;
              const opponentNames = opponentIds.map(id => playerNames[id] || 'Unknown').join(' & ');

              const crChange = isTeamA ? (match.ratingChangeA || 0) : (match.ratingChangeB || 0);
              const crChangeDisplay = crChange > 0 ? `+${crChange}` : crChange;

              return (
                <div key={match.id} className="flex items-center justify-between bg-card border border-[#ffffff05] p-4 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-10 rounded-sm ${isWinner ? 'bg-primary shadow-[0_0_8px_rgba(20,184,166,0.6)]' : 'bg-accent-terra shadow-[0_0_8px_rgba(255,230,0,0.4)]'}`}></div>
                    <div>
                      <div className="text-sm font-mono text-text-main mb-1">
                        {myScore} - {theirScore} <span className="text-xs font-sans font-light text-[#ffffff80] ml-2">vs {opponentNames || 'Ghost'}</span>
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-[#ffffff60]">
                        {new Date(match.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono text-sm ${isWinner ? 'text-primary' : 'text-accent-terra'}`}>
                      {crChangeDisplay} CR
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-[#ffffff40]">
                      {isWinner ? 'Victory' : 'Defeat'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      <div className="pt-4 text-center pb-8">
        <button onClick={logoutMock} className="text-sm text-[#ffffff40] hover:text-accent-terra transition-colors uppercase tracking-widest font-bold">Sign Out</button>
      </div>
    </div>
  );
}
