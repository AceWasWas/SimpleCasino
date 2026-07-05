export const FLOORS = 6;
export const TILES_PER_FLOOR = 4;

export const BOMB_OPTIONS = [1, 2, 3] as const;
export type BombCount = (typeof BOMB_OPTIONS)[number];

// House edge applied on top of fair odds, matching the other casino games here.
const HOUSE_EDGE = 0.99;

export function safeTilesPerFloor(bombs: number): number {
  return TILES_PER_FLOOR - bombs;
}

/** Fair per-floor multiplier: 4 tiles, only `safeTilesPerFloor` are safe. */
export function perFloorMultiplier(bombs: number): number {
  return TILES_PER_FLOOR / safeTilesPerFloor(bombs);
}

export function payoutMultiplier(floorsCleared: number, bombs: number): number {
  if (floorsCleared === 0) return 1;
  return Math.pow(perFloorMultiplier(bombs), floorsCleared) * HOUSE_EDGE;
}

function generateFloorBombs(bombs: number): Set<number> {
  const indices = Array.from({ length: TILES_PER_FLOOR }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return new Set(indices.slice(0, bombs));
}

export function generateTower(bombs: number): Set<number>[] {
  return Array.from({ length: FLOORS }, () => generateFloorBombs(bombs));
}
