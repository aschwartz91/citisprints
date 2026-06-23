import type { Ride } from "./types";

/** Seed riders so the board feels alive before anyone uploads.
 *  Speeds reflect what's actually achievable on a Citi Bike: classic
 *  pedal bikes average ~9–13 mph in city traffic, while e-bikes (motor
 *  assist to ~18 mph) let the quickest riders sit in the mid-to-high
 *  teens. A few riders log more than one ride to give the "Longest"
 *  board real cumulative totals. */
type Seed = { handle: string; distanceMi: number; mph: number };

const seeds: Seed[] = [
  { handle: "hudson_hammer", distanceMi: 4.3, mph: 18.6 },
  { handle: "greenway_glider", distanceMi: 6.8, mph: 17.9 },
  { handle: "ebike_emiko", distanceMi: 3.1, mph: 17.3 },
  { handle: "williamsburg_whip", distanceMi: 4.0, mph: 16.4 },
  { handle: "fidi_flyer", distanceMi: 2.2, mph: 15.6 },
  { handle: "central_park_cruiser", distanceMi: 7.5, mph: 14.8 },
  { handle: "astoria_arrow", distanceMi: 3.4, mph: 14.0 },
  { handle: "prospect_pedaler", distanceMi: 4.6, mph: 13.1 },
  { handle: "soho_spinner", distanceMi: 1.8, mph: 12.3 },
  { handle: "lic_local", distanceMi: 2.9, mph: 11.5 },
  { handle: "harlem_roller", distanceMi: 3.7, mph: 10.6 },
  { handle: "chinatown_coaster", distanceMi: 1.5, mph: 9.8 },
  { handle: "battery_breeze", distanceMi: 2.3, mph: 9.1 },
  // Repeat riders — these stack distance on the Longest board.
  { handle: "greenway_glider", distanceMi: 5.4, mph: 16.8 },
  { handle: "central_park_cruiser", distanceMi: 5.0, mph: 13.9 },
  { handle: "hudson_hammer", distanceMi: 3.3, mph: 16.0 },
  { handle: "prospect_pedaler", distanceMi: 6.2, mph: 12.4 },
];

export const SEED_RIDES: Ride[] = seeds.map((s, i) => ({
  id: `seed-${i}`,
  handle: s.handle,
  distanceMi: s.distanceMi,
  durationSec: Math.round((s.distanceMi / s.mph) * 3600),
  createdAt: Date.now() - (seeds.length - i) * 86_400_000,
  source: "seed" as const,
}));
