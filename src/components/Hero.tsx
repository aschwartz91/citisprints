"use client";

import type { Standing } from "@/lib/types";
import { formatDistance, formatDuration } from "@/lib/format";
import { CountUp } from "./CountUp";
import { GridCanvas } from "./GridCanvas";

export function Hero({
  leader,
  riderCount,
  rideCount,
  onAddRide,
}: {
  leader: Standing | null;
  riderCount: number;
  rideCount: number;
  onAddRide: () => void;
}) {
  return (
    <section id="top" className="relative overflow-hidden border-b border-hairline">
      <GridCanvas className="pointer-events-none absolute inset-0 h-full w-full" />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:gap-12 sm:px-8 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="rise">
          <p className="eyebrow mb-5 flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-flame" />
            New York City · Unofficial fan project
          </p>
          <h1 className="display text-[clamp(2.75rem,7vw,5rem)] text-ink">
            The fastest
            <br />
            riders in the
            <br />
            <span className="text-accent">five boroughs.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
            Upload a screenshot of your Citi Bike ride. We read the distance and
            time, verify it&rsquo;s real, and drop you onto the leaderboard. Earn
            your spot — no bombing down the block.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onAddRide}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-base font-semibold text-white shadow-[0_8px_24px_-8px_rgba(28,46,107,0.6)] transition-transform hover:-translate-y-0.5 active:translate-y-0 sm:w-auto sm:py-3.5"
            >
              Add your ride
              <span aria-hidden="true">→</span>
            </button>
            <a
              href="#board"
              className="inline-flex w-full items-center justify-center rounded-full border border-hairline-strong px-6 py-4 text-base font-semibold text-ink transition-colors hover:bg-surface sm:w-auto sm:py-3.5"
            >
              See the board
            </a>
          </div>
          <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
            <Stat label="Riders" value={riderCount.toString()} />
            <Stat label="Rides logged" value={rideCount.toString()} />
            <Stat
              label="Top speed"
              value={leader ? leader.topSpeedMph.toFixed(1) : "—"}
              unit="mph"
            />
          </dl>
        </div>

        {leader ? <LeaderCard leader={leader} /> : null}
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div>
      <dd className="tnum text-2xl font-bold text-ink">
        {value}
        {unit ? <span className="ml-1 text-sm text-faint">{unit}</span> : null}
      </dd>
      <dt className="eyebrow mt-1">{label}</dt>
    </div>
  );
}

function LeaderCard({ leader }: { leader: Standing }) {
  return (
    <div className="rise rounded-3xl border border-hairline bg-surface p-7 shadow-[0_24px_60px_-30px_rgba(11,23,38,0.4)] [animation-delay:120ms]">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-flame/10 px-3 py-1 text-xs font-bold tracking-wide text-flame">
          <Crown /> CURRENT LEADER
        </span>
        <span className="tnum text-sm text-faint">#01</span>
      </div>

      <div className="mt-6">
        <div className="flex items-baseline gap-2">
          <CountUp
            value={leader.topSpeedMph}
            className="tnum text-[clamp(3.5rem,12vw,5.5rem)] font-bold leading-none text-ink"
          />
          <span className="display text-2xl text-faint">mph</span>
        </div>
        <p className="mt-3 text-xl font-semibold text-ink">@{leader.handle}</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-hairline bg-hairline">
        <Cell
          label="Distance"
          value={formatDistance(leader.bestDistanceMi)}
          unit="mi"
        />
        <Cell label="Time" value={formatDuration(leader.bestDurationSec)} />
      </div>
    </div>
  );
}

function Cell({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="bg-surface px-4 py-3.5">
      <p className="eyebrow">{label}</p>
      <p className="tnum mt-1 text-lg font-bold text-ink">
        {value}
        {unit ? <span className="ml-1 text-sm text-faint">{unit}</span> : null}
      </p>
    </div>
  );
}

function Crown() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 7l4 4 5-7 5 7 4-4v11H3z" />
    </svg>
  );
}

