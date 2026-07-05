import type { RefObject, TransitionEvent } from "react";
import { colorOf } from "@/lib/roulette/engine";

const COLOR_CLASS: Record<string, string> = {
  red: "bg-red-600 text-white",
  black: "bg-zinc-900 text-white",
  green: "bg-emerald-500 text-navy-950",
};

export type StripCell = { id: string; number: number };

type RouletteStripProps = {
  cells: StripCell[];
  translateX: number;
  animate: boolean;
  cellWidth: number;
  highlightId: string | null;
  containerRef: RefObject<HTMLDivElement | null>;
  onTransitionEnd?: (e: TransitionEvent<HTMLDivElement>) => void;
};

export default function RouletteStrip({
  cells,
  translateX,
  animate,
  cellWidth,
  highlightId,
  containerRef,
  onTransitionEnd,
}: RouletteStripProps) {
  return (
    <div
      ref={containerRef}
      className="relative h-24 w-full overflow-hidden rounded-xl border border-navy-800 bg-navy-950"
    >
      <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-0.5 -translate-x-1/2 bg-primary-400" />
      <div className="pointer-events-none absolute left-1/2 top-0 z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-primary-400" />
      <div
        onTransitionEnd={onTransitionEnd}
        className="flex h-full"
        style={{
          transform: `translateX(${translateX}px)`,
          transition: animate ? "transform 3.4s cubic-bezier(0.16, 1, 0.3, 1)" : "none",
        }}
      >
        {cells.map((cell) => {
          const color = colorOf(cell.number);
          const isHighlighted = highlightId === cell.id;
          return (
            <div
              key={cell.id}
              style={{ width: cellWidth }}
              className={`flex h-full shrink-0 items-center justify-center border-r border-navy-800/60 text-xl font-bold ${COLOR_CLASS[color]} ${
                isHighlighted ? "ring-4 ring-primary-400 ring-inset" : ""
              }`}
            >
              {cell.number}
            </div>
          );
        })}
      </div>
    </div>
  );
}
