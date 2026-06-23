"use client";

import { useCallback, useEffect, useRef, useState } from "react";
// NOTE: this component is mounted fresh each time the user opens it
// (the parent renders it conditionally), so React's own mount/unmount
// resets all state — no reset effect required.
import { readRideImage } from "@/lib/ocr";
import { BikeMark } from "./BikeMark";
import { Confetti } from "./Confetti";
import { shareStatsCard } from "@/lib/shareCard";
import {
  MIN_DISTANCE_MI,
  formatDuration,
  normalizeHandle,
  parseDuration,
  speedMph,
} from "@/lib/format";

export type SubmitResult = {
  fastestRank: number;
  longestRank: number;
  speedMph: number;
};

type Step = "drop" | "reading" | "review" | "done";

export function AddRideModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (input: {
    handle: string;
    distanceMi: number;
    durationSec: number;
  }) => Promise<SubmitResult>;
}) {
  const [step, setStep] = useState<Step>("drop");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isCitiBike, setIsCitiBike] = useState(false);
  const [autoRead, setAutoRead] = useState(false);
  // Values read straight off the screenshot are locked — the whole point of
  // uploading is that the numbers can't be hand-edited. A field only stays
  // editable when OCR couldn't read it, so a bad read never blocks a post.
  const [distanceLocked, setDistanceLocked] = useState(false);
  const [durationLocked, setDurationLocked] = useState(false);
  const [dragging, setDragging] = useState(false);

  const [distanceInput, setDistanceInput] = useState("");
  const [durationInput, setDurationInput] = useState("");
  const [handle, setHandle] = useState("");

  const [result, setResult] = useState<SubmitResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lock background scroll + close on Escape, for the modal's lifetime.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("That's not an image. Drop a screenshot of your ride.");
      return;
    }
    setError(null);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setStep("reading");
    setProgress(0);
    try {
      const parsed = await readRideImage(file, setProgress);
      setIsCitiBike(parsed.isCitiBike);
      setAutoRead(parsed.distanceMi !== null || parsed.durationSec !== null);
      if (parsed.distanceMi !== null) {
        setDistanceInput(String(parsed.distanceMi));
        setDistanceLocked(true);
      }
      if (parsed.durationSec !== null) {
        setDurationInput(formatDuration(parsed.durationSec));
        setDurationLocked(true);
      }
      setStep("review");
    } catch {
      setError("We couldn't read that image. Enter your numbers by hand.");
      setStep("review");
    }
  }, []);

  // Paste a screenshot straight from the clipboard (drop step only).
  useEffect(() => {
    if (step !== "drop") return;
    const onPaste = (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items ?? []).find((i) =>
        i.type.startsWith("image/"),
      );
      const file = item?.getAsFile();
      if (file) handleFile(file);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [step, handleFile]);

  const distanceMi = parseFloat(distanceInput);
  const durationSec = parseDuration(durationInput);
  const hasDistance = !Number.isNaN(distanceMi) && distanceMi > 0;
  const hasDuration = durationSec !== null && durationSec > 0;
  const liveSpeed =
    hasDistance && hasDuration ? speedMph(distanceMi, durationSec) : null;
  const belowThreshold = hasDistance && distanceMi < MIN_DISTANCE_MI;
  const cleanHandle = normalizeHandle(handle);
  const canSubmit =
    hasDistance && hasDuration && !belowThreshold && cleanHandle.length >= 2;

  const submit = async () => {
    if (!canSubmit || durationSec === null || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await onSubmit({
        handle: cleanHandle,
        distanceMi,
        durationSec,
      });
      setResult(res);
      setStep("done");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "We couldn't post your ride. Check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {step === "done" ? <Confetti /> : null}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-ride-title"
        className="settle max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-hairline bg-surface shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <h2 id="add-ride-title" className="display text-xl text-ink">
            {step === "done" ? "You're on the board" : "Add your ride"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-faint transition-colors hover:bg-panel hover:text-ink"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="pb-safe px-6 py-6 sm:pb-6">
          {step === "drop" ? (
            <DropStep
              dragging={dragging}
              setDragging={setDragging}
              error={error}
              onPick={() => fileInputRef.current?.click()}
              onFile={handleFile}
            />
          ) : null}

          {step === "reading" ? (
            <ReadingStep previewUrl={previewUrl} progress={progress} />
          ) : null}

          {step === "review" ? (
            <ReviewStep
              previewUrl={previewUrl}
              isCitiBike={isCitiBike}
              autoRead={autoRead}
              error={error}
              distanceInput={distanceInput}
              durationInput={durationInput}
              distanceLocked={distanceLocked}
              durationLocked={durationLocked}
              handle={handle}
              liveSpeed={liveSpeed}
              belowThreshold={belowThreshold}
              canSubmit={canSubmit}
              submitting={submitting}
              onDistance={setDistanceInput}
              onDuration={setDurationInput}
              onHandle={setHandle}
              onSubmit={submit}
            />
          ) : null}

          {step === "done" && result ? (
            <DoneStep
              result={result}
              handle={cleanHandle}
              onClose={onClose}
            />
          ) : null}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>
    </div>
  );
}

function DropStep({
  dragging,
  setDragging,
  error,
  onPick,
  onFile,
}: {
  dragging: boolean;
  setDragging: (v: boolean) => void;
  error: string | null;
  onPick: () => void;
  onFile: (f: File) => void;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onPick}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) onFile(file);
        }}
        className={`flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
          dragging
            ? "border-accent bg-accent-soft/50"
            : "border-hairline-strong bg-panel/40 hover:border-accent hover:bg-accent-soft/30"
        }`}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 16V4m0 0L7 9m5-5l5 5M5 20h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="font-semibold text-ink">
          Drop your ride screenshot
        </span>
        <span className="text-sm text-muted">
          or click to browse · or paste from clipboard
        </span>
      </button>
      {error ? <p className="mt-3 text-sm text-flame">{error}</p> : null}
      <p className="mt-4 text-center text-xs text-faint">
        Use the Citi Bike app&rsquo;s ride summary — the screen with your
        distance and time.
      </p>
    </div>
  );
}

