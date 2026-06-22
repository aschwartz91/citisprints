"use client";

import { useMemo, useState } from "react";
import type { Board, Ride, Standing } from "@/lib/types";
import {
  formatDistance,
  formatDuration,
  formatRank,
  formatSpeed,
} from "@/lib/format";
import { rankings } from "@/lib/store";

export function Leaderboard({
  rides,
  justAddedHandle,
}: {
  rides: Ride[];
  justAddedHandle: string | null;
}) {
  const [board, setBoard] = useState<Board>("fastest");
  const standings = useMemo(() => rankings(rides, board), [rides, board]);

  return (
    <section id="board" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 sm:px-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-2">The board</p>
          <h2 className="display text-3xl text-ink sm:text-4xl">
            {board === "fastest" ? "Fastest riders" : "Most miles ridden"}
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted">
            {board === "fastest"
              ? "Ranked by best single-ride average speed. Only rides of 0.3 miles or more qualify."
              : "Ranked by total qualifying distance across every ride logged."}
          </p>
        </div>
        <Tabs board={board} onChange={setBoard} />
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-hairline bg-surface">
        <HeaderRow board={board} count={standings.length} />
        <ol className="board-scroll">
          {standings.map((s, i) => (
            <Row
              key={s.handle}
              rank={i + 1}
              standing={s}
              board={board}
              highlighted={s.handle === justAddedHandle}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}

function Tabs({
  board,
  onChange,
}: {
  board: Board;
  onChange: (b: Board) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Leaderboard view"
      className="inline-flex rounded-full border border-hairline bg-panel p-1"
    >
      {(["fastest", "longest"] as const).map((b) => (
        <button
          key={b}
          role="tab"
          aria-selected={board === b}
          onClick={() => onChange(b)}
          className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
            board === b
              ? "bg-surface text-ink shadow-sm"
              : "text-muted hover:text-ink"
          }`}
        >
          {b === "fastest" ? "Fastest" : "Longest"}
        </button>
      ))}
    </div>
  );
}

function HeaderRow({ board, count }: { board: Board; count: number }) {
  return (
    <div className="flex items-center gap-3 border-b border-hairline px-4 py-3 sm:px-6">
      <span className="eyebrow w-8 shrink-0">#</span>
      <span className="eyebrow flex-1">Rider</span>
      <span className="eyebrow hidden w-20 text-right sm:block">
        {board === "fastest" ? "Dist" : "Rides"}
      </span>
      <span className="eyebrow hidden w-20 text-right sm:block">
        {board === "fastest" ? "Time" : "Best"}
      </span>
      <span className="eyebrow w-24 text-right sm:w-28">
        {board === "fastest" ? "mph" : "miles"}
      </span>
      <span className="ml-auto hidden text-right text-xs text-faint sm:block">
        {count} listed
      </span>
    </div>
  );
}

function Row({
  rank,
  standing,
  board,
  highlighted,
}: {
  rank: number;
  standing: Standing;
  board: Board;
  highlighted: boolean;
}) {
  const rankColor =
    rank === 1 ? "text-flame" : rank <= 3 ? "text-accent" : "text-faint";

  const primary =
    board === "fastest"
      ? formatSpeed(standing.topSpeedMph)
      : formatDistance(standing.totalDistanceMi);

  const secondaryA =
    board === "fastest"
      ? `${formatDistance(standing.bestDistanceMi)}`
      : standing.rides.toString();

  const secondaryB =
    board === "fastest"
      ? formatDuration(standing.bestDurationSec)
      : formatSpeed(standing.topSpeedMph);

  return (
    <li
      className={`flex items-center gap-3 border-b border-hairline px-4 py-3.5 transition-colors last:border-0 sm:px-6 ${
        highlighted ? "bg-accent-soft/60" : "hover:bg-panel/50"
      }`}
    >
      <span className={`tnum w-8 shrink-0 text-sm font-bold ${rankColor}`}>
        {formatRank(rank)}
      </span>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-2 truncate font-semibold text-ink">
            @{standing.handle}
            {standing.source === "user" ? (
              <span className="rounded bg-accent/10 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-accent">
                YOU
              </span>
            ) : null}
          </p>
          <p className="truncate text-xs text-muted">{standing.route}</p>
        </div>
      </div>

      <span className="tnum hidden w-20 text-right text-sm text-muted sm:block">
        {secondaryA}
      </span>
      <span className="tnum hidden w-20 text-right text-sm text-muted sm:block">
        {secondaryB}
      </span>
      <span className="tnum w-24 text-right text-lg font-bold text-ink sm:w-28 sm:text-xl">
        {primary}
      </span>
    </li>
  );
}
