import type { Ride } from "./types";

/** Seed riders so the board feels alive before anyone uploads.
 *  Speeds sit in a believable Citi Bike range (~12–21 mph). A few
 *  riders log more than one ride to give the "Longest" board real
 *  cumulative totals. */
type Seed = { handle: string; distanceMi: number; mph: number };

const seeds: Seed[] = [
  { handle: "flatiron_flyer", distanceMi: 4.2, mph: 20.8 },
  { handle: "greenway_ghost", distanceMi: 6.1, mph: 20.1 },
  { handle: "queensboro_quick", distanceMi: 2.4, mph: 19.4 },
  { handle: "brooklyn_bullet", distanceMi: 3.6, mph: 18.7 },
  { handle: "riverside_rocket", distanceMi: 5.0, mph: 18.2 },
  { handle: "dumbo_dash", distanceMi: 1.9, mph: 17.6 },
  { handle: "harlem_hammer", distanceMi: 3.3, mph: 17.1 },
  { handle: "prospect_pace", distanceMi: 3.4, mph: 16.4 },
  { handle: "bowery_blur", distanceMi: 2.1, mph: 15.9 },
  { handle: "astoria_attack", distanceMi: 2.8, mph: 15.2 },
  { handle: "soho_sprint", distanceMi: 1.4, mph: 14.6 },
  { handle: "uptown_tempo", distanceMi: 6.1, mph: 14.0 },
  { handle: "eastriver_eddy", distanceMi: 4.7, mph: 13.3 },
  { handle: "ocean_pkwy_ollie", distanceMi: 5.5, mph: 12.6 },
  // Repeat riders — these stack distance on the Longest board.
  { handle: "greenway_ghost", distanceMi: 4.8, mph: 18.9 },
  { handle: "brooklyn_bullet", distanceMi: 2.2, mph: 17.0 },
  { handle: "uptown_tempo", distanceMi: 4.0, mph: 13.1 },
  { handle: "flatiron_flyer", distanceMi: 1.7, mph: 16.2 },
];

export const SEED_RIDES: Ride[] = seeds.map((s, i) => ({
  id: `seed-${i}`,
  handle: s.handle,
  distanceMi: s.distanceMi,
  durationSec: Math.round((s.distanceMi / s.mph) * 3600),
  createdAt: Date.now() - (seeds.length - i) * 86_400_000,
  source: "seed" as const,
}));
