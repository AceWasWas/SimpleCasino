"use client";

import { useState } from "react";
import {
  BOMB_OPTIONS,
  FLOORS,
  TILES_PER_FLOOR,
  generateTower,
  payoutMultiplier,
  safeTilesPerFloor,
} from "@/lib/dragontower/engine";

type Phase = "setup" | "playing" | "ended";
type Outcome = "win" | "lose" | null;
type Stats = { games: number; wins: number; losses: number; bestMultiplier: number };

export default function DragonTowerGame() {
  const [bombCount, setBombCount] = useState<number>(1);
  const [phase, setPhase] = useState<Phase>("setup");
  const [towerBombs, setTowerBombs] = useState<Set<number>[]>([]);
  const [picks, setPicks] = useState<(number | null)[]>(Array(FLOORS).fill(null));
  const [currentFloor, setCurrentFloor] = useState(0);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [finalMultiplier, setFinalMultiplier] = useState(1);
  const [stats, setStats] = useState<Stats>({ games: 0, wins: 0, losses: 0, bestMultiplier: 0 });

  const currentMultiplier = payoutMultiplier(currentFloor, bombCount);
  const nextMultiplier = payoutMultiplier(currentFloor + 1, bombCount);

  function startGame() {
    setTowerBombs(generateTower(bombCount));
    setPicks(Array(FLOORS).fill(null));
    setCurrentFloor(0);
    setOutcome(null);
    setFinalMultiplier(1);
    setPhase("playing");
  }

  function pickTile(floorIndex: number, tileIndex: number) {
    if (phase !== "playing" || floorIndex !== currentFloor) return;

    const nextPicks = [...picks];
    nextPicks[floorIndex] = tileIndex;
    setPicks(nextPicks);

    if (towerBombs[floorIndex].has(tileIndex)) {
      setOutcome("lose");
      setPhase("ended");
      setStats((s) => ({ ...s, games: s.games + 1, losses: s.losses + 1 }));
      return;
    }

    const cleared = currentFloor + 1;
    if (cleared === FLOORS) {
      const mult = payoutMultiplier(cleared, bombCount);
      setFinalMultiplier(mult);
      setOutcome("win");
      setPhase("ended");
      setCurrentFloor(cleared);
      setStats((s) => ({
        games: s.games + 1,
        wins: s.wins + 1,
        losses: s.losses,
        bestMultiplier: Math.max(s.bestMultiplier, mult),
      }));
      return;
    }

    setCurrentFloor(cleared);
  }

  function cashOut() {
    if (phase !== "playing" || currentFloor === 0) return;
    const mult = payoutMultiplier(currentFloor, bombCount);
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
  }

  let message = "Choose your bomb count and start climbing.";
  if (phase === "playing") {
    message =
      currentFloor === 0
        ? "Pick a tile on floor 1 to begin — cash out anytime after your first cleared floor."
        : `Cash out now for ${currentMultiplier.toFixed(2)}x, or climb higher.`;
  } else if (phase === "ended") {
    message =
      outcome === "win"
        ? currentFloor === FLOORS
          ? `Tower cleared! Auto cashed out at ${finalMultiplier.toFixed(2)}x!`
          : `Cashed out at ${finalMultiplier.toFixed(2)}x!`
        : "Boom! You hit a bomb and lost it all.";
  }

  function tileVisual(floorIndex: number, tileIndex: number): { icon: string; cls: string } {
    const cleared = floorIndex < currentFloor;
    const pickedTile = picks[floorIndex];
    const isFatalTile =
      phase === "ended" &&
      outcome === "lose" &&
      floorIndex === currentFloor &&
      tileIndex === pickedTile;

    if (phase === "ended") {
      // Round is over — reveal every floor's bombs and gems, not just the ones reached.
      if (cleared && tileIndex === pickedTile) {
        return { icon: "💎", cls: "bg-primary-500/20 text-primary-300 border-primary-500" };
      }
      if (isFatalTile) {
        return { icon: "💣", cls: "bg-red-600 text-white border-red-500" };
      }
      const isBomb = towerBombs[floorIndex]?.has(tileIndex) ?? false;
      return isBomb
        ? { icon: "💣", cls: "bg-red-900/40 text-red-300 border-red-800/60" }
        : { icon: "💎", cls: "bg-primary-500/10 text-primary-400/70 border-primary-800/40" };
    }

    if (cleared) {
      if (tileIndex === pickedTile) {
        return { icon: "💎", cls: "bg-primary-500/20 text-primary-300 border-primary-500" };
      }
      return { icon: "", cls: "bg-navy-800/60 border-navy-700" };
    }

    if (phase === "playing" && floorIndex === currentFloor) {
      return { icon: "", cls: "bg-navy-800 border-navy-700 hover:bg-navy-700" };
    }

    return { icon: "", cls: "bg-navy-900/40 border-navy-800/40" };
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white">Dragon Tower</h1>
        <p className="text-sm text-navy-300">
          6 floors · 4 tiles each · pick your bomb count · cash out before you hit one · Free to play
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 rounded-xl border border-primary-800/60 bg-primary-500/5 p-4 text-center sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-navy-300">Current Payout</p>
          <p className="text-xl font-bold text-primary-300">{currentMultiplier.toFixed(2)}x</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-navy-300">Next Floor Pays</p>
          <p className="text-xl font-bold text-primary-300">
            {phase === "playing" && currentFloor < FLOORS ? `${nextMultiplier.toFixed(2)}x` : "—"}
          </p>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <p className="text-xs uppercase tracking-wide text-navy-300">Floor</p>
          <p className="text-xl font-bold text-primary-300">
            {Math.min(currentFloor + (phase === "playing" ? 1 : 0), FLOORS)} / {FLOORS}
          </p>
        </div>
      </div>

      <div className="mx-auto mb-6 flex flex-col gap-2" style={{ maxWidth: 404 }}>
        {Array.from({ length: FLOORS }, (_, i) => FLOORS - 1 - i).map((floorIndex) => (
          <div key={floorIndex} className="flex items-center gap-3">
            <span className="w-14 shrink-0 text-right text-xs font-semibold text-navy-400">
              Floor {floorIndex + 1}
            </span>
            <div className="grid grid-cols-4 gap-2" style={{ width: 336 }}>
              {Array.from({ length: TILES_PER_FLOOR }, (_, tileIndex) => {
                const { icon, cls } = tileVisual(floorIndex, tileIndex);
                const disabled =
                  phase !== "playing" ||
                  floorIndex !== currentFloor ||
                  picks[floorIndex] !== null;
                return (
                  <button
                    key={tileIndex}
                    type="button"
                    disabled={disabled}
                    onClick={() => pickTile(floorIndex, tileIndex)}
                    className={`flex aspect-square items-center justify-center rounded-lg border text-xl transition-colors disabled:cursor-not-allowed ${cls}`}
                  >
                    {icon}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 rounded-xl border border-navy-800 bg-navy-900 px-4 py-3 text-center text-sm font-semibold text-white">
        {message}
      </div>

      {phase === "setup" && (
        <>
          <div className="mb-6 grid grid-cols-3 gap-3">
            {BOMB_OPTIONS.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setBombCount(count)}
                className={`flex flex-col items-center rounded-xl border px-2 py-3 transition-colors ${
                  bombCount === count
                    ? "border-primary-500 bg-primary-500/10 text-primary-300"
                    : "border-navy-700 bg-navy-900 text-white hover:bg-navy-800"
                }`}
              >
                <span className="text-lg font-bold">{count}</span>
                <span className="text-[11px] text-navy-300">
                  bomb{count > 1 ? "s" : ""} / floor
                </span>
                <span className="mt-1 text-[11px] text-navy-400">
                  {safeTilesPerFloor(count)}/4 safe
                </span>
                <span className="mt-1 text-xs font-semibold text-primary-300">
                  {payoutMultiplier(FLOORS, count).toFixed(2)}x full climb
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
            disabled={currentFloor === 0}
            onClick={cashOut}
            className="rounded-full bg-primary-500 px-8 py-3 text-sm font-bold text-navy-950 hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Cash Out {currentFloor > 0 ? `(${currentMultiplier.toFixed(2)}x)` : ""}
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
