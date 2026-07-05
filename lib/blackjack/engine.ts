import type { Card, Rank, Suit } from "./types";

const RANKS: Rank[] = [
  "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A",
];
const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];

export const DECK_COUNT = 4;
export const SHOE_SIZE = DECK_COUNT * 52;
// Reshuffle once the shoe is too depleted to safely deal a round with splits/doubles.
export const RESHUFFLE_THRESHOLD = 52;

let cardSeq = 0;

export function createShoe(deckCount: number = DECK_COUNT): Card[] {
  const cards: Card[] = [];
  for (let d = 0; d < deckCount; d++) {
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        cardSeq += 1;
        cards.push({ id: `${rank}${suit}-${cardSeq}`, rank, suit });
      }
    }
  }
  return shuffle(cards);
}

export function shuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function rankValue(rank: Rank): number {
  if (rank === "A") return 11;
  if (rank === "K" || rank === "Q" || rank === "J") return 10;
  return Number(rank);
}

export function handValue(cards: Card[]): { total: number; soft: boolean } {
  let total = 0;
  let aceCount = 0;
  for (const c of cards) {
    total += rankValue(c.rank);
    if (c.rank === "A") aceCount++;
  }
  let softAces = aceCount;
  while (total > 21 && softAces > 0) {
    total -= 10;
    softAces--;
  }
  return { total, soft: softAces > 0 };
}

export function isBust(cards: Card[]): boolean {
  return handValue(cards).total > 21;
}

export function isNaturalBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && handValue(cards).total === 21;
}

/** Hi-Lo card counting system: low cards +1, neutral 0, high cards -1. */
export function countValue(rank: Rank): number {
  if (rank === "2" || rank === "3" || rank === "4" || rank === "5" || rank === "6") {
    return 1;
  }
  if (rank === "7" || rank === "8" || rank === "9") {
    return 0;
  }
  return -1; // 10, J, Q, K, A
}

export function decksRemaining(shoeLength: number): number {
  return Math.max(shoeLength / 52, 0.25);
}

export function trueCount(runningCount: number, shoeLength: number): number {
  return runningCount / decksRemaining(shoeLength);
}
