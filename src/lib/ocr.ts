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

  const isCitiBike = /citi\s*bike|citibike|\blyft\b/.test(lower);

  // Distance: a number followed by a miles unit. Allow "ml"/"mi"/"mile(s)".
  let distanceMi: number | null = null;
  const distMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:mi|ml|mile|miles)\b/);
  if (distMatch) {
    const v = parseFloat(distMatch[1]);
    if (!Number.isNaN(v) && v > 0 && v < 200) distanceMi = v;
  }

  // Duration. Prefer h:mm:ss, then mm:ss, then "N min".
  let durationSec: number | null = null;
  const hms = raw.match(/\b(\d{1,2}):(\d{2}):(\d{2})\b/);
  const ms = raw.match(/\b(\d{1,3}):(\d{2})\b/);
  const mins = lower.match(/(\d+)\s*min/);
  if (hms) {
    durationSec = +hms[1] * 3600 + +hms[2] * 60 + +hms[3];
  } else if (ms) {
    durationSec = +ms[1] * 60 + +ms[2];
  } else if (mins) {
    durationSec = +mins[1] * 60;
  }

  return { distanceMi, durationSec, isCitiBike, rawText: raw };
}
