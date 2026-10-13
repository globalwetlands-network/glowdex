let started = false;

/**
 * Warms up the map route from the landing page: fetches the lazy `App` chunk
 * (the same one `main.tsx` imports for `/map`) and starts the dataset loads, so
 * opening the map renders without a loading screen. Runs at most once per page.
 *
 * Both are dynamic imports so the landing page's own bundle stays free of the
 * map app and the data loaders; they resolve to the same module instances the
 * map uses, so the preloaded data lands in the caches its hooks read.
 */
export function preloadMapApp(): void {
  if (started) return;
  started = true;
  // A failed fetch here is retried when /map actually mounts.
  import('@/app/App').catch(() => {});
  import('@/data/preload')
    .then(({ preloadMapData }) => preloadMapData())
    .catch(() => {});
}
