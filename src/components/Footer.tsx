export function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/city-sprinters-logo.png"
            alt="City Sprinters"
            className="h-6 w-auto"
          />
          <span className="ml-3">The fastest riders in the city.</span>
        </p>
        <p className="max-w-md text-xs leading-relaxed text-faint">
          An independent fan project, not affiliated with or endorsed by Citi
          Bike, Lyft, or Citigroup. Posted rides power the public board.
        </p>
      </div>
    </footer>
  );
}
