export type BetColor = "red" | "black" | "green";

// Custom 15-pocket wheel: 0 is green, 1-14 alternate red/black.
export const NUMBERS: number[] = Array.from({ length: 15 }, (_, i) => i);

export function colorOf(n: number): BetColor {
  if (n === 0) return "green";
  return n % 2 === 1 ? "red" : "black";
}

export const PAYOUTS: Record<BetColor, number> = {
  red: 2,
  black: 2,
  green: 14,
};

export function spinResult(): number {
  return Math.floor(Math.random() * NUMBERS.length);
}
