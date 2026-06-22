import { ImageResponse } from "next/og";

export const alt =
  "Citi Sprints — the fastest Citi Bike riders in New York City";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Social share card. Mirrors the app's race-board look: cool ground,
// deep ink type, Citi azure, one warm flame accent on the leader.
// Uses the runtime default font (no network fetch at build).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#eef1f6",
          padding: 72,
          color: "#0b1726",
          fontFamily: "sans-serif",
        }}
      >
        {/* Left: the thesis */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
            paddingRight: 48,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 99,
                background: "#ff5a1f",
              }}
            />
            <div
              style={{
                fontSize: 22,
                letterSpacing: 4,
                color: "#56657c",
                textTransform: "uppercase",
              }}
            >
              New York City · Leaderboard
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: -2,
            }}
          >
            <span>The fastest</span>
            <span>riders in the</span>
            <span style={{ color: "#1a56db" }}>five boroughs.</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 99,
                border: "4px solid #1a56db",
                display: "flex",
              }}
            />
            <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1 }}>
              CITI SPRINTS
            </div>
          </div>
        </div>

        {/* Right: the current leader card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: 380,
            background: "#ffffff",
            borderRadius: 28,
            border: "1px solid rgba(11,23,38,0.10)",
            padding: 36,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              alignSelf: "flex-start",
              gap: 8,
              background: "rgba(255,90,31,0.10)",
              color: "#ff5a1f",
              padding: "8px 14px",
              borderRadius: 99,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            CURRENT LEADER
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
              <span style={{ fontSize: 104, fontWeight: 800, lineHeight: 1 }}>
                20.8
              </span>
              <span style={{ fontSize: 34, color: "#8b97a8", paddingBottom: 12 }}>
                mph
              </span>
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, marginTop: 14 }}>
              @flatiron_flyer
            </div>
            <div style={{ fontSize: 22, color: "#56657c", marginTop: 4 }}>
              Hudson River Greenway
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 28,
              fontSize: 22,
              color: "#56657c",
              borderTop: "1px solid rgba(11,23,38,0.10)",
              paddingTop: 20,
            }}
          >
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ color: "#0b1726", fontWeight: 700 }}>4.2</span>
              <span>mi</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ color: "#0b1726", fontWeight: 700 }}>12:07</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
