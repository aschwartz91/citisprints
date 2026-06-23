import type { CSSProperties } from "react";
import { BikeMark } from "./BikeMark";

/** A full-width band, between the hero and the board, where a Citi bike rides
 *  across on a loop. Both how fast it crosses and how fast its wheels spin are
 *  tied to the current leader's mph — the art literally moves at the pace of
 *  the board's top speed. */
export function BikeStrip({ leaderMph }: { leaderMph: number | null }) {
  const mph = leaderMph ?? 16;
  // Faster leader → quicker crossing and quicker spin. Clamped so it always
  // reads as smooth motion (and the two stay roughly in step).
  const travelSeconds = Math.max(3, Math.min(6, 75 / mph));
  const spinSeconds = Math.max(0.5, Math.min(2, 26 / mph));

  return (
    <div
      aria-hidden="true"
      className="relative overflow-hidden border-b border-hairline bg-ground"
    >
      {/* the road */}
      <div className="absolute inset-x-0 bottom-8 h-px bg-hairline-strong sm:bottom-10" />
      <div className="relative h-24 sm:h-32">
        <div
          className="cs-ride absolute bottom-3 left-0 w-40 sm:bottom-4 sm:w-56"
          style={{ "--cs-travel": `${travelSeconds}s` } as CSSProperties}
        >
          <BikeMark spinSeconds={spinSeconds} />
        </div>
      </div>
    </div>
  );
}
