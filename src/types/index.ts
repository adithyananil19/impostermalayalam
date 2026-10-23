// ─── Player ───────────────────────────────────────────────────────────────────

export interface Player {
  id: string;
  name: string;
}

// ─── Word / Category ──────────────────────────────────────────────────────────

export interface WordEntry {
  id: string;
  word: string;
  hint: string;
  relatedWord?: string;
  category: string;
  tags?: string[];
  isCustom?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  isCustom?: boolean;
  enabled: boolean;
}

// ─── Imposter information modes ───────────────────────────────────────────────

export type ImposterMode = 'no_word' | 'vague_hint' | 'related_word';

// ─── Reveal interaction style ─────────────────────────────────────────────────

export type RevealStyle = 'tap' | 'hold';

// ─── Voting / Elimination ─────────────────────────────────────────────────────

export type VoteOutcome = 'reveal_and_end' | 'eliminate_and_continue';

// ─── Game mode ────────────────────────────────────────────────────────────

export type GameMode = 'single' | 'multi';

// ─── Game settings ────────────────────────────────────────────────────────────

export interface GameSettings {
  gameMode: GameMode;
  imposterCount: number;
  imposterMode: ImposterMode;
  enabledCategories: string[];
  timerEnabled: boolean;
  timerSeconds: number;
  revealStyle: RevealStyle;
  voteOutcome: VoteOutcome;
  roundCount: number; // 0 = unlimited / manual
  trackScores: boolean;
}

export const DEFAULT_SETTINGS: GameSettings = {
  gameMode: 'single',
  imposterCount: 1,
  imposterMode: 'vague_hint',
  enabledCategories: [],
  timerEnabled: false,
  timerSeconds: 120,
  revealStyle: 'tap',
  voteOutcome: 'reveal_and_end',
  roundCount: 1,
  trackScores: false,
};

// ─── Player roles ─────────────────────────────────────────────────────────────

export type Role = 'regular' | 'imposter';

export interface PlayerRole {
  playerId: string;
  role: Role;
  /** What the player sees: secret word for regular, hint/related/nothing for imposter */
  displayInfo: string;
}

// ─── Votes ────────────────────────────────────────────────────────────────────

export interface Vote {
  voterId: string;
  targetId: string;
}

export interface VoteTally {
  targetId: string;
  count: number;
}

export interface VoteResolution {
  tallies: VoteTally[];
  maxVotes: number;
  isTie: boolean;
  tiedPlayerIds: string[];
  eliminatedPlayerId?: string;
  imposterWon: boolean;
}

// ─── Game state machine ───────────────────────────────────────────────────────

export type GamePhase =
  | 'setup'
  | 'role_reveal'
  | 'discussion'
  | 'voting'
  | 'vote_result'
  | 'round_result'
  | 'next_round'
  | 'game_over';

export interface RoundState {
  roundNumber: number;
  word: WordEntry;
  roles: PlayerRole[];
  revealIndex: number; // which player is currently revealing
  votes: Vote[];
  eliminatedPlayerId?: string;
  imposterWon?: boolean;
}

export interface ScoreEntry {
  playerId: string;
  points: number;
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  settings: GameSettings;
  currentRound?: RoundState;
  scores: ScoreEntry[];
  completedRounds: RoundState[];
  usedWordIds: string[];
}

// ─── Navigation / UI ──────────────────────────────────────────────────────────

export type Screen =
  | 'home'
  | 'new-game'
  | 'player-entry'
  | 'category-selection'
  | 'game-settings'
  | 'role-reveal'
  | 'discussion'
  | 'voting'
  | 'results'
  | 'score'
  | 'custom-words'
  | 'preferences';

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface GameStats {
  gamesPlayed: number;
  roundsPlayed: number;
  imposterWins: number;
  regularWins: number;
  lastPlayedAt?: string;
}

// ─── Preferences & Storage ───────────────────────────────────────────────────

export interface UserPreferences {
  reduceMotion: boolean;
  soundEnabled: boolean;
  hapticFeedback: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  reduceMotion: false,
  soundEnabled: true,
  hapticFeedback: true,
};

export interface CustomDataExport {
  version: number;
  exportedAt: string;
  categories: Category[];
  words: WordEntry[];
}