function ReadingStep({
  previewUrl,
  progress,
}: {
  previewUrl: string | null;
  progress: number;
}) {
  const pct = Math.round(progress * 100);
  return (
    <div className="flex flex-col items-center py-4">
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt="Your ride"
          className="mb-6 max-h-44 rounded-xl border border-hairline object-contain"
        />
      ) : null}
      <p className="font-semibold text-ink">Reading your ride…</p>
      <p className="mt-1 text-sm text-muted">
        Pulling the distance and time from the image.
      </p>
      {/* The bike rides the length of the track as OCR progresses — wheels
          spinning, leading edge parked at the current percentage. */}
      <div className="relative mt-5 h-14 w-full">
        <div className="absolute inset-x-0 bottom-1.5 h-px bg-hairline-strong" />
        <div
          className="absolute bottom-0 w-16 transition-[left,transform] duration-200 ease-linear"
          style={{ left: `${pct}%`, transform: `translateX(-${pct}%)` }}
        >
          <BikeMark spinSeconds={0.6} />
        </div>
      </div>
      <p className="tnum mt-1 text-xs text-faint">{pct}%</p>
    </div>
  );
}

function ReviewStep({
  previewUrl,
  isCitiBike,
  autoRead,
  error,
  distanceInput,
  durationInput,
  distanceLocked,
  durationLocked,
  handle,
  liveSpeed,
  belowThreshold,
  canSubmit,
  submitting,
  onDistance,
  onDuration,
  onHandle,
  onSubmit,
}: {
  previewUrl: string | null;
  isCitiBike: boolean;
  autoRead: boolean;
  error: string | null;
  distanceInput: string;
  durationInput: string;
  distanceLocked: boolean;
  durationLocked: boolean;
  handle: string;
  liveSpeed: number | null;
  belowThreshold: boolean;
  canSubmit: boolean;
  submitting: boolean;
  onDistance: (v: string) => void;
  onDuration: (v: string) => void;
  onHandle: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div className="flex items-center gap-3">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Your ride"
            className="h-16 w-16 shrink-0 rounded-lg border border-hairline object-cover"
          />
        ) : null}
        <Verification isCitiBike={isCitiBike} autoRead={autoRead} />
      </div>

      {error ? <p className="mt-3 text-sm text-flame">{error}</p> : null}

      <div className="mt-5 grid grid-cols-2 gap-3">
        <MetricField
          label="Distance (mi)"
          locked={distanceLocked}
          value={distanceInput}
          onChange={onDistance}
          placeholder="2.4"
          inputMode="decimal"
        />
        <MetricField
          label="Time (mm:ss)"
          locked={durationLocked}
          value={durationInput}
          onChange={onDuration}
          placeholder="9:42"
          inputMode="numeric"
        />
      </div>
      {distanceLocked || durationLocked ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-faint">
          <LockGlyph />
          Read from your screenshot — locked so the board stays honest.
        </p>
      ) : null}

      <div className="mt-3 flex items-center justify-between rounded-lg border border-hairline bg-panel/50 px-4 py-3">
        <span className="text-sm font-medium text-muted">Average speed</span>
        <span className="tnum text-xl font-bold text-ink">
          {liveSpeed !== null ? liveSpeed.toFixed(1) : "—"}
          <span className="ml-1 text-sm text-faint">mph</span>
        </span>
      </div>

      {belowThreshold ? (
        <p className="mt-3 rounded-lg bg-flame/10 px-3 py-2 text-sm text-flame">
          That&rsquo;s under the 0.3-mile minimum, so it won&rsquo;t count. Log a
          longer ride to make the board.
        </p>
      ) : null}

      <div className="mt-4 grid gap-3">
        <Field label="Your handle">
          <div className="flex items-center rounded-lg border border-hairline-strong bg-ground focus-within:border-accent">
            <span className="pl-3 text-faint">@</span>
            <input
              value={handle}
              onChange={(e) => onHandle(e.target.value)}
              placeholder="brooklyn_bullet"
              maxLength={20}
              className="w-full bg-transparent py-2.5 pl-1 pr-3 text-ink outline-none"
            />
          </div>
        </Field>
      </div>

      <button
        type="submit"
        disabled={!canSubmit || submitting}
        className="mt-6 w-full rounded-full bg-accent px-6 py-3.5 text-base font-semibold text-white transition-transform enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? "Posting…" : "Post to the leaderboard"}
      </button>
    </form>
  );
}

