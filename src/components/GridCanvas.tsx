"use client";

import { useEffect, useRef } from "react";

/** A generated abstract Manhattan street grid — avenues, cross
 *  streets, a Broadway-style diagonal, and one highlighted route.
 *  Purely atmospheric; drawn faint so type stays legible. */
export function GridCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      if (w === 0 || h === 0) return;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const gap = 48;

      // Cross streets + avenues.
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
      ctx.strokeStyle = "rgba(26,86,219,0.10)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(w * 0.02, h + 30);
      ctx.lineTo(w * 0.78, -30);
      ctx.stroke();

      // A highlighted route, snapping along the grid like real
      // turn-by-turn directions, ending on a flame finish node.
      const pts: [number, number][] = [
        [w * 0.12, h * 0.86],
        [w * 0.12, h * 0.58],
        [w * 0.38, h * 0.58],
        [w * 0.38, h * 0.3],
        [w * 0.66, h * 0.3],
        [w * 0.66, h * 0.12],
      ];
      ctx.strokeStyle = "rgba(26,86,219,0.32)";
      ctx.lineWidth = 2.5;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.beginPath();
      pts.forEach(([x, y], i) =>
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y),
      );
      ctx.stroke();

      // Start node.
      const [sx, sy] = pts[0];
      ctx.fillStyle = "rgba(26,86,219,0.9)";
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fill();

      // Finish node — the one warm spot of color.
      const [fx, fy] = pts[pts.length - 1];
      ctx.fillStyle = "rgba(255,90,31,0.16)";
      ctx.beginPath();
      ctx.arc(fx, fy, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ff5a1f";
      ctx.beginPath();
      ctx.arc(fx, fy, 5, 0, Math.PI * 2);
      ctx.fill();
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(parent);
    return () => ro.disconnect();
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={className} />;
}
