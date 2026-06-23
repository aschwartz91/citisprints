"use client";

export function Nav({ onAddRide }: { onAddRide: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-ground/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="flex items-center" aria-label="City Sprinters — home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/city-sprinters-logo.png"
            alt="City Sprinters"
            className="h-7 w-auto sm:h-8"
          />
        </a>
        <nav className="flex items-center gap-1 sm:gap-4">
          <a
            href="#board"
            className="hidden rounded-full px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-ink sm:block"
          >
            Leaderboard
          </a>
          <a
            href="#how"
            className="hidden rounded-full px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-ink sm:block"
          >
            How it works
          </a>
          <button
            type="button"
            onClick={onAddRide}
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-px active:translate-y-0"
          >
            <span className="text-accent-soft">+</span>
            <span className="hidden xs:inline">Add your ride</span>
            <span className="xs:hidden">Add ride</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
