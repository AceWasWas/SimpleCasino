import { handValue } from "@/lib/blackjack/engine";
import type { PlayerHand } from "@/lib/blackjack/types";
import PlayingCard from "./PlayingCard";

const RESULT_LABEL: Record<string, string> = {
  win: "Win",
  lose: "Lose",
  push: "Push",
  blackjack: "Blackjack!",
};

const RESULT_CLASS: Record<string, string> = {
  win: "border-primary-500 bg-primary-500/10 text-primary-300",
  blackjack: "border-primary-500 bg-primary-500/10 text-primary-300",
  lose: "border-red-500/60 bg-red-500/10 text-red-300",
  push: "border-navy-500 bg-navy-500/10 text-navy-200",
};

type HandDisplayProps = {
  hand: PlayerHand;
  active: boolean;
  label?: string;
};

export default function HandDisplay({ hand, active, label }: HandDisplayProps) {
  const { total, soft } = handValue(hand.cards);

  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-xl border p-4 transition-colors ${
        active ? "border-primary-500 bg-primary-500/5" : "border-navy-800 bg-navy-900"
      }`}
    >
      {label && <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">{label}</p>}
      <div className="flex gap-2">
        {hand.cards.map((card) => (
          <PlayingCard key={card.id} card={card} />
        ))}
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="font-bold text-white">
          {total}
          {soft && total <= 21 ? " (soft)" : ""}
        </span>
        {hand.doubled && (
          <span className="rounded-full border border-navy-600 px-2 py-0.5 text-xs text-navy-200">
            Doubled
          </span>
        )}
        {hand.status === "bust" && (
          <span className="rounded-full border border-red-500/60 bg-red-500/10 px-2 py-0.5 text-xs text-red-300">
            Bust
          </span>
        )}
        {hand.result && (
          <span
            className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${RESULT_CLASS[hand.result]}`}
          >
            {RESULT_LABEL[hand.result]}
          </span>
        )}
      </div>
    </div>
  );
}
