"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { BikeStrip } from "@/components/BikeStrip";
import { BikeMarquee } from "@/components/BikeMarquee";
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
    // Fold in the Supabase-backed rides after mount. The first paint uses the
    // deterministic seed set (so server and client agree); once the network
    // round-trip resolves we replace it with seeds + everyone's posted rides.
    let active = true;
    getAllRides().then((all) => {
      if (active) setRides(all);
    });
    return () => {
      active = false;
    };
  }, []);

  const fastest = useMemo(() => rankings(rides, "fastest"), [rides]);
  const leader = fastest[0] ?? null;
  const riderCount = useMemo(
    () => new Set(rides.map((r) => r.handle)).size,
    [rides],
  );

  const handleSubmit = useCallback(
    async (input: {
      handle: string;
      distanceMi: number;
      durationSec: number;
    }): Promise<SubmitResult> => {
      await addRide(input);
      const next = await getAllRides();
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
        <BikeStrip leaderMph={leader ? leader.topSpeedMph : null} />
        <Leaderboard rides={rides} justAddedHandle={justAddedHandle} />
        <HowItWorks />
      </main>
      <BikeMarquee />
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
