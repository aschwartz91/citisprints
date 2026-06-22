import type { Board, Ride, Standing } from "./types";
import { MIN_DISTANCE_MI, speedMph } from "./format";
import { SEED_RIDES } from "./mockData";

const STORAGE_KEY = "citi-sprints/rides/v1";

/** User-submitted rides only — seeds are constant and never stored. */
function loadUserRides(): Ride[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Ride[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUserRides(rides: Ride[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rides));
}

export function getAllRides(): Ride[] {
  return [...SEED_RIDES, ...loadUserRides()];
}

export function addRide(input: {
  handle: string;
  distanceMi: number;
  durationSec: number;
  route: string;
}): Ride {
  const ride: Ride = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    handle: input.handle,
    distanceMi: input.distanceMi,
    durationSec: input.durationSec,
    route: input.route.trim() || "Somewhere in the city",
    createdAt: Date.now(),
    source: "user",
  };
  const next = [...loadUserRides(), ride];
  saveUserRides(next);
  return ride;
}

/** Aggregate rides into per-rider standings for a given board.
 *  Only rides at or above the qualifying distance are counted. */
export function rankings(rides: Ride[], board: Board): Standing[] {
  const byHandle = new Map<string, Ride[]>();
  for (const ride of rides) {
    if (ride.distanceMi < MIN_DISTANCE_MI) continue;
    const list = byHandle.get(ride.handle) ?? [];
    list.push(ride);
    byHandle.set(ride.handle, list);
  }

  const standings: Standing[] = [];
  for (const [handle, list] of byHandle) {
    let best = list[0];
    let bestSpeed = speedMph(best.distanceMi, best.durationSec);
    let total = 0;
    for (const ride of list) {
      total += ride.distanceMi;
      const s = speedMph(ride.distanceMi, ride.durationSec);
      if (s > bestSpeed) {
        bestSpeed = s;
        best = ride;
      }
    }
    standings.push({
      handle,
      route: best.route,
      topSpeedMph: bestSpeed,
      totalDistanceMi: total,
      bestDistanceMi: best.distanceMi,
      bestDurationSec: best.durationSec,
      rides: list.length,
      source: list.some((r) => r.source === "user") ? "user" : "seed",
    });
  }

  standings.sort((a, b) =>
    board === "fastest"
      ? b.topSpeedMph - a.topSpeedMph
      : b.totalDistanceMi - a.totalDistanceMi,
  );
  return standings;
}
