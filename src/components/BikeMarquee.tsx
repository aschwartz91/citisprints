"use client";

import { useEffect, useRef } from "react";
import { BikeMark } from "./BikeMark";

/** A decorative band of bikes near the footer. Three rows, alternating
 *  direction, that slide horizontally as the page scrolls vertically — a
 *  parallax accent, not wallpaper. Pure transform on a handful of rows keeps
 *  it on the compositor; reduced-motion users get a still, centered band. */
const ROWS = [1, -1, 1];
const PER_ROW = 24;

export function BikeMarquee() {
  const bandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const band = bandRef.current;
    if (!band) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rows = Array.from(band.querySelectorAll<HTMLElement>("[data-dir]"));
    let raf = 0;

    const apply = () => {
      raf = 0;
      const rect = band.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // ~ +1 when the band sits below the viewport, ~ -1 when above, 0 centered.
      const p = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
      for (const row of rows) {
        const dir = Number(row.dataset.dir);
        row.style.transform = `translate3d(${(-p * 90 * dir).toFixed(1)}px, 0, 0)`;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={bandRef}
      aria-hidden="true"
      className="overflow-hidden border-t border-hairline bg-panel/40 py-8"
    >
      <div className="flex flex-col gap-4">
        {ROWS.map((dir, i) => (
          <div key={i} className="flex justify-center">
            <div
              data-dir={dir}
              className="flex w-max gap-10 opacity-[0.18] will-change-transform"
            >
              {Array.from({ length: PER_ROW }).map((_, j) => (
                <BikeMark
                  key={j}
                  spin={false}
                  className={`h-12 w-20 shrink-0${dir < 0 ? " -scale-x-100" : ""}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
