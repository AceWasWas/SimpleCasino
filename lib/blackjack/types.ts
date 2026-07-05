export type Suit = "♠" | "♥" | "♦" | "♣";
export type Rank =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K"
  | "A";

export type Card = {
  id: string;
  rank: Rank;
  suit: Suit;
};

export type HandStatus = "active" | "stood" | "bust";
export type HandResult = "win" | "lose" | "push" | "blackjack";

export type PlayerHand = {
  id: string;
  cards: Card[];
  status: HandStatus;
  fromSplit: boolean;
  isAceSplit: boolean;
  doubled: boolean;
  result?: HandResult;
};

export type Phase = "idle" | "player-turn" | "dealer-turn" | "round-over";

export type Stats = {
  hands: number;
  wins: number;
  losses: number;
  pushes: number;
  blackjacks: number;
};

export type GameState = {
  shoe: Card[];
  runningCount: number;
  dealerCards: Card[];
  dealerHoleRevealed: boolean;
  playerHands: PlayerHand[];
  activeHandIndex: number;
  phase: Phase;
  message: string;
  showCount: boolean;
  stats: Stats;
};
