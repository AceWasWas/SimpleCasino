export const GRID_SIZE = 5;
export const TOTAL_TILES = GRID_SIZE * GRID_SIZE; // 25

export const MINE_OPTIONS = [1, 3, 5, 10, 24] as const;
export type MineCount = (typeof MINE_OPTIONS)[number];

// House edge applied on top of fair odds, matching typical casino Mines games.
const HOUSE_EDGE = 0.99;

/** Fair (0-edge) multiplier for revealing `revealed` safe tiles in a row. */
export function fairMultiplier(revealed: number, mines: number, total = TOTAL_TILES): number {
  let mult = 1;
  for (let i = 0; i < revealed; i++) {
    mult *= (total - i) / (total - mines - i);
  }
  return mult;
}

export function payoutMultiplier(revealed: number, mines: number): number {
  if (revealed === 0) return 1;
  return fairMultiplier(revealed, mines) * HOUSE_EDGE;
}

export function generateMinePositions(mines: number, total = TOTAL_TILES): Set<number> {
  const indices = Array.from({ length: total }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return new Set(indices.slice(0, mines));
}
