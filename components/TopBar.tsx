export default function TopBar() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-navy-800 bg-navy-950/80 px-6 py-4 backdrop-blur">
      <div className="hidden items-center gap-2 rounded-full border border-navy-700 bg-navy-900 px-4 py-2 text-sm text-navy-300 sm:flex sm:w-72">
        <span aria-hidden>🔍</span>
        <span className="truncate">Search games…</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden rounded-full border border-primary-800/60 bg-primary-500/10 px-3 py-1.5 text-xs font-semibold text-primary-300 sm:inline">
          Play Money Mode
        </span>
        <button
          type="button"
          className="rounded-full border border-navy-700 px-4 py-2 text-sm font-semibold text-navy-100 hover:bg-navy-800"
        >
          Login
        </button>
        <button
          type="button"
          className="rounded-full bg-primary-500 px-4 py-2 text-sm font-bold text-navy-950 hover:bg-primary-400"
        >
          Register
        </button>
      </div>
    </header>
  );
}
