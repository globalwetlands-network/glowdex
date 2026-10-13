import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { usePostHog } from 'posthog-js/react';
import type { SiteDestinationId } from '@/constants/comingSoon';
import type { EntryMode } from '@/app/hooks/useEntryMode';

/** Where on the site the control sits, for analytics. */
export type ComingSoonLocation =
  | 'header'
  | 'footer'
  | 'how-it-works'
  | 'partners'
  | 'menu';

/** How long a tap keeps the tooltip open on touch devices (no hover there). */
export const TOUCH_TOOLTIP_MS = 2000;

export interface ComingSoonLinkProps {
  targetId: SiteDestinationId;
  location: ComingSoonLocation;
  /** Map workflow, or null outside the map (the landing page has no mode). */
  mode?: EntryMode | null;
  /** The classes of the link this stands in for, so it looks the same. */
  className?: string;
  /** Classes for the positioning wrapper (e.g. `self-start` in a flex column). */
  wrapperClassName?: string;
  /** Tooltip side; `bottom` where there's no room above (the fixed header). */
  placement?: 'top' | 'bottom';
  children: ReactNode;
}

/**
 * Stand-in for a link whose page doesn't exist yet (GLO-210). A button, not
 * an `<a href="#">`, so a click never changes the URL or jumps the page. It
 * keeps the original link's styling plus a dotted underline, and explains
 * itself with a "Coming soon" tooltip on hover, keyboard focus or a tap.
 */
export function ComingSoonLink({
  targetId,
  location,
  mode = null,
  className = '',
  wrapperClassName = '',
  placement = 'top',
  children,
}: ComingSoonLinkProps) {
  const posthog = usePostHog();
  const tooltipId = useId();
  // Each source is tracked on its own, so e.g. moving the mouse away doesn't
  // hide the tooltip while the button still has keyboard focus.
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [tapped, setTapped] = useState(false);
  // Esc hides it whatever opened it, until the next hover, focus or tap.
  const [dismissed, setDismissed] = useState(false);
  const open = !dismissed && (hovered || focused || tapped);
  const tapTimer = useRef<number | undefined>(undefined);
  // Set for the moment between a pointer press and the focus it causes, so
  // only keyboard focus pins the tooltip open (some browsers focus a button
  // on click or tap).
  const pointerPressed = useRef(false);

  useEffect(() => () => window.clearTimeout(tapTimer.current), []);

  // Listen on the document so Esc also closes a hover-opened tooltip.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setDismissed(true);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <span className={`relative inline-block ${wrapperClassName}`}>
      <button
        type="button"
        aria-disabled="true"
        aria-describedby={tooltipId}
        className={`cursor-help underline decoration-dotted underline-offset-4 ${className}`}
        onPointerEnter={(e) => {
          // Mouse and hovering pens; touch has no hover.
          if (e.pointerType === 'touch') return;
          setHovered(true);
          setDismissed(false);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType !== 'touch') setHovered(false);
        }}
        onPointerDown={(e) => {
          pointerPressed.current = true;
          window.setTimeout(() => {
            pointerPressed.current = false;
          }, 0);
          // Touch and pen taps show the tooltip briefly.
          if (e.pointerType === 'mouse') return;
          setTapped(true);
          setDismissed(false);
          window.clearTimeout(tapTimer.current);
          tapTimer.current = window.setTimeout(
            () => setTapped(false),
            TOUCH_TOOLTIP_MS,
          );
        }}
        onFocus={() => {
          if (pointerPressed.current) return;
          setFocused(true);
          setDismissed(false);
        }}
        onBlur={() => setFocused(false)}
        onClick={() => {
          try {
            posthog?.capture('coming_soon_clicked', {
              target_id: targetId,
              location,
              mode,
            });
          } catch (error) {
            console.error(
              'Failed to capture coming_soon_clicked event:',
              error,
            );
          }
        }}
      >
        {children}
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 ${
          placement === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
        } rounded bg-gray-900 px-2 py-1 text-xs font-normal whitespace-nowrap text-white no-underline ${
          open ? 'block' : 'hidden'
        }`}
      >
        Coming soon
      </span>
    </span>
  );
}
