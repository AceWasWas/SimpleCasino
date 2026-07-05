export default function TopBar() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-navy-800 bg-navy-950/80 px-6 py-4 backdrop-blur">
      <div className="hidden items-center gap-2 rounded-full border border-navy-700 bg-navy-900 px-4 py-2 text-sm text-navy-300 sm:flex sm:w-72">
        <span aria-hidden>🔍</span>
        <span className="truncate">Search games…</span>
      </div>
    </header>
  );
}