function Verification({
  isCitiBike,
  autoRead,
}: {
  isCitiBike: boolean;
  autoRead: boolean;
}) {
  if (isCitiBike) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-2 text-sm font-semibold text-accent">
        <Check /> Verified Citi Bike ride
      </div>
    );
  }
  return (
    <div className="rounded-lg bg-flame/10 px-3 py-2 text-sm text-flame">
      {autoRead
        ? "We couldn't confirm this is a Citi Bike ride — double-check the numbers."
        : "We couldn't read this automatically — enter your numbers below."}
    </div>
  );
}

function DoneStep({
  result,
  handle,
  onClose,
}: {
  result: SubmitResult;
  handle: string;
  onClose: () => void;
}) {
  const [sharing, setSharing] = useState(false);
  const [saved, setSaved] = useState(false);

  const onShare = async () => {
    if (sharing) return;
    setSharing(true);
    setSaved(false);
    try {
      const outcome = await shareStatsCard({
        handle,
        speedMph: result.speedMph,
        fastestRank: result.fastestRank,
        longestRank: result.longestRank,
      });
      if (outcome === "downloaded") setSaved(true);
    } catch {
      // non-fatal — the card just didn't share
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="py-2 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
        <Check size={26} />
      </div>
      <p className="mt-4 text-lg font-semibold text-ink">
        Welcome to the board, @{handle}.
      </p>
      <p className="mt-1 text-sm text-muted">
        These are your bragging rights. Go rub it in.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-hairline bg-hairline">
        <RankCell label="Fastest" rank={result.fastestRank} />
        <RankCell label="Longest" rank={result.longestRank} />
      </div>
      <p className="tnum mt-4 text-sm text-muted">
        Logged at {result.speedMph.toFixed(1)} mph.
      </p>
      <button
        type="button"
        onClick={onShare}
        disabled={sharing}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-base font-semibold text-white transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-60"
      >
        <ShareIcon />
        {sharing
          ? "Preparing your card…"
          : saved
            ? "Saved — share it anywhere"
            : "Share your bragging rights"}
      </button>
      <button
        type="button"
        onClick={onClose}
        className="mt-3 w-full rounded-full border border-hairline-strong px-6 py-3 text-base font-semibold text-ink transition-colors hover:bg-panel"
      >
        See where you landed
      </button>
    </div>
  );
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3v13M12 3L8 7m4-4l4 4M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RankCell({ label, rank }: { label: string; rank: number }) {
  return (
    <div className="bg-surface px-4 py-4">
      <p className="eyebrow">{label}</p>
      <p className="tnum mt-1 text-2xl font-bold text-ink">
        <span className="text-faint">#</span>
        {rank}
      </p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="eyebrow mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}

/** A metric (distance/time) that is either an editable input — when OCR
 *  couldn't read it — or a locked, read-only display when it came straight
 *  from the uploaded screenshot. */
function MetricField({
  label,
  locked,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  locked: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  inputMode: "decimal" | "numeric";
}) {
  if (locked) {
    return (
      <Field label={label}>
        <div
          aria-readonly="true"
          title="Read from your screenshot — can't be edited"
          className="tnum flex w-full items-center justify-between rounded-lg border border-hairline bg-panel/60 px-3 py-2.5 text-lg font-bold text-ink"
        >
          <span>{value}</span>
          <LockGlyph />
        </div>
      </Field>
    );
  }
  return (
    <Field label={label}>
      <input
        inputMode={inputMode}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="tnum w-full rounded-lg border border-hairline-strong bg-ground px-3 py-2.5 text-lg font-bold text-ink outline-none focus:border-accent"
      />
    </Field>
  );
}

function LockGlyph() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0 text-faint"
    >
      <rect
        x="5"
        y="11"
        width="14"
        height="9"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 11V8a4 4 0 1 1 8 0v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Check({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
