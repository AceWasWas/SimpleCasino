import Link from "next/link";
import type { Game } from "@/lib/games";

export default function GameCard({ game }: { game: Game }) {
  return (
    <Link
      href={`/${game.slug}`}
      className={`group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-2xl border border-navy-800 bg-gradient-to-br ${game.gradient} p-4 transition-transform hover:-translate-y-1 hover:border-primary-500`}
    >
      <span className="absolute right-3 top-3 text-4xl opacity-90 transition-transform group-hover:scale-110">
        {game.icon}
      </span>
      <div className="relative z-10">
        <h3 className="text-base font-bold text-white">{game.name}</h3>
        <p className="mt-1 text-xs text-navy-200">{game.tagline}</p>
      </div>
      <span className="absolute inset-0 flex items-center justify-center bg-navy-950/70 text-sm font-bold text-primary-400 opacity-0 transition-opacity group-hover:opacity-100">
        Play Now
      </span>
    </Link>
  );
}
