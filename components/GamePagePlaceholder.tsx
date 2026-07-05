import Link from "next/link";
import type { Game } from "@/lib/games";

export default function GamePagePlaceholder({ game }: { game: Game }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/" className="text-sm font-semibold text-primary-400 hover:text-primary-300">
        ← Back to Home
      </Link>

      <div className="mt-6 rounded-2xl border border-navy-800 bg-navy-900 p-10 text-center">
        <span className="text-6xl">{game.icon}</span>
        <h1 className="mt-4 text-3xl font-extrabold text-white">{game.name}</h1>
        <p className="mt-1 text-sm text-navy-300">{game.tagline}</p>
        <p className="mx-auto mt-4 max-w-md text-sm text-navy-300">
          {game.description}
        </p>
        <span className="mt-6 inline-flex items-center rounded-full border border-primary-800/60 bg-primary-500/10 px-4 py-2 text-sm font-semibold text-primary-300">
          Coming Soon — Free to Play, No Wagers
        </span>
      </div>
    </div>
  );
}
