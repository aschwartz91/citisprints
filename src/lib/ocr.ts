import Tesseract from "tesseract.js";

export type ParsedRide = {
  distanceMi: number | null;
  durationSec: number | null;
  isCitiBike: boolean;
  rawText: string;
};

/** Run OCR on an image file. `onProgress` reports 0–1 recognition
 *  progress so the UI can show a real bar instead of a fake spinner. */
export async function readRideImage(
  file: File | Blob,
  onProgress?: (fraction: number) => void,
): Promise<ParsedRide> {
  const { data } = await Tesseract.recognize(file, "eng", {
    logger: (m) => {
      if (m.status === "recognizing text" && onProgress) {
        onProgress(m.progress);
      }
    },
  });
  return parseRideText(data.text);
}

/** Pull distance, elapsed time, and a Citi Bike authenticity signal
 *  out of OCR text. Tolerant of the usual OCR slips (mi → ml, l → 1). */
export function parseRideText(text: string): ParsedRide {
  const raw = text ?? "";
  const lower = raw.toLowerCase();

  // A real Citi Bike / Lyft ride receipt. The brand name often isn't in the
  // shot (e.g. the "Your Trip" e-bike receipt), so we also accept the phrases
  // unique to these bikeshare summaries: unlock fees, e-bike line items, the
  // points system, and the "ride ended" / "member fare" headers.
  const isCitiBike =
    /citi\s*bike|citibike|\blyft\b/.test(lower) ||
    /e-?bike|free unlock|classic bike|pickup points|points for this ride|ride ended|member fare/.test(
      lower,
    );

  // Distance: a number followed by a miles unit. Allow "ml"/"mi"/"mile(s)".
  let distanceMi: number | null = null;
  const distMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:mi|ml|mile|miles)\b/);
  if (distMatch) {
    const v = parseFloat(distMatch[1]);
    if (!Number.isNaN(v) && v > 0 && v < 200) distanceMi = v;
  }

  // Duration. Ride summaries render this as text ("7 min", "1 hr 7 min"),
  // so trust that first. The colon times that otherwise trip up parsing are
  // almost always the phone's status-bar clock (e.g. "9:11"), which sits on
  // the first line — so we strip that line before considering a colon time.
  const body = raw.replace(/^.*(\r?\n|$)/, "");
  const durationSec = readDuration(body) ?? readDuration(raw);

  return { distanceMi, durationSec, isCitiBike, rawText: raw };
}

/** Parse an elapsed time out of a chunk of OCR text, in the order ride
 *  summaries can be trusted: spelled-out hours/minutes/seconds first, then
 *  a colon time (h:mm:ss, then mm:ss) as a fallback. Returns null on no hit. */
function readDuration(text: string): number | null {
  const t = text.toLowerCase();

  // "1 hr 7 min 30 sec" and any subset of it.
  const hr = t.match(/(\d+)\s*(?:hours?|hrs?)\b/);
  const min = t.match(/(\d+)\s*(?:minutes?|mins?)\b/);
  const sec = t.match(/(\d+)\s*(?:seconds?|secs?)\b/);
  if (hr || min || sec) {
    return (
      (hr ? +hr[1] * 3600 : 0) +
      (min ? +min[1] * 60 : 0) +
      (sec ? +sec[1] : 0)
    );
  }

  const hms = t.match(/\b(\d{1,2}):(\d{2}):(\d{2})\b/);
  if (hms) return +hms[1] * 3600 + +hms[2] * 60 + +hms[3];
  const ms = t.match(/\b(\d{1,3}):(\d{2})\b/);
  if (ms) return +ms[1] * 60 + +ms[2];

  return null;
}
