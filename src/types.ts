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
  stamina?: number;
  lastStaminaReset?: string;
}

export type MatchStatus = 'WAITING' | 'READY' | 'IN_PROGRESS' | 'FINISHED';
export type Team = 'A' | 'B' | 'NONE';

export interface LobbyPlayer {
  id: string;
  displayName: string;
  photoURL?: string;
  rating?: number;
  rank?: string;
}

export interface GameResult {
  gameNumber: number;
  teamAScore: number;
  teamBScore: number;
}

export interface Match {
  id: string;
  creatorId: string;
  hostName?: string;
  hostAvatar?: string;
  matchType: '1v1' | '2v2';
  gameFormat: 'single_11' | 'single_15' | 'single_21' | 'best_of_3';
  targetPoints: number;
  status: MatchStatus;
  teamA: LobbyPlayer[];
  teamB: LobbyPlayer[];
  refereeId: string | null;
  referee?: LobbyPlayer | null;
  
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
