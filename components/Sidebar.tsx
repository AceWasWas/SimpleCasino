"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { games } from "@/lib/games";

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`sticky top-0 h-screen shrink-0 border-r border-navy-800 bg-navy-900 transition-all duration-200 ${
        collapsed ? "w-[76px]" : "w-64"
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-2 px-3 py-4">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2 overflow-hidden"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-500 text-lg font-black text-navy-950">
              W
            </span>
            {!collapsed && (
              <span className="truncate text-base font-extrabold tracking-tight text-primary-400">
                WasWas<span className="text-white">Casino</span>
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-navy-300 hover:bg-navy-800 hover:text-primary-400"
          >
            <span
              className={`inline-block transition-transform ${collapsed ? "rotate-180" : ""}`}
            >
              ‹‹
            </span>
          </button>
        </div>

        <nav className="mt-2 flex-1 space-y-1 px-3">
          {!collapsed && (
            <p className="px-2 pb-1 text-xs font-bold uppercase tracking-wider text-navy-400">
              Casino
            </p>
          )}
          {games.map((game) => {
            const href = `/${game.slug}`;
            const active = pathname === href;
            return (
              <Link
                key={game.slug}
                href={href}
                title={collapsed ? game.name : undefined}
                className={`flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-primary-500/15 text-primary-400"
                    : "text-navy-200 hover:bg-navy-800 hover:text-white"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <span className="text-lg leading-none">{game.icon}</span>
                {!collapsed && <span className="truncate">{game.name}</span>}
              </Link>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="mx-3 mb-4 rounded-lg border border-primary-800/60 bg-primary-500/10 px-3 py-3 text-xs text-primary-200">
            No wagers. No deposits. Just play for fun.
          </div>
        )}
      </div>
    </aside>
  );
}
