import { useEffect, useRef, useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';
import type { DemoPlot } from '../demoPlots/manifest';
import { PlotLightbox } from './PlotLightbox';

interface PlotFigureProps {
  plot: DemoPlot;
  /** e.g. "Southern Moreton Bay, Australia". */
  locationLabel: string;
  /** e.g. "Australia · Crabs · Density · By site". */
  breadcrumb: string;
  /** Analytics context for demo_plot_viewed. */
  analytics: { tab: string; metric: string | null; view: string | null };
}

/**
 * One demo plot: title, caption, "Preview data" badge, the image and its
 * credit line. The image file is fetched only when the figure mounts (its
 * view is selected); until then a box with the image's aspect ratio holds
 * the space. Expand (or clicking the image) opens the full-size lightbox.
 */
export function PlotFigure({
  plot,
  locationLabel,
  breadcrumb,
  analytics,
}: PlotFigureProps) {
  const posthog = usePostHog();
  const [loaded, setLoaded] = useState<{ id: string; src: string } | null>(
    null,
  );
  const [failed, setFailed] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const src = loaded?.id === plot.id ? loaded.src : null;
  const loadFailed = failed === plot.id;

  useEffect(() => {
    let active = true;
    plot
      .load()
      .then((url) => {
        if (active) setLoaded({ id: plot.id, src: url });
      })
      .catch(() => {
        if (active) setFailed(plot.id);
      });
    return () => {
      active = false;
    };
  }, [plot]);

  // Once per view (plot at a location), not per render; the ref also
  // absorbs StrictMode's double effect run. The view counts when the figure
  // is first actually on screen: AppLayout can mount the side panel twice
  // (mobile and desktop slots), and a figure can mount inside a hidden tab
  // and be shown later, so neither may report on mount alone.
  const figureRef = useRef<HTMLElement>(null);
  const lastViewed = useRef<string | null>(null);
  useEffect(() => {
    const key = `${plot.siteId}/${plot.id}/${analytics.tab}`;
    if (lastViewed.current === key) return;

    /** Sends demo_plot_viewed once for this key. */
    function report(): void {
      if (lastViewed.current === key) return;
      lastViewed.current = key;
      try {
        posthog?.capture('demo_plot_viewed', {
          location_id: plot.siteId,
          plot_id: plot.id,
          tab: analytics.tab,
          metric: analytics.metric,
          view: analytics.view,
          mode: 'local',
        });
      } catch (error) {
        console.error('Failed to capture demo_plot_viewed event:', error);
      }
    }

    const figure = figureRef.current;
    // No layout engine (tests, very old browsers): report on mount.
    if (!figure || typeof IntersectionObserver === 'undefined') {
      report();
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        report();
        observer.disconnect();
      }
    });
    observer.observe(figure);
    return () => observer.disconnect();
  }, [plot, analytics.tab, analytics.metric, analytics.view, posthog]);

  const byline = `${plot.credit} · ${locationLabel}`;
  // Reserve the image's own aspect ratio; never wider than its pixel width,
  // and tall portrait plots are capped to 70% of the viewport height.
  const boxStyle = {
    aspectRatio: `${plot.width} / ${plot.height}`,
    maxWidth: `min(100%, ${plot.width}px, calc(70vh * ${plot.width} / ${plot.height}))`,
  };

  return (
    <figure
      ref={figureRef}
      className="flex flex-col gap-2.5 rounded-xl border border-gray-200 bg-white p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-[14px] font-bold leading-[1.3] text-gray-900">
              {plot.title}
            </h3>
            <span className="rounded-full border border-gray-300 bg-gray-100 px-2 py-0.5 text-[10.5px] font-semibold text-gray-600">
              Preview data
            </span>
          </div>
          <p className="mt-1 text-[12.5px] leading-[1.45] text-gray-600">
            {plot.caption}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          disabled={!src}
          aria-label={`Expand: ${plot.title}`}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full border border-gray-300 px-2.5 py-1.5 text-[11.5px] font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-glowdex-green/40 disabled:cursor-default disabled:opacity-50"
        >
          <Maximize2 size={12} aria-hidden="true" />
          Expand
        </button>
      </div>

      {plot.note && (
        <p className="self-start rounded-md bg-glowdex-tint px-2 py-1.5 text-[11px] font-semibold text-glowdex-green">
          {plot.note}
        </p>
      )}

      <div
        className="mx-auto w-full overflow-hidden rounded-lg border border-[#eef0f2] bg-white"
        style={boxStyle}
        data-testid="plot-box"
      >
        {src ? (
          // Clicking the image is a mouse shortcut; the Expand button is the
          // keyboard path, so the image keeps its alt text for screen readers.
          <img
            src={src}
            alt={plot.alt}
            width={plot.width}
            height={plot.height}
            loading="lazy"
            decoding="async"
            onClick={() => setExpanded(true)}
            className="h-full w-full cursor-zoom-in object-contain"
          />
        ) : loadFailed ? (
          <p className="flex h-full items-center justify-center p-4 text-center text-[12px] text-gray-500">
            The plot image could not be loaded.
          </p>
        ) : (
          <div
            className="h-full w-full animate-pulse bg-gray-100 motion-reduce:animate-none"
            aria-hidden="true"
          />
        )}
      </div>

      <figcaption className="border-t border-gray-100 pt-2 text-[11.5px] text-gray-500">
        {byline}
      </figcaption>

      {expanded && src && (
        <PlotLightbox
          plot={plot}
          src={src}
          breadcrumb={breadcrumb}
          byline={byline}
          onClose={() => setExpanded(false)}
        />
      )}
    </figure>
  );
}
