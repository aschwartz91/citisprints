/** Renders a shareable "bragging rights" card for a rider's result and hands
 *  it to the native share sheet (mobile) — falling back to a download on
 *  desktop / unsupported browsers. Drawn on a canvas so there are no runtime
 *  deps and no html-to-image font/CORS surprises. */

export type ShareStats = {
  handle: string;
  speedMph: number;
  fastestRank: number;
  longestRank: number;
};

export type ShareOutcome = "shared" | "cancelled" | "downloaded";

const NAVY = "#1c2e6b";
const RED = "#e61623";
const INK = "#0b1726";
const MUTED = "#56657c";
const FAINT = "#8b97a8";
const GROUND = "#eef1f6";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function ordinal(n: number): string {
  return n > 0 ? `#${n}` : "—";
}

/** A standings pill: small label on top, big rank below, centred on (cx). */
function drawPill(
  ctx: CanvasRenderingContext2D,
  cx: number,
  top: number,
  label: string,
  rank: number,
) {
  const w = 420;
  const h = 190;
  const x = cx - w / 2;
  const leader = rank === 1;
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = leader ? RED : "rgba(11,23,38,0.10)";
  ctx.lineWidth = leader ? 4 : 2;
  ctx.beginPath();
  ctx.roundRect(x, top, w, h, 28);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = MUTED;
  ctx.font = '700 30px system-ui, -apple-system, sans-serif';
  ctx.fillText(label, cx, top + 58);

  ctx.fillStyle = leader ? RED : NAVY;
  ctx.font =
    '800 96px ui-monospace, "SF Mono", "JetBrains Mono", Menlo, monospace';
  ctx.fillText(ordinal(rank), cx, top + 150);
}

async function drawCard(o: ShareStats): Promise<Blob> {
  const W = 1080;
  const H = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");

  // Background + a thin top brand bar.
  ctx.fillStyle = GROUND;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = NAVY;
  ctx.fillRect(0, 0, W, 14);
  ctx.fillStyle = RED;
  ctx.fillRect(0, 0, W / 2, 14);

  // Logo.
  try {
    const logo = await loadImage("/city-sprinters-logo.png");
    const lw = 540;
    const lh = (logo.height * lw) / logo.width;
    ctx.drawImage(logo, (W - lw) / 2, 96, lw, lh);
  } catch {
    // brand text fallback if the asset fails to load
    ctx.textAlign = "center";
    ctx.fillStyle = NAVY;
    ctx.font = "800 72px system-ui, sans-serif";
    ctx.fillText("CITY SPRINTERS", W / 2, 190);
  }

  ctx.textAlign = "center";
  ctx.fillStyle = MUTED;
  ctx.font = '700 28px system-ui, -apple-system, sans-serif';
  ctx.fillText("N Y C   C I T I   B I K E   L E A D E R B O A R D", W / 2, 300);

  // Hero stat: top speed.
  ctx.fillStyle = NAVY;
  ctx.font =
    '800 250px ui-monospace, "SF Mono", "JetBrains Mono", Menlo, monospace';
  ctx.fillText(o.speedMph.toFixed(1), W / 2, 520);
  ctx.fillStyle = FAINT;
  ctx.font = "700 56px system-ui, sans-serif";
  ctx.fillText("MPH", W / 2, 588);

  // Handle.
  ctx.fillStyle = INK;
  ctx.font = "800 70px system-ui, -apple-system, sans-serif";
  ctx.fillText(`@${o.handle}`, W / 2, 690);

  // Standings.
  drawPill(ctx, W / 2 - 230, 760, "FASTEST", o.fastestRank);
  drawPill(ctx, W / 2 + 230, 760, "LONGEST", o.longestRank);

  // Footer.
  ctx.fillStyle = FAINT;
  ctx.font = "500 30px system-ui, sans-serif";
  ctx.fillText("citisprints.vercel.app", W / 2, 1010);

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/png",
    ),
  );
}

export async function shareStatsCard(o: ShareStats): Promise<ShareOutcome> {
  const blob = await drawCard(o);
  const file = new File([blob], `city-sprinters-${o.handle}.png`, {
    type: "image/png",
  });
  const text = `@${o.handle} — ${o.speedMph.toFixed(
    1,
  )} mph on City Sprinters. Fastest ${ordinal(o.fastestRank)}, Longest ${ordinal(
    o.longestRank,
  )}. Catch me if you can.`;

  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean;
  };
  if (nav.canShare?.({ files: [file] }) && nav.share) {
    try {
      await nav.share({ files: [file], title: "City Sprinters", text });
      return "shared";
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") return "cancelled";
      // otherwise fall through to download
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return "downloaded";
}
