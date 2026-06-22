const steps = [
  {
    n: "01",
    title: "Upload your ride",
    body: "Finish a ride in the Citi Bike app and screenshot the summary — the one with your distance and time. Drop it in.",
  },
  {
    n: "02",
    title: "We read & verify it",
    body: "Optical character recognition pulls the distance and elapsed time straight from the image, and checks it really came from Citi Bike.",
  },
  {
    n: "03",
    title: "Claim your spot",
    body: "Pick a handle and you're on the board. Rank by speed, stack miles, and defend your place as others ride.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how"
      className="border-t border-hairline bg-surface scroll-mt-20"
    >
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <p className="eyebrow mb-2">How it works</p>
        <h2 className="display max-w-xl text-3xl text-ink sm:text-4xl">
          Three steps from screenshot to leaderboard.
        </h2>

        <ol className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline sm:grid-cols-3">
          {steps.map((s) => (
            <li key={s.n} className="bg-surface p-7">
              <span className="tnum text-3xl font-bold text-accent">{s.n}</span>
              <h3 className="mt-4 text-lg font-bold text-ink">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-hairline bg-panel/60 p-5">
          <span className="mt-0.5 text-flame" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.5 2L4 14h6l-1.5 8L19 9h-6z" />
            </svg>
          </span>
          <p className="text-sm text-ink">
            <span className="font-semibold">The 0.3-mile rule.</span>{" "}
            <span className="text-muted">
              Rides shorter than 0.3 miles don&rsquo;t count toward either
              board. It keeps the leaderboard about real riding, not coasting to
              the corner for a fake top speed.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
