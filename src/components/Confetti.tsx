"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { BikeMark } from "./BikeMark";

type Piece = {
  tx: number;
  ty: number;
  peak: number;
  r: number;
  w: number;
  dur: number;
  delay: number;
};

/** A one-shot burst of little Citi bikes, fired when a ride posts. Each piece
 *  pops outward from centre, arcs up, then falls and fades — physics faked with
 *  per-piece CSS custom properties so it all runs on the compositor. The random
 *  layout is built in an effect (keeping render pure) and skipped entirely for
 *  reduced-motion users. */
export function Confetti({ count = 28 }: { count?: number }) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Randomized one-shot layout, intentionally built after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPieces(
      Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2;
        const dist = 180 + Math.random() * 520;
        return {
          // Wider horizontal throw so the burst scatters across the screen.
          tx: Math.round(Math.cos(angle) * dist * 1.45),
          ty: Math.round(Math.sin(angle) * dist + 180 + Math.random() * 460),
          peak: -Math.round(120 + Math.random() * 260),
          r: Math.round(Math.random() * 1080 - 540),
          w: Math.round(20 + Math.random() * 28),
          dur: Math.round(1200 + Math.random() * 900),
          delay: Math.round(Math.random() * 200),
        };
      }),
    );
  }, [count]);

  if (pieces.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[60] overflow-hidden"
    >
      {pieces.map((p, i) => (
        <span
          key={i}
          className="cs-confetti-piece block"
          style={
            {
              width: `${p.w}px`,
              "--tx": `${p.tx}px`,
              "--ty": `${p.ty}px`,
              "--peak": `${p.peak}px`,
              "--r": `${p.r}deg`,
              "--dur": `${p.dur}ms`,
              "--delay": `${p.delay}ms`,
            } as CSSProperties
          }
        >
          <BikeMark spin={false} />
        </span>
      ))}
    </div>
  );
}
