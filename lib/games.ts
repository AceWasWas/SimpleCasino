export type Game = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  category: "Table Games" | "Instant Games";
  gradient: string;
};

export const games: Game[] = [
  {
    slug: "blackjack",
    name: "Blackjack",
    tagline: "Beat the dealer to 21",
    description:
      "The classic card duel against the house. Draw, stand, and try to land as close to 21 as possible without going bust.",
    icon: "🃏",
    category: "Table Games",
    gradient: "from-navy-700 via-navy-800 to-navy-900",
  },
  {
    slug: "baccarat",
    name: "Baccarat",
    tagline: "Player vs. Banker",
    description:
      "A simple, elegant card game of chance. Bet on the Player, the Banker, or a Tie and watch the hands unfold.",
    icon: "🎴",
    category: "Table Games",
    gradient: "from-navy-800 via-navy-900 to-primary-950",
  },
  {
    slug: "roulette",
    name: "Roulette",
    tagline: "Spin the wheel",
    description:
      "Pick your numbers, colors, or ranges and watch the wheel decide your fate.",
    icon: "🎡",
    category: "Table Games",
    gradient: "from-primary-950 via-navy-900 to-navy-800",
  },
  {
    slug: "minesweeper",
    name: "Minesweeper",
    tagline: "Clear the grid, avoid the mines",
    description:
      "Reveal tiles one by one and cash in your streak before you hit a hidden mine.",
    icon: "💣",
    category: "Instant Games",
    gradient: "from-navy-900 via-primary-950 to-navy-800",
  },
  {
    slug: "dragon-tower",
    name: "Dragon Tower",
    tagline: "Climb the tower",
    description:
      "Choose a path up the tower one level at a time. The higher you climb, the bigger the risk.",
    icon: "🐉",
    category: "Instant Games",
    gradient: "from-navy-800 via-navy-900 to-primary-950",
  },
];

export function getGame(slug: string): Game | undefined {
  return games.find((g) => g.slug === slug);
}
