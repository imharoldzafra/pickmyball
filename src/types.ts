export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  level: number;
  xp: number;
  rating: number;
  rank: string;
  wins: number;
  losses: number;
  battles: number;
  currentStreak: number;
  longestStreak: number;
  highestRating: number;
  createdAt: number;
}

export type MatchStatus = 'WAITING' | 'READY' | 'IN_PROGRESS' | 'FINISHED';
export type Team = 'A' | 'B' | 'NONE';

export interface GameResult {
  gameNumber: number;
  teamAScore: number;
  teamBScore: number;
}

export interface Match {
  id: string;
  creatorId: string;
  status: MatchStatus;
  teamA: string[];
  teamB: string[];
  refereeId: string | null;
  
  currentGame: number;
  teamAScore: number;
  teamBScore: number;
  teamAGamesWon: number;
  teamBGamesWon: number;
  servingTeam: Team;
  serverNumber: 1 | 2;
  
  gameResults: GameResult[];
  
  matchWinner: Team;
  createdAt: number;
  updatedAt: number;
  processed?: boolean;
  ratingChangeA?: number;
  ratingChangeB?: number;
}

export interface FriendRequest {
  id: string;
  fromId: string;
  toId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: number;
}

export interface Friend {
  friendId: string;
  addedAt: number;
}
