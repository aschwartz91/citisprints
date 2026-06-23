"use client";

import { useEffect, useState } from "react";

/** A persistent primary action on phones. Stays hidden while the hero
 *  (and its own CTA) is on screen, then slides up once you scroll into
 *  the board — the standard app pattern for keeping the key action in
 *  thumb reach. Desktop never sees it. */
export function MobileCTA({
  onAddRide,
  hidden,
}: {
  onAddRide: () => void;
  hidden: boolean;
}) {
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) return;
    const io = new IntersectionObserver(
      ([entry]) => setPastHero(!entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  const visible = pastHero && !hidden;

  return (
    <div
      className={`pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-ground/90 px-4 pt-3 backdrop-blur-md transition-transform duration-300 sm:hidden ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
      aria-hidden={!visible}
    >
      <button
        type="button"
        onClick={onAddRide}
        tabIndex={visible ? 0 : -1}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-4 text-base font-semibold text-white shadow-[0_8px_24px_-8px_rgba(28,46,107,0.6)] active:scale-[0.99]"
      >
        Add your ride
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
