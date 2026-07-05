"use client";

import { useEffect, useRef, useState } from "react";
import {
  PAYOUTS,
  handTotal,
  playRound,
  type BetChoice,
  type RoundResult,
} from "@/lib/baccarat/engine";
import PlayingCard from "./PlayingCard";

type Phase = "idle" | "dealing" | "result";
type Outcome = "win" | "lose" | "push" | null;
type Stats = { rounds: number; wins: number; losses: number; pushes: number; ties: number };

type RevealEntry = { side: "player" | "banker"; index: number };

const BET_OPTIONS: { choice: BetChoice; label: string }[] = [
  { choice: "player", label: "Player" },
  { choice: "tie", label: "Tie" },
  { choice: "banker", label: "Banker" },
];

function sequenceFor(r: RoundResult): RevealEntry[] {
  const seq: RevealEntry[] = [
    { side: "player", index: 0 },
    { side: "banker", index: 0 },
    { side: "player", index: 1 },
    { side: "banker", index: 1 },
  ];
  if (r.playerCards.length === 3) seq.push({ side: "player", index: 2 });
  if (r.bankerCards.length === 3) seq.push({ side: "banker", index: 2 });
  return seq;
}

export default function BaccaratGame() {
  const [betChoice, setBetChoice] = useState<BetChoice | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<RoundResult | null>(null);
  const [revealStep, setRevealStep] = useState(0);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const [stats, setStats] = useState<Stats>({ rounds: 0, wins: 0, losses: 0, pushes: 0, ties: 0 });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function finishRound(r: RoundResult, bet: BetChoice) {
    const win = r.winner === bet;
    const push = r.winner === "tie" && bet !== "tie";
    const outcomeValue: Outcome = win ? "win" : push ? "push" : "lose";
    setOutcome(outcomeValue);
    setPhase("result");
    setStats((s) => ({
      rounds: s.rounds + 1,
      wins: s.wins + (win ? 1 : 0),
      losses: s.losses + (!win && !push ? 1 : 0),
      pushes: s.pushes + (push ? 1 : 0),
      ties: s.ties + (r.winner === "tie" ? 1 : 0),
    }));
  }

  function deal() {
    if (phase === "dealing" || !betChoice) return;
    const r = playRound();
    const seq = sequenceFor(r);

    setResult(r);
    setRevealStep(0);
    setOutcome(null);
    setPhase("dealing");

    let step = 0;
    const tick = () => {
      step += 1;
      setRevealStep(step);
      if (step < seq.length) {
        timerRef.current = setTimeout(tick, 450);
      } else {
        timerRef.current = setTimeout(() => finishRound(r, betChoice), 500);
      }
    };
    timerRef.current = setTimeout(tick, 450);
  }

  const seq = result ? sequenceFor(result) : [];
  const visiblePlayerCount = seq.slice(0, revealStep).filter((s) => s.side === "player").length;
  const visibleBankerCount = seq.slice(0, revealStep).filter((s) => s.side === "banker").length;

  const visiblePlayerCards = result ? result.playerCards.slice(0, visiblePlayerCount) : [];
  const visibleBankerCards = result ? result.bankerCards.slice(0, visibleBankerCount) : [];

  let message = "Choose Player, Banker, or Tie, then deal.";
  if (phase === "dealing") {
    message = "Dealing…";
  } else if (phase === "result" && result && betChoice) {
    const winnerLabel =
      result.winner === "tie" ? "Tie" : result.winner === "player" ? "Player" : "Banker";
    const scoreline = `Player ${result.playerTotal} - Banker ${result.bankerTotal}`;
    if (outcome === "win") {
      message = `${winnerLabel} wins! ${scoreline} — you win ${PAYOUTS[betChoice]}x!`;
    } else if (outcome === "push") {
      message = `${winnerLabel}! ${scoreline} — push (Tie only pays Tie bets).`;
    } else {
      message = `${winnerLabel} wins. ${scoreline} — you lose.`;
    }
  }

  const canDeal = phase !== "dealing" && betChoice !== null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-white">Baccarat</h1>
        <p className="text-sm text-navy-300">
          Punto Banco rules · bet Player, Banker, or Tie · Free to play
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-navy-800 bg-navy-900 p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">Player</p>
            {phase === "result" && result?.winner === "player" && (
              <span className="rounded-full border border-primary-500 bg-primary-500/10 px-2 py-0.5 text-xs font-bold text-primary-300">
                Winner
              </span>
            )}
          </div>
          <div className="flex min-h-[104px] gap-2">
            {visiblePlayerCards.length === 0 && (
              <p className="self-center text-sm text-navy-500">Waiting for deal…</p>
            )}
            {visiblePlayerCards.map((card) => (
              <PlayingCard key={card.id} card={card} />
            ))}
          </div>
          <p className="mt-2 text-sm font-bold text-white">
            {visiblePlayerCards.length > 0 ? `Total: ${handTotal(visiblePlayerCards)}` : ""}
          </p>
        </div>

        <div className="rounded-xl border border-navy-800 bg-navy-900 p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">Banker</p>
            {phase === "result" && result?.winner === "banker" && (
              <span className="rounded-full border border-primary-500 bg-primary-500/10 px-2 py-0.5 text-xs font-bold text-primary-300">
                Winner
              </span>
            )}
          </div>
          <div className="flex min-h-[104px] gap-2">
            {visibleBankerCards.length === 0 && (
              <p className="self-center text-sm text-navy-500">Waiting for deal…</p>
            )}
            {visibleBankerCards.map((card) => (
              <PlayingCard key={card.id} card={card} />
            ))}
          </div>
          <p className="mt-2 text-sm font-bold text-white">
            {visibleBankerCards.length > 0 ? `Total: ${handTotal(visibleBankerCards)}` : ""}
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-xl border border-navy-800 bg-navy-900 px-4 py-3 text-center text-sm font-semibold text-white">
        {message}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {BET_OPTIONS.map((opt) => (
          <button
            key={opt.choice}
            type="button"
            disabled={phase === "dealing"}
            onClick={() => setBetChoice(opt.choice)}
            className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              betChoice === opt.choice
                ? "border-primary-500 bg-primary-500/10 text-primary-300"
                : "border-navy-700 bg-navy-900 text-white hover:bg-navy-800"
            }`}
          >
            <span>{opt.label}</span>
            <span className="text-navy-300">{PAYOUTS[opt.choice]}x</span>
          </button>
        ))}
      </div>

      <div className="mb-8 flex justify-center">
        <button
          type="button"
          disabled={!canDeal}
          onClick={deal}
          className="rounded-full bg-primary-500 px-8 py-3 text-sm font-bold text-navy-950 hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {phase === "dealing" ? "Dealing…" : "Deal"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          ["Rounds", stats.rounds],
          ["Wins", stats.wins],
          ["Losses", stats.losses],
          ["Pushes", stats.pushes],
          ["Ties", stats.ties],
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
