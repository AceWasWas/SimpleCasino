import type { Card, Rank, Suit } from "./types";

const RANKS: Rank[] = [
  "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A",
];
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

let cardSeq = 0;

export function drawCard(): Card {
  cardSeq += 1;
  const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  return { id: `${rank}${suit}-${cardSeq}`, rank, suit };
}

export function cardValue(rank: Rank): number {
  if (rank === "A") return 1;
  if (rank === "10" || rank === "J" || rank === "Q" || rank === "K") return 0;
  return Number(rank);
}

export function handTotal(cards: Card[]): number {
  const sum = cards.reduce((acc, c) => acc + cardValue(c.rank), 0);
  return sum % 10;
}

export type BetChoice = "player" | "banker" | "tie";
export type Winner = "player" | "banker" | "tie";

export const PAYOUTS: Record<BetChoice, number> = {
  player: 2,
  banker: 2,
  tie: 8,
};

export type RoundResult = {
  playerCards: Card[];
  bankerCards: Card[];
  playerTotal: number;
  bankerTotal: number;
  winner: Winner;
};

/** Standard Punto Banco tableau: does the banker draw a third card? */
function bankerShouldDraw(bankerTotal: number, playerThirdValue: number | null): boolean {
  if (playerThirdValue === null) {
    // Player stood on a 6 or 7 — banker draws on 0-5, stands on 6-7.
    return bankerTotal <= 5;
  }
  switch (bankerTotal) {
    case 0:
    case 1:
    case 2:
      return true;
    case 3:
      return playerThirdValue !== 8;
    case 4:
      return playerThirdValue >= 2 && playerThirdValue <= 7;
    case 5:
      return playerThirdValue >= 4 && playerThirdValue <= 7;
    case 6:
      return playerThirdValue === 6 || playerThirdValue === 7;
    default:
      return false; // 7+ always stands
  }
}

export function playRound(): RoundResult {
  const playerCards = [drawCard(), drawCard()];
  const bankerCards = [drawCard(), drawCard()];
  let playerTotal = handTotal(playerCards);
  let bankerTotal = handTotal(bankerCards);

  const playerNatural = playerTotal >= 8;
  const bankerNatural = bankerTotal >= 8;
  let playerThirdValue: number | null = null;

  if (!playerNatural && !bankerNatural) {
    if (playerTotal <= 5) {
      const card = drawCard();
      playerCards.push(card);
      playerThirdValue = cardValue(card.rank);
      playerTotal = handTotal(playerCards);
    }

    if (bankerShouldDraw(bankerTotal, playerThirdValue)) {
      bankerCards.push(drawCard());
      bankerTotal = handTotal(bankerCards);
    }
  }

  const winner: Winner =
    playerTotal === bankerTotal ? "tie" : playerTotal > bankerTotal ? "player" : "banker";

  return { playerCards, bankerCards, playerTotal, bankerTotal, winner };
}
