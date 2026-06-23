"use client";

import { useEffect, useRef } from "react";

type Pt = [number, number];

/** Normalized (0–1) grid-aligned routes. The highlighted line traces one,
 *  holds, fades, then moves on to the next — cycling forever. */
const PATHS: Pt[][] = [
  [
    [0.1, 0.92],
    [0.1, 0.62],
    [0.34, 0.62],
    [0.34, 0.34],
    [0.6, 0.34],
    [0.6, 0.1],
  ],
  [
    [0.06, 0.22],
    [0.3, 0.22],
    [0.3, 0.5],
    [0.56, 0.5],
    [0.56, 0.8],
    [0.88, 0.8],
  ],
  [
    [0.92, 0.14],
    [0.64, 0.14],
    [0.64, 0.46],
    [0.4, 0.46],
    [0.4, 0.74],
    [0.14, 0.74],
  ],
];

const easeInOut = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

/** A generated abstract Manhattan street grid — avenues, cross streets, a
 *  Broadway-style diagonal, and one highlighted route that animates along a
 *  few different paths. Drawn faint so the hero type stays fully legible. */
export function GridCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const parent = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !parent || !ctx) return;

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    const gap = 48;
    const drawGrid = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(11,23,38,0.055)";
      for (let x = (w % gap) / 2; x <= w; x += gap) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = (h % gap) / 2; y <= h; y += gap) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      // Broadway — the diagonal that cuts the grid.
      ctx.strokeStyle = "rgba(28,46,107,0.07)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(w * 0.02, h + 30);
      ctx.lineTo(w * 0.78, -30);
      ctx.stroke();
    };

    const toPx = (path: Pt[]): Pt[] => path.map(([fx, fy]) => [fx * w, fy * h]);
    const lengths = (pts: Pt[]) => {
      const segs: number[] = [];
      let total = 0;
      for (let i = 1; i < pts.length; i++) {
        const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        segs.push(l);
        total += l;
      }
      return { segs, total };
    };

    // Draw a route up to fraction p of its length, scaled by alpha (for fades).
    const drawRoute = (pts: Pt[], p: number, alpha: number) => {
      const { segs, total } = lengths(pts);
      const target = p * total;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      // Faint full-path ghost so the route reads ahead of the moving head.
      ctx.strokeStyle = `rgba(28,46,107,${0.045 * alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();

      // The drawn trail (kept faint so type stays readable).
      ctx.strokeStyle = `rgba(28,46,107,${0.16 * alpha})`;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      let acc = 0;
      let head: Pt = pts[0];
      for (let i = 1; i < pts.length; i++) {
        const l = segs[i - 1];
        if (acc + l <= target) {
          ctx.lineTo(pts[i][0], pts[i][1]);
          head = pts[i];
          acc += l;
        } else {
          const t = (target - acc) / l;
          head = [
            pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t,
            pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t,
          ];
          ctx.lineTo(head[0], head[1]);
          break;
        }
      }
      ctx.stroke();

      // Moving head dot while drawing.
      if (p < 1) {
        ctx.fillStyle = `rgba(28,46,107,${0.5 * alpha})`;
        ctx.beginPath();
        ctx.arc(head[0], head[1], 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Finish node — the one warm spot of color — once the route completes.
      if (p > 0.999) {
        const [fx, fy] = pts[pts.length - 1];
        ctx.fillStyle = `rgba(230,22,35,${0.16 * alpha})`;
        ctx.beginPath();
        ctx.arc(fx, fy, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(230,22,35,${alpha})`;
        ctx.beginPath();
        ctx.arc(fx, fy, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      drawGrid();
      drawRoute(toPx(PATHS[0]), 1, 1);
      return () => ro.disconnect();
    }

    const DRAW = 2600;
    const HOLD = 1100;
    const FADE = 800;
    const cycle = DRAW + HOLD + FADE;
    let raf = 0;
    let start: number | null = null;

    const render = (now: number) => {
      if (start === null) start = now;
      const e = now - start;
      drawGrid();
      const pts = toPx(PATHS[Math.floor(e / cycle) % PATHS.length]);
      const ph = e % cycle;
      if (ph < DRAW) drawRoute(pts, easeInOut(ph / DRAW), 1);
      else if (ph < DRAW + HOLD) drawRoute(pts, 1, 1);
      else drawRoute(pts, 1, 1 - (ph - DRAW - HOLD) / FADE);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={className} />;
}
