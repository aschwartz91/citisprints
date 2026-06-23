import type { CSSProperties } from "react";

/** The Citi Bike mark. Each wheel's spokes live in a `.cs-wheel` group that
 *  CSS spins; `spinSeconds` (seconds per rotation) is wired through the
 *  `--cs-spin` custom property so callers can tie wheel speed to a real mph.
 *  Spokes are inlined (not a shared <defs> id) so any number of bikes can be
 *  rendered on one page — e.g. a confetti burst — without id collisions. */
export function BikeMark({
  className,
  spinSeconds = 1.4,
  spin = true,
}: {
  className?: string;
  spinSeconds?: number;
  spin?: boolean;
}) {
  const wheelClass = spin ? "cs-wheel" : undefined;
  return (
    <svg
      className={className}
      viewBox="0 0 800 500"
      fill="none"
      aria-hidden="true"
      style={{ "--cs-spin": `${spinSeconds}s` } as CSSProperties}
    >
      <Wheel cx={200} cy={350} wheelClass={wheelClass} />
      <Wheel cx={620} cy={350} wheelClass={wheelClass} />

      <path
        d="M 515 350 A 108 108 0 0 1 650 250"
        stroke="#23222E"
        strokeWidth="14"
        strokeLinecap="round"
      />

      <path d="M 90 350 A 110 110 0 0 1 270 265 L 200 350 Z" fill="#2E5CB8" />
      <path d="M 85 295 A 16 16 0 0 0 85 325 L 98 310 Z" fill="#FF2A5F" />

      <line x1="200" y1="350" x2="360" y2="190" stroke="#2E5CB8" strokeWidth="18" strokeLinecap="round" />
      <line x1="200" y1="350" x2="420" y2="350" stroke="#2E5CB8" strokeWidth="26" strokeLinecap="round" />
      <line x1="200" y1="367" x2="420" y2="367" stroke="#23222E" strokeWidth="4" />
      <path d="M 565 180 C 530 330, 480 350, 420 350" stroke="#2E5CB8" strokeWidth="34" strokeLinecap="round" />
      <line x1="420" y1="350" x2="360" y2="180" stroke="#2E5CB8" strokeWidth="20" strokeLinecap="round" />
      <line x1="620" y1="350" x2="565" y2="180" stroke="#2E5CB8" strokeWidth="16" strokeLinecap="round" />
      <line x1="565" y1="185" x2="585" y2="120" stroke="#2E5CB8" strokeWidth="26" strokeLinecap="round" />

      <circle cx="420" cy="350" r="38" fill="#2E5CB8" />
      <circle cx="420" cy="350" r="16" fill="#D3D5DE" />
      <circle cx="200" cy="350" r="18" fill="#D3D5DE" />
      <circle cx="620" cy="350" r="14" fill="#D3D5DE" />

      <line x1="420" y1="350" x2="445" y2="420" stroke="#D3D5DE" strokeWidth="10" strokeLinecap="round" />
      <rect x="430" y="416" width="30" height="8" fill="#23222E" rx="4" />

      <line x1="360" y1="180" x2="345" y2="135" stroke="#D3D5DE" strokeWidth="12" strokeLinecap="round" />
      <path
        d="M 315 145 C 315 130, 340 135, 360 135 C 375 135, 390 145, 380 150 C 360 155, 320 155, 315 145 Z"
        fill="#23222E"
      />

      <polygon points="575,150 585,120 605,125 595,155" fill="#2E5CB8" />

      <line x1="585" y1="120" x2="595" y2="90" stroke="#23222E" strokeWidth="14" strokeLinecap="round" />
      <path d="M 595 90 C 595 75, 585 70, 565 70" stroke="#23222E" strokeWidth="14" strokeLinecap="round" />
      <line x1="565" y1="70" x2="535" y2="70" stroke="#23222E" strokeWidth="22" strokeLinecap="round" />

      <polygon points="605,135 655,135 665,85 595,85" fill="#2E5CB8" />
      <line x1="592" y1="85" x2="668" y2="85" stroke="#23222E" strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}

/** One wheel: dark tire, spinning spokes, light rim, plus the inline spokes. */
function Wheel({
  cx,
  cy,
  wheelClass,
}: {
  cx: number;
  cy: number;
  wheelClass?: string;
}) {
  return (
    <g transform={`translate(${cx}, ${cy})`}>
      <circle cx="0" cy="0" r="100" stroke="#23222E" strokeWidth="12" />
      <g className={wheelClass}>
        {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5].map((deg) => (
          <line
            key={deg}
            x1="-94"
            y1="0"
            x2="94"
            y2="0"
            stroke="#D3D5DE"
            strokeWidth="1.5"
            transform={`rotate(${deg})`}
          />
        ))}
      </g>
      <circle cx="0" cy="0" r="94" stroke="#D3D5DE" strokeWidth="3" />
    </g>
  );
}
