import Link from "next/link";
import GameCard from "@/components/GameCard";
import { games } from "@/lib/games";

const tableGames = games.filter((g) => g.category === "Table Games");
const instantGames = games.filter((g) => g.category === "Instant Games");

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      {/* Hero */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="relative col-span-1 overflow-hidden rounded-2xl border border-navy-800 bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 p-8 lg:col-span-2">
          <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-primary-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 h-56 w-56 rounded-full bg-primary-400/10 blur-3xl" />
          <div className="relative z-10 flex h-full flex-col justify-center gap-4">
            <span className="inline-flex w-fit items-center rounded-full border border-primary-800/60 bg-primary-500/10 px-3 py-1 text-xs font-semibold text-primary-300">
              100% Free-to-Play
            </span>
            <h1 className="max-w-md text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              Welcome to <span className="text-primary-400">WasWasCasino</span>
            </h1>
            <p className="max-w-sm text-sm text-navy-200">
              Blackjack, Baccarat, Roulette, Minesweeper, and Dragon Tower — no
              wagers, no deposits, no risk. Just play.
            </p>
            <div className="flex flex-wrap gap-2 text-3xl">
              <span>🃏</span>
              <span>🎴</span>
              <span>🎡</span>
              <span>💣</span>
              <span>🐉</span>
            </div>
          </div>
        </div>

        <div className="col-span-1 flex flex-col justify-center gap-4 rounded-2xl border border-navy-800 bg-navy-900 p-8 text-center">
          <h2 className="text-xl font-bold text-white">
            Welcome To WasWasCasino
          </h2>
          <p className="text-sm text-navy-300">Hop In &amp; Play For Fun</p>
          <Link
            href="#games"
            className="rounded-full bg-primary-500 px-5 py-3 text-sm font-bold text-navy-950 transition-colors hover:bg-primary-400"
          >
            Enter Casino
          </Link>
          <p className="text-xs text-navy-400">No sign-up required</p>
        </div>
      </section>

      {/* Promo strip */}
      <section className="mt-4 flex flex-col items-start justify-between gap-4 rounded-2xl border border-navy-800 bg-navy-900 px-6 py-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-lg font-bold text-white">
            5 Games. <span className="text-primary-400">Zero Cost.</span>
          </p>
          <p className="text-sm text-navy-300">
            Every game is free-to-play with no wager amount, ever.
          </p>
        </div>
        <Link
          href="#games"
          className="rounded-full bg-primary-500 px-4 py-2 text-sm font-bold text-navy-950 hover:bg-primary-400"
        >
          Browse Games
        </Link>
      </section>

      {/* Category tiles */}
      <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="#table-games"
          className="relative overflow-hidden rounded-2xl border border-navy-800 bg-gradient-to-br from-navy-700 via-navy-800 to-navy-950 p-8 transition-transform hover:-translate-y-1"
        >
          <p className="text-2xl font-extrabold text-white">Table Games</p>
          <p className="text-sm text-navy-300">Blackjack, Baccarat &amp; Roulette</p>
        </Link>
        <Link
          href="#instant-games"
          className="relative overflow-hidden rounded-2xl border border-primary-800/60 bg-gradient-to-br from-primary-900 via-navy-900 to-navy-950 p-8 transition-transform hover:-translate-y-1"
        >
          <p className="text-2xl font-extrabold text-white">Instant Games</p>
          <p className="text-sm text-primary-200">Minesweeper &amp; Dragon Tower</p>
        </Link>
      </section>

      {/* Game grid */}
      <section id="games" className="mt-8 scroll-mt-6">
        <h2
          id="table-games"
          className="mb-3 scroll-mt-6 text-lg font-bold text-white"
        >
          Table Games
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {tableGames.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>

        <h2
          id="instant-games"
          className="mb-3 mt-8 scroll-mt-6 text-lg font-bold text-white"
        >
          Instant Games
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {instantGames.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      </section>
    </div>
  );
}
