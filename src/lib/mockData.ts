import type { Ride } from "./types";

/** Seed riders so the board feels alive before anyone uploads.
 *  Speeds sit in a believable Citi Bike range (~12–21 mph). A few
 *  riders log more than one ride to give the "Longest" board real
 *  cumulative totals. */
type Seed = { handle: string; route: string; distanceMi: number; mph: number };

const seeds: Seed[] = [
  { handle: "flatiron_flyer", route: "Hudson River Greenway", distanceMi: 4.2, mph: 20.8 },
  { handle: "greenway_ghost", route: "West Side Highway Path", distanceMi: 6.1, mph: 20.1 },
  { handle: "queensboro_quick", route: "Queensboro Bridge", distanceMi: 2.4, mph: 19.4 },
  { handle: "brooklyn_bullet", route: "Kent Ave, Williamsburg", distanceMi: 3.6, mph: 18.7 },
  { handle: "riverside_rocket", route: "Riverside Drive", distanceMi: 5.0, mph: 18.2 },
  { handle: "dumbo_dash", route: "Manhattan Bridge", distanceMi: 1.9, mph: 17.6 },
  { handle: "harlem_hammer", route: "St. Nicholas Ave", distanceMi: 3.3, mph: 17.1 },
  { handle: "prospect_pace", route: "Prospect Park Loop", distanceMi: 3.4, mph: 16.4 },
  { handle: "bowery_blur", route: "2nd Ave Protected Lane", distanceMi: 2.1, mph: 15.9 },
  { handle: "astoria_attack", route: "Vernon Blvd", distanceMi: 2.8, mph: 15.2 },
  { handle: "soho_sprint", route: "Lafayette St", distanceMi: 1.4, mph: 14.6 },
  { handle: "uptown_tempo", route: "Central Park Loop", distanceMi: 6.1, mph: 14.0 },
  { handle: "eastriver_eddy", route: "East River Greenway", distanceMi: 4.7, mph: 13.3 },
  { handle: "ocean_pkwy_ollie", route: "Ocean Parkway", distanceMi: 5.5, mph: 12.6 },
  // Repeat riders — these stack distance on the Longest board.
  { handle: "greenway_ghost", route: "Battery Park Loop", distanceMi: 4.8, mph: 18.9 },
  { handle: "brooklyn_bullet", route: "Flushing Ave", distanceMi: 2.2, mph: 17.0 },
  { handle: "uptown_tempo", route: "Riverside Park", distanceMi: 4.0, mph: 13.1 },
  { handle: "flatiron_flyer", route: "9th Ave", distanceMi: 1.7, mph: 16.2 },
];

export const SEED_RIDES: Ride[] = seeds.map((s, i) => ({
  id: `seed-${i}`,
  handle: s.handle,
  route: s.route,
  distanceMi: s.distanceMi,
  durationSec: Math.round((s.distanceMi / s.mph) * 3600),
  createdAt: Date.now() - (seeds.length - i) * 86_400_000,
  source: "seed" as const,
}));
