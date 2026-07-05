"use client";

import { useEffect, useReducer, useRef } from "react";
import { decksRemaining, handValue, trueCount } from "@/lib/blackjack/engine";
import { blackjackReducer, initialState } from "@/lib/blackjack/reducer";
import HandDisplay from "./HandDisplay";
import PlayingCard from "./PlayingCard";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function BlackjackTable() {
  const [state, dispatch] = useReducer(blackjackReducer, initialState);
  const dealerTurnRunning = useRef(false);

  useEffect(() => {
    if (state.phase !== "dealer-turn" || dealerTurnRunning.current) return;
    dealerTurnRunning.current = true;
    let cancelled = false;

    (async () => {
      await sleep(500);
      if (cancelled) return;
      dispatch({ type: "REVEAL_HOLE" });
      await sleep(500);
      if (cancelled) return;

      const allBust = state.playerHands.every((h) => h.status === "bust");
      if (!allBust) {
        // Local shadow copy mirrors the reducer's draw order so we know
        // when the dealer should stop, without relying on stale closure state.
        const shadowShoe = [...state.shoe];
        const shadowDealerCards = [...state.dealerCards];
        while (handValue(shadowDealerCards).total < 17 && shadowShoe.length > 0) {
          shadowDealerCards.push(shadowShoe.pop()!);
          dispatch({ type: "DEALER_DRAW" });
          await sleep(600);
          if (cancelled) return;
        }
      }

      dispatch({ type: "SETTLE" });
    })();

    return () => {
      cancelled = true;
      dealerTurnRunning.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  const activeHand = state.playerHands[state.activeHandIndex];
  const canAct = state.phase === "player-turn" && activeHand?.status === "active";
  const canDouble = canAct && activeHand.cards.length === 2;
  const canSplit =
    canAct &&
    activeHand.cards.length === 2 &&
    activeHand.cards[0].rank === activeHand.cards[1].rank &&
    state.playerHands.length < 4;

  const dealerTotal = handValue(state.dealerCards).total;
  const showDealerTotal = state.dealerHoleRevealed;

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Blackjack</h1>
          <p className="text-sm text-navy-300">
            4-deck shoe · Dealer stands on all 17s · No insurance · Free to play
          </p>
        </div>
        <button
          type="button"
          onClick={() => dispatch({ type: "TOGGLE_COUNT" })}
          className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
            state.showCount
              ? "border-primary-500 bg-primary-500/10 text-primary-300"
              : "border-navy-700 text-navy-300 hover:bg-navy-800"
          }`}
        >
          {state.showCount ? "Hide Card Count" : "Show Card Count"}
        </button>
      </div>

      {state.showCount && (
        <div className="mb-6 grid grid-cols-3 gap-3 rounded-xl border border-primary-800/60 bg-primary-500/5 p-4 text-center">
          <div>
            <p className="text-xs uppercase tracking-wide text-navy-300">Running Count</p>
            <p className="text-xl font-bold text-primary-300">{state.runningCount}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-navy-300">True Count</p>
            <p className="text-xl font-bold text-primary-300">
              {state.phase === "idle" ? "—" : trueCount(state.runningCount, state.shoe.length).toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-navy-300">Decks Left</p>
            <p className="text-xl font-bold text-primary-300">
              {state.phase === "idle" ? "4.0" : decksRemaining(state.shoe.length).toFixed(1)}
            </p>
          </div>
        </div>
      )}

      {/* Dealer */}
      <section className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy-400">
          Dealer {showDealerTotal ? `— ${dealerTotal}` : ""}
        </p>
        <div className="flex min-h-[104px] gap-2">
          {state.dealerCards.length === 0 && (
            <p className="self-center text-sm text-navy-500">Waiting for deal…</p>
          )}
          {state.dealerCards.map((card, i) => (
            <PlayingCard key={card.id} card={card} hidden={i === 1 && !state.dealerHoleRevealed} />
          ))}
        </div>
      </section>

      {/* Player hands */}
      <section className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy-400">
          Your Hand{state.playerHands.length > 1 ? "s" : ""}
        </p>
        {state.playerHands.length === 0 ? (
          <p className="text-sm text-navy-500">No cards yet — deal a hand to begin.</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {state.playerHands.map((hand, i) => (
              <HandDisplay
                key={hand.id}
                hand={hand}
                active={state.phase === "player-turn" && i === state.activeHandIndex}
                label={state.playerHands.length > 1 ? `Hand ${i + 1}` : undefined}
              />
            ))}
          </div>
        )}
      </section>

      {/* Message */}
      <div className="mb-6 rounded-xl border border-navy-800 bg-navy-900 px-4 py-3 text-center text-sm font-semibold text-white">
        {state.phase === "dealer-turn" ? "Dealer is playing…" : state.message}
      </div>

      {/* Controls */}
      <div className="mb-8 flex flex-wrap justify-center gap-3">
        {(state.phase === "idle" || state.phase === "round-over") && (
          <button
            type="button"
            onClick={() => dispatch({ type: "DEAL" })}
            className="rounded-full bg-primary-500 px-6 py-3 text-sm font-bold text-navy-950 hover:bg-primary-400"
          >
            {state.phase === "idle" ? "Deal Hand" : "Deal Next Hand"}
          </button>
        )}

        {state.phase === "player-turn" && (
          <>
            <button
              type="button"
              disabled={!canAct}
              onClick={() => dispatch({ type: "HIT" })}
              className="rounded-full bg-primary-500 px-5 py-2.5 text-sm font-bold text-navy-950 hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Hit
            </button>
            <button
              type="button"
              disabled={!canAct}
              onClick={() => dispatch({ type: "STAND" })}
              className="rounded-full border border-navy-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Stand
            </button>
            <button
              type="button"
              disabled={!canDouble}
              onClick={() => dispatch({ type: "DOUBLE" })}
              className="rounded-full border border-navy-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Double
            </button>
            <button
              type="button"
              disabled={!canSplit}
              onClick={() => dispatch({ type: "SPLIT" })}
              className="rounded-full border border-navy-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Split
            </button>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          ["Hands", state.stats.hands],
          ["Wins", state.stats.wins],
          ["Losses", state.stats.losses],
          ["Pushes", state.stats.pushes],
          ["Blackjacks", state.stats.blackjacks],
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
