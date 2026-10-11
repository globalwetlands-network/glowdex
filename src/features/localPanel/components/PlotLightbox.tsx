import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { DemoPlot } from '../demoPlots/manifest';

interface PlotLightboxProps {
  plot: DemoPlot;
  src: string;
  breadcrumb: string;
  byline: string;
  onClose: () => void;
}

/**
 * Full-size view of a demo plot in a modal <dialog> (Esc closes it, focus
 * stays inside). The image is shown at up to its own pixel width and never
 * upscaled; on phones the dialog is a full-screen sheet that scrolls.
 */
export function PlotLightbox({
  plot,
  src,
  breadcrumb,
  byline,
  onClose,
}: PlotLightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }, []);

  const titleId = `lightbox-title-${plot.id}`;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      // A click on the backdrop lands on the <dialog> itself.
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-0 h-full max-h-none w-full max-w-none bg-white p-0 backdrop:bg-gray-900/55 md:m-auto md:h-auto md:max-h-[calc(100dvh-64px)] md:w-[980px] md:max-w-[calc(100vw-64px)] md:rounded-[14px] md:shadow-2xl"
    >
      <div className="flex flex-col gap-3 px-4 pb-6 pt-[18px] md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-gray-400">
              {breadcrumb}
            </p>
            <h2
              id={titleId}
              className="mt-1 text-[18px] font-bold leading-tight text-gray-900"
            >
              {plot.title}
            </h2>
            <p className="mt-1 text-[13px] text-gray-600">{plot.caption}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full border border-gray-300 px-3 py-1.5 text-[12px] font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-glowdex-green/40"
          >
            <X size={12} aria-hidden="true" />
            Close
          </button>
        </div>

        <img
          src={src}
          alt={plot.alt}
          width={plot.width}
          height={plot.height}
          className="mx-auto h-auto w-full rounded-lg border border-[#eef0f2]"
          // Never upscale: cap at the image's own pixel width.
          style={{ maxWidth: `${plot.width}px` }}
        />

        <p className="border-t border-gray-100 pt-2 text-[12px] text-gray-500">
          {byline}
        </p>
      </div>
    </dialog>
  );
}
