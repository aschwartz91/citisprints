export function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>
          <span className="display text-base text-ink">CITI SPRINTS</span>
          <span className="ml-3">The fastest riders in the city.</span>
        </p>
        <p className="max-w-md text-xs leading-relaxed text-faint">
          An independent fan project, not affiliated with or endorsed by Citi
          Bike, Lyft, or Citigroup. Your ride data stays in your browser.
        </p>
      </div>
    </footer>
  );
}
