import type { Card } from "@/lib/baccarat/types";

type PlayingCardProps = {
  card?: Card;
  hidden?: boolean;
};

export default function PlayingCard({ card, hidden }: PlayingCardProps) {
  if (hidden || !card) {
    return (
      <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded-lg border border-navy-700 bg-gradient-to-br from-navy-700 to-navy-950 text-lg font-black text-primary-400 shadow-md">
        W
      </div>
    );
  }

  const isRed = card.suit === "♥" || card.suit === "♦";

  return (
    <div
      className={`flex h-24 w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-lg border border-navy-300 bg-white shadow-md ${
        isRed ? "text-red-600" : "text-navy-950"
      }`}
    >
      <span className="text-lg font-bold leading-none">{card.rank}</span>
      <span className="text-2xl leading-none">{card.suit}</span>
    </div>
  );
}
