export type Ride = {
  id: string;
  handle: string;
  /** Distance in miles. */
  distanceMi: number;
  /** Elapsed time in seconds. */
  durationSec: number;
  createdAt: number;
  source: "seed" | "user";
};

/** A rider's standing on a leaderboard, after aggregation. */
export type Standing = {
  handle: string;
  /** Best single-ride average speed in mph. */
  topSpeedMph: number;
  /** Cumulative distance across qualifying rides. */
  totalDistanceMi: number;
  /** Distance + duration of the ride that set the top speed. */
  bestDistanceMi: number;
  bestDurationSec: number;
  rides: number;
  source: Ride["source"];
};

export type Board = "fastest" | "longest";
