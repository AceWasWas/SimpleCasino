"use client";

import { useRef, useState, type TransitionEvent } from "react";
import { colorOf, NUMBERS, PAYOUTS, spinResult, type BetColor } from "@/lib/roulette/engine";
import RouletteStrip, { type StripCell } from "./RouletteStrip";

const CELL_WIDTH = 88;
const TRAVEL_REPS = 8; // full loops of the 15-number sequence to travel before landing
const BUFFER_AFTER = 12; // extra cells rendered past the landing point
const SEQUENCE_LEN = NUMBERS.length;
const ARRAY_LEN = TRAVEL_REPS * SEQUENCE_LEN + SEQUENCE_LEN + BUFFER_AFTER;

type Phase = "idle" | "spinning" | "result";
type Outcome = "win" | "lose" | null;

type Stats = { spins: number; wins: number; losses: number; greenHits: number };

const BET_OPTIONS: { color: BetColor; label: string }[] = [
  { color: "red", label: "Red" },
  { color: "black", label: "Black" },
  { color: "green", label: "Green (0)" },
];

const SWATCH_CLASS: Record<BetColor, string> = {
  red: "bg-red-600",
  black: "bg-zinc-900",
  green: "bg-emerald-500",
};

function buildCells(spinId: number, length: number): StripCell[] {
  return Array.from({ length }, (_, i) => ({
    id: `${spinId}-${i}`,
    number: NUMBERS[i % SEQUENCE_LEN],
  }));
}

export default function RouletteGame() {
  const [betColor, setBetColor] = useState<BetColor | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [cells, setCells] = useState<StripCell[]>(() => buildCells(0, ARRAY_LEN));
  const [translateX, setTranslateX] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [stats, setStats] = useState<Stats>({ spins: 0, wins: 0, losses: 0, greenHits: 0 });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const spinIdRef = useRef(0);
  const pendingRef = useRef<{ winning: number; cellId: string } | null>(null);

  function handleSpin() {
    if (phase === "spinning" || !betColor) return;

    const winning = spinResult();
    const targetIndex = TRAVEL_REPS * SEQUENCE_LEN + winning;
    spinIdRef.current += 1;
    const newCells = buildCells(spinIdRef.current, ARRAY_LEN);
    const containerWidth = containerRef.current?.offsetWidth ?? 600;
    const targetOffset = targetIndex * CELL_WIDTH + CELL_WIDTH / 2 - containerWidth / 2;

    pendingRef.current = { winning, cellId: newCells[targetIndex].id };

    setAnimate(false);
    setHighlightId(null);
    setWinningNumber(null);
    setOutcome(null);
    setCells(newCells);
    setTranslateX(0);
    setPhase("spinning");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimate(true);
        setTranslateX(-targetOffset);
      });
    });
  }

  function handleTransitionEnd(e: TransitionEvent<HTMLDivElement>) {
    if (e.propertyName !== "transform" || phase !== "spinning") return;
    const pending = pendingRef.current;
    if (!pending) return;

    const color = colorOf(pending.winning);
    const win = color === betColor;

    setAnimate(false);
    setHighlightId(pending.cellId);
    setWinningNumber(pending.winning);
    setOutcome(win ? "win" : "lose");
    setStats((s) => ({
      spins: s.spins + 1,
      wins: s.wins + (win ? 1 : 0),
      losses: s.losses + (win ? 0 : 1),
      greenHits: s.greenHits + (pending.winning === 0 ? 1 : 0),
    }));
    setPhase("result");
  }

  const winningColor = winningNumber !== null ? colorOf(winningNumber) : null;
  const canSpin = phase !== "spinning" && betColor !== null;

  let message = "Pick a color to place your bet.";
  if (phase === "spinning") {
    message = "Spinning…";
  } else if (phase === "result" && winningNumber !== null && winningColor && betColor) {
    if (outcome === "win") {
      message = `Ball landed on ${winningNumber} (${winningColor}) — you win ${PAYOUTS[betColor]}x!`;
    } else {
      message = `Ball landed on ${winningNumber} (${winningColor}) — you lose.`;
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white">Roulette</h1>
        <p className="text-sm text-navy-300">
          15-pocket wheel · 0 is green · 1-14 alternate red/black · Free to play
        </p>
      </div>

      <div className="mb-6">
        <RouletteStrip
          cells={cells}
          translateX={translateX}
          animate={animate}
          cellWidth={CELL_WIDTH}
          highlightId={highlightId}
          containerRef={containerRef}
          onTransitionEnd={handleTransitionEnd}
        />
      </div>

      <div className="mb-6 rounded-xl border border-navy-800 bg-navy-900 px-4 py-3 text-center text-sm font-semibold text-white">
        {message}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {BET_OPTIONS.map((opt) => (
          <button
            key={opt.color}
            type="button"
            disabled={phase === "spinning"}
            onClick={() => setBetColor(opt.color)}
            className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              betColor === opt.color
                ? "border-primary-500 bg-primary-500/10 text-primary-300"
                : "border-navy-700 bg-navy-900 text-white hover:bg-navy-800"
            }`}
          >
            <span className="flex items-center gap-2">
              <span className={`h-4 w-4 rounded-full ${SWATCH_CLASS[opt.color]}`} />
              {opt.label}
            </span>
            <span className="text-navy-300">{PAYOUTS[opt.color]}x</span>
          </button>
        ))}
      </div>

      <div className="mb-8 flex justify-center">
        <button
          type="button"
          disabled={!canSpin}
          onClick={handleSpin}
          className="rounded-full bg-primary-500 px-8 py-3 text-sm font-bold text-navy-950 hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {phase === "spinning" ? "Spinning…" : "Spin"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Spins", stats.spins],
          ["Wins", stats.wins],
          ["Losses", stats.losses],
          ["Green Hits", stats.greenHits],
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
