import type { Board, Ride, Standing } from "./types";
import { MIN_DISTANCE_MI, speedMph } from "./format";
import { SEED_RIDES } from "./mockData";
import { supabase, type RideRow } from "./supabase";

function rowToRide(row: RideRow): Ride {
  return {
    id: row.id,
    handle: row.handle,
    distanceMi: row.distance_mi,
    durationSec: row.duration_sec,
    createdAt: new Date(row.created_at).getTime(),
    source: "user",
  };
}

/** User-submitted rides from Supabase. Seeds are constant and never stored. */
async function loadUserRides(): Promise<Ride[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("rides")
    .select("id, handle, distance_mi, duration_sec, created_at")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Failed to load rides from Supabase:", error.message);
    return [];
  }
  return (data ?? []).map(rowToRide);
}

export async function getAllRides(): Promise<Ride[]> {
  const userRides = await loadUserRides();
  return [...SEED_RIDES, ...userRides];
}

export async function addRide(input: {
  handle: string;
  distanceMi: number;
  durationSec: number;
}): Promise<Ride> {
  if (!supabase) {
    throw new Error("Supabase is not configured — cannot save the ride.");
  }
  const { data, error } = await supabase
    .from("rides")
    .insert({
      handle: input.handle,
      distance_mi: input.distanceMi,
      duration_sec: input.durationSec,
    })
    .select("id, handle, distance_mi, duration_sec, created_at")
    .single();
  if (error || !data) {
    throw new Error(error?.message ?? "Failed to save the ride.");
  }
  return rowToRide(data);
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
