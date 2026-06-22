"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Leaderboard } from "@/components/Leaderboard";
import { HowItWorks } from "@/components/HowItWorks";
import { Footer } from "@/components/Footer";
import { MobileCTA } from "@/components/MobileCTA";
import { AddRideModal, type SubmitResult } from "@/components/AddRideModal";
import type { Ride } from "@/lib/types";
import { addRide, getAllRides, rankings } from "@/lib/store";
import { SEED_RIDES } from "@/lib/mockData";
import { speedMph } from "@/lib/format";

export default function Home() {
  // Start from the deterministic seed set so server and client render
  // the same first paint, then fold in any saved rides after mount.
  const [rides, setRides] = useState<Ride[]>(SEED_RIDES);
  const [modalOpen, setModalOpen] = useState(false);
  const [justAddedHandle, setJustAddedHandle] = useState<string | null>(null);

  useEffect(() => {
    // Fold in localStorage-backed rides after mount. This must run
    // post-hydration (localStorage is client-only), so a one-time
    // setState here is the intended pattern, not an avoidable cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRides(getAllRides());
  }, []);

  const fastest = useMemo(() => rankings(rides, "fastest"), [rides]);
  const leader = fastest[0] ?? null;
  const riderCount = useMemo(
    () => new Set(rides.map((r) => r.handle)).size,
    [rides],
  );

  const handleSubmit = useCallback(
    (input: {
      handle: string;
      distanceMi: number;
      durationSec: number;
      route: string;
    }): SubmitResult => {
      addRide(input);
      const next = getAllRides();
      setRides(next);
      setJustAddedHandle(input.handle);
      const fastestRank =
        rankings(next, "fastest").findIndex((s) => s.handle === input.handle) +
        1;
      const longestRank =
        rankings(next, "longest").findIndex((s) => s.handle === input.handle) +
        1;
      return {
        fastestRank,
        longestRank,
        speedMph: speedMph(input.distanceMi, input.durationSec),
      };
    },
    [],
  );

  const openModal = useCallback(() => setModalOpen(true), []);

  return (
    <>
      <Nav onAddRide={openModal} />
      <main>
        <Hero
          leader={leader}
          riderCount={riderCount}
          rideCount={rides.length}
          onAddRide={openModal}
        />
        <Leaderboard rides={rides} justAddedHandle={justAddedHandle} />
        <HowItWorks />
      </main>
      <Footer />
      {/* Spacer so the fixed mobile action bar never hides the footer. */}
      <div className="h-20 sm:hidden" aria-hidden="true" />
      <MobileCTA onAddRide={openModal} hidden={modalOpen} />
      {modalOpen ? (
        <AddRideModal
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      ) : null}
    </>
  );
}
