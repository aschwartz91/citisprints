/** Minimum qualifying distance. Shorter hops don't count — no
 *  bombing down the block for a fake top speed. */
export const MIN_DISTANCE_MI = 0.3;

export function speedMph(distanceMi: number, durationSec: number): number {
  if (durationSec <= 0) return 0;
  return distanceMi / (durationSec / 3600);
}

/** "9:42" or "1:04:18" */
export function formatDuration(totalSec: number): string {
  const sec = Math.max(0, Math.round(totalSec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** Parse "9:42", "1:04:18", or "14" (minutes) into seconds. */
export function parseDuration(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(":").map((p) => p.trim());
  if (parts.some((p) => p === "" || !/^\d+$/.test(p))) return null;
  const nums = parts.map(Number);
  if (nums.length === 1) return nums[0] * 60; // bare minutes
  if (nums.length === 2) return nums[0] * 60 + nums[1];
  if (nums.length === 3) return nums[0] * 3600 + nums[1] * 60 + nums[2];
  return null;
}

export function formatSpeed(mph: number): string {
  return mph.toFixed(1);
}

export function formatDistance(mi: number): string {
  return mi.toFixed(mi < 10 ? 2 : 1);
}

export function formatRank(n: number): string {
  return n.toString().padStart(2, "0");
}

/** Sanitize to a valid handle: lowercase, alphanumeric + underscore. */
export function normalizeHandle(raw: string): string {
  return raw
    .trim()
    .replace(/^@+/, "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 20);
}
