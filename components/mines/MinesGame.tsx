"use client";

import { useState } from "react";
import {
  GRID_SIZE,
  MINE_OPTIONS,
  TOTAL_TILES,
  generateMinePositions,
  payoutMultiplier,
} from "@/lib/mines/engine";

type Phase = "setup" | "playing" | "ended";
type Outcome = "win" | "lose" | null;
type Stats = { games: number; wins: number; losses: number; bestMultiplier: number };

export default function MinesGame() {
  const [mineCount, setMineCount] = useState<number>(3);
  const [phase, setPhase] = useState<Phase>("setup");
  const [minePositions, setMinePositions] = useState<Set<number>>(new Set());
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [bustedTile, setBustedTile] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [finalMultiplier, setFinalMultiplier] = useState(1);
  const [stats, setStats] = useState<Stats>({ games: 0, wins: 0, losses: 0, bestMultiplier: 0 });

  const safeTiles = TOTAL_TILES - mineCount;
  const currentMultiplier = payoutMultiplier(revealed.size, mineCount);
  const nextMultiplier = payoutMultiplier(revealed.size + 1, mineCount);

  function startGame() {
    setMinePositions(generateMinePositions(mineCount));
    setRevealed(new Set());
    setBustedTile(null);
    setOutcome(null);
    setFinalMultiplier(1);
    setPhase("playing");
  }

  function revealTile(index: number) {
    if (phase !== "playing" || revealed.has(index)) return;

    if (minePositions.has(index)) {
      setBustedTile(index);
      setOutcome("lose");
      setPhase("ended");
      setStats((s) => ({ ...s, games: s.games + 1, losses: s.losses + 1 }));
      return;
    }

    const nextRevealed = new Set(revealed);
    nextRevealed.add(index);
    setRevealed(nextRevealed);

    if (nextRevealed.size === safeTiles) {
      const mult = payoutMultiplier(nextRevealed.size, mineCount);
      setFinalMultiplier(mult);
      setOutcome("win");
      setPhase("ended");
      setStats((s) => ({
        games: s.games + 1,
        wins: s.wins + 1,
        losses: s.losses,
        bestMultiplier: Math.max(s.bestMultiplier, mult),
      }));
    }
  }

  function cashOut() {
    if (phase !== "playing" || revealed.size === 0) return;
    const mult = payoutMultiplier(revealed.size, mineCount);
    setFinalMultiplier(mult);
    setOutcome("win");
    setPhase("ended");
    setStats((s) => ({
      games: s.games + 1,
      wins: s.wins + 1,
      losses: s.losses,
      bestMultiplier: Math.max(s.bestMultiplier, mult),
    }));
  }

  function playAgain() {
    setPhase("setup");
    setOutcome(null);
    setBustedTile(null);
  }

  let message = "Choose your mine count and start the game.";
  if (phase === "playing") {
    message =
      revealed.size === 0
        ? "Pick a tile to reveal — you can cash out anytime after your first safe pick."
        : `Cash out now for ${currentMultiplier.toFixed(2)}x, or keep pushing your luck.`;
  } else if (phase === "ended") {
    if (outcome === "win") {
      message =
        revealed.size === safeTiles
          ? `Board cleared! Auto cashed out at ${finalMultiplier.toFixed(2)}x!`
          : `Cashed out at ${finalMultiplier.toFixed(2)}x!`;
    } else {
      message = "Boom! You hit a mine and lost it all.";
    }
  }

  function tileVisual(index: number): { icon: string; cls: string } {
    const isRevealedSafe = revealed.has(index);
    const isMine = minePositions.has(index);
    const isBustedTile = bustedTile === index;

    if (phase === "ended") {
      if (isBustedTile) return { icon: "💣", cls: "bg-red-600 text-white border-red-500" };
      if (isMine) return { icon: "💣", cls: "bg-red-900/40 text-red-300 border-red-800/60" };
      if (isRevealedSafe) {
        return { icon: "💎", cls: "bg-primary-500/20 text-primary-300 border-primary-500" };
      }
      return { icon: "💎", cls: "bg-navy-800/60 text-navy-600 border-navy-700" };
    }

    if (isRevealedSafe) {
      return { icon: "💎", cls: "bg-primary-500/20 text-primary-300 border-primary-500" };
    }
    return { icon: "", cls: "bg-navy-800 border-navy-700 hover:bg-navy-700" };
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white">Minesweeper</h1>
        <p className="text-sm text-navy-300">
          5x5 grid · pick your mine count · cash out before you hit one · Free to play
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 rounded-xl border border-primary-800/60 bg-primary-500/5 p-4 text-center sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-navy-300">Current Payout</p>
          <p className="text-xl font-bold text-primary-300">{currentMultiplier.toFixed(2)}x</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-navy-300">Next Tile Pays</p>
          <p className="text-xl font-bold text-primary-300">
            {phase === "playing" && revealed.size < safeTiles ? `${nextMultiplier.toFixed(2)}x` : "—"}
          </p>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <p className="text-xs uppercase tracking-wide text-navy-300">Mines / Safe Tiles</p>
          <p className="text-xl font-bold text-primary-300">
            {mineCount} / {safeTiles}
          </p>
        </div>
      </div>

      <div
        className="mx-auto mb-6 grid gap-2"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`, maxWidth: 420 }}
      >
        {Array.from({ length: TOTAL_TILES }, (_, index) => {
          const { icon, cls } = tileVisual(index);
          const disabled = phase !== "playing" || revealed.has(index);
          return (
            <button
              key={index}
              type="button"
              disabled={disabled}
              onClick={() => revealTile(index)}
              className={`flex aspect-square items-center justify-center rounded-lg border text-2xl transition-colors disabled:cursor-not-allowed ${cls}`}
            >
              {icon}
            </button>
          );
        })}
      </div>

      <div className="mb-6 rounded-xl border border-navy-800 bg-navy-900 px-4 py-3 text-center text-sm font-semibold text-white">
        {message}
      </div>

      {phase === "setup" && (
        <>
          <div className="mb-6 grid grid-cols-5 gap-2">
            {MINE_OPTIONS.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setMineCount(count)}
                className={`flex flex-col items-center rounded-xl border px-2 py-3 transition-colors ${
                  mineCount === count
                    ? "border-primary-500 bg-primary-500/10 text-primary-300"
                    : "border-navy-700 bg-navy-900 text-white hover:bg-navy-800"
                }`}
              >
                <span className="text-lg font-bold">{count}</span>
                <span className="text-[11px] text-navy-300">mine{count > 1 ? "s" : ""}</span>
                <span className="mt-1 text-xs font-semibold text-primary-300">
                  {payoutMultiplier(1, count).toFixed(2)}x
                </span>
              </button>
            ))}
          </div>
          <div className="mb-8 flex justify-center">
            <button
              type="button"
              onClick={startGame}
              className="rounded-full bg-primary-500 px-8 py-3 text-sm font-bold text-navy-950 hover:bg-primary-400"
            >
              Start Game
            </button>
          </div>
        </>
      )}

      {phase === "playing" && (
        <div className="mb-8 flex justify-center">
          <button
            type="button"
            disabled={revealed.size === 0}
            onClick={cashOut}
            className="rounded-full bg-primary-500 px-8 py-3 text-sm font-bold text-navy-950 hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Cash Out {revealed.size > 0 ? `(${currentMultiplier.toFixed(2)}x)` : ""}
          </button>
        </div>
      )}

      {phase === "ended" && (
        <div className="mb-8 flex justify-center">
          <button
            type="button"
            onClick={playAgain}
            className="rounded-full bg-primary-500 px-8 py-3 text-sm font-bold text-navy-950 hover:bg-primary-400"
          >
            Play Again
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Games", stats.games],
          ["Wins", stats.wins],
          ["Losses", stats.losses],
          ["Best Multiplier", `${stats.bestMultiplier.toFixed(2)}x`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-navy-800 bg-navy-900 py-3 text-center">
            <p className="text-lg font-bold text-white">{value}</p>
            <p className="text-xs text-navy-400">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
