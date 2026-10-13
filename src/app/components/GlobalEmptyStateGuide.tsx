/**
 * GlobalEmptyStateGuide
 *
 * Global-mode Analysis tab empty state. Replaces SelectTilePrompt in SidePanel
 * when no cell is selected. A looping demo shows a pointer clicking a tile, the
 * map tooltip appearing, then the selected-tile card sliding in, with a
 * two-step list that highlights in time with the loop.
 *
 * After the user's first real tile selection (see tileGuideSeen.ts) the
 * animation is replaced by static steps and a "Replay guide" button.
 * Reduced-motion users always see the final frame.
 *
 * Design: 07 Empty State Guide, option 1a (2 steps).
 */
import { useEffect, useState } from 'react';
import MapTooltip from '@/features/map/components/MapTooltip';
import type { RichGridCell } from '@/data/types/grid.types';
import { usePrefersReducedMotion } from '@/features/landing/hooks/usePrefersReducedMotion';
import { hasSeenTileGuide } from './tileGuideSeen';

type Phase = 'idle' | 'move' | 'click' | 'tip' | 'card' | 'fade';

/** Start time (ms) of each phase within one loop. */
const TIMELINE: ReadonlyArray<readonly [number, Phase]> = [
  [0, 'idle'],
  [800, 'move'],
  [2000, 'click'],
  [2400, 'tip'],
  [3600, 'card'],
  [6400, 'fade'],
];
const LOOP_MS = 7200;
const TICK_MS = 100;
const FINAL_PHASE: Phase = 'card';

function phaseAt(ms: number): Phase {
  let phase: Phase = 'idle';
  for (const [start, p] of TIMELINE) if (ms >= start) phase = p;
  return phase;
}

/** Current loop phase while enabled; the final frame when not. */
function useLoopPhase(enabled: boolean): Phase {
  const [phase, setPhase] = useState<Phase>('idle');
  useEffect(() => {
    if (!enabled) return;
    const start = Date.now();
    const id = window.setInterval(() => {
      setPhase(phaseAt((Date.now() - start) % LOOP_MS));
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [enabled]);
  return enabled ? phase : FINAL_PHASE;
}

const STEPS = [
  'Click a tile anywhere on the map',
  'See its typology, from satellite-derived estimates',
] as const;

/** Illustrative demo data only. Not read from the dataset. */
const DEMO_CELL = {
  id: 21812,
  country: 'South Africa',
  cluster5: 1,
  cluster18: 3,
} as unknown as RichGridCell;
/** Background tiles: left %, top %, demo colour. */
const DEMO_TILES: ReadonlyArray<readonly [number, number, string]> = [
  [67, 6, '#14b8a6'],
  [48, 22, '#6366f1'],
  [50, 74, '#14b8a6'],
  [34, 70, '#6366f1'],
  [28, 12, '#8b5cf6'],
];

/** Target tile sits at left/top 60%/46%, 10% wide; the pointer tip lands at its centre. */
const POINTER_ON = { x: 65, y: 55 };
const POINTER_OFF = { x: 88, y: 90 };
const EASE = 'cubic-bezier(.45,0,.25,1)';

function HandPointer() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      className="block drop-shadow-[0_1px_2px_rgba(0,0,0,.35)]"
    >
      <path
        d="M9 2.5c-1.1 0-2 .9-2 2v8.2l-1.3-1.3c-.8-.8-2-.8-2.8 0-.7.7-.8 1.9-.1 2.7l4.6 5.6c.9 1.1 2.3 1.8 3.8 1.8h3.3c2.7 0 4.9-2.2 4.9-4.9v-5.1c0-1-.8-1.9-1.9-1.9-.4 0-.8.1-1.1.4-.2-.9-1-1.5-1.9-1.5-.5 0-.9.2-1.3.5-.3-.7-1-1.2-1.8-1.2-.4 0-.7.1-1 .3V4.5c0-1.1-.9-2-2-2z"
        fill="#fff"
        stroke="#111827"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DemoStage({ phase, animated }: { phase: Phase; animated: boolean }) {
  const onTile = phase !== 'idle' && phase !== 'fade';
  const selected = phase === 'click' || phase === 'tip' || phase === 'card';
  const showTip = phase === 'tip' || phase === 'card';
  const showCard = phase === 'card';
  const pointer = onTile ? POINTER_ON : POINTER_OFF;

  // MapTooltip positions from px; measure the stage once it renders.
  const [size, setSize] = useState({ w: 0, h: 0 });
  const measure = (el: HTMLDivElement | null) => {
    if (el && (el.clientWidth !== size.w || el.clientHeight !== size.h)) {
      setSize({ w: el.clientWidth, h: el.clientHeight });
    }
  };

  return (
    <div
      ref={measure}
      aria-hidden="true"
      className="relative w-full h-[210px] md:h-[300px] rounded-xl overflow-hidden border border-gray-200 bg-[#eef1ef]"
    >
      <style>{`
        @keyframes tile-guide-ripple {
          0%   { opacity: .9; transform: scale(.3); }
          100% { opacity: 0;  transform: scale(1.7); }
        }
      `}</style>

      {/* Water */}
      <div className="absolute inset-0 bg-[#cdd7d6] [clip-path:polygon(72%_0,100%_0,100%_100%,52%_100%,58%_78%,64%_58%,68%_36%,70%_16%)]" />

      {DEMO_TILES.map(([x, y, c]) => (
        <span
          key={`${x}-${y}`}
          className="absolute w-[10%] aspect-square rounded-[2px] border-[1.5px]"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            background: `${c}55`,
            borderColor: c,
          }}
        />
      ))}

      {/* Target tile (Typology 1 demo colour) */}
      <span
        className={`absolute left-[60%] top-[46%] w-[10%] aspect-square rounded-[2px] border-[1.5px] border-[#8b5cf6] bg-[#8b5cf666] transition-shadow duration-200 ${
          selected ? 'shadow-[0_0_0_2px_#111827]' : 'shadow-none'
        }`}
      />

      {/* Click ripple */}
      {animated && phase === 'click' && (
        <span
          className="absolute z-[5] -ml-[22px] -mt-[22px] h-11 w-11 rounded-full border-2 border-[#0a5c47] pointer-events-none animate-[tile-guide-ripple_.6s_ease-out_forwards]"
          style={{ left: `${POINTER_ON.x}%`, top: `${POINTER_ON.y}%` }}
        />
      )}

      {/* Real map tooltip */}
      <div
        className={`absolute inset-0 z-[4] pointer-events-none transition-opacity duration-300 ${
          showTip ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {size.w > 0 && (
          <MapTooltip
            x={Math.round(size.w * 0.65)}
            y={Math.round(size.h * 0.46)}
            cell={DEMO_CELL}
            typologyScale="scale5"
          />
        )}
      </div>

      {/* Selected-tile card */}
      <div
        className={`absolute left-3 bottom-3 z-[3] w-[220px] md:w-[260px] rounded-[10px] border border-[#eceae4] bg-white px-3 py-2.5 shadow-[0_4px_14px_rgba(0,0,0,.1)] transition-[opacity,transform] duration-400 ${
          showCard ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2.5'
        }`}
      >
        <p className="text-[9px] font-bold uppercase tracking-[.05em] text-[#9a978f] mb-1">
          Selected tile
        </p>
        <p className="text-[13px] font-bold text-gray-900 mb-1.5">
          Bayhead, South Africa
        </p>
        <div className="flex gap-1.5">
          <span className="rounded-md bg-[#f3f2ee] px-[7px] py-0.5 font-mono text-[11px] text-gray-700">
            Tile 21812
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-[#f3f2ee] px-[7px] py-0.5 text-[11px] text-gray-700">
            <span className="inline-block w-[7px] h-[7px] rounded-full bg-[#8b5cf6]" />
            Typology 1
          </span>
        </div>
      </div>

      {/* Pointer (fingertip at left/top). Position, press and fade change
          per phase, each with its own transition timing. */}
      {animated && (
        <div
          className="absolute z-[6] -ml-[10px] -mt-[3px] h-[26px] w-[26px] origin-[10px_3px] pointer-events-none"
          style={{
            left: `${pointer.x}%`,
            top: `${pointer.y}%`,
            opacity: phase === 'fade' ? 0 : 1,
            transform: `scale(${phase === 'click' ? 0.84 : 1})`,
            transition: `left 1.1s ${EASE}, top 1.1s ${EASE}, opacity .35s, transform .15s`,
          }}
        >
          <HandPointer />
        </div>
      )}
    </div>
  );
}

function StepNumber({ n, active }: { n: number; active: boolean }) {
  return (
    <span
      className={`w-[26px] h-[26px] shrink-0 rounded-full flex items-center justify-center text-[12.5px] font-bold border-[1.5px] transition-all duration-300 ${
        active
          ? 'bg-[#0a5c47] border-[#0a5c47] text-white'
          : 'bg-white border-gray-300 text-gray-500'
      }`}
    >
      {n}
    </span>
  );
}

export function GlobalEmptyStateGuide() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [seen] = useState(hasSeenTileGuide);
  const [replaying, setReplaying] = useState(false);

  const showDemo = !seen || replaying;
  const animated = showDemo && !prefersReducedMotion;
  const phase = useLoopPhase(animated);
  const activeStep = phase === 'card' ? 1 : 0;

  return (
    <div className="flex flex-col gap-4" data-testid="global-empty-state-guide">
      <div className="flex flex-col gap-1">
        <p className="text-base font-bold text-gray-800">
          Select a colored tile on the map to get started
        </p>
        <p className="text-[13px] text-gray-500">
          Use the search box to navigate to a specific location
        </p>
      </div>

      {showDemo ? (
        <>
          <DemoStage phase={phase} animated={animated} />
          <ol className="flex flex-col gap-1.5">
            {STEPS.map((text, i) => {
              const active = i === activeStep;
              return (
                <li
                  key={text}
                  aria-current={animated && active ? 'step' : undefined}
                  className={`flex items-center gap-3 rounded-[10px] px-3.5 py-3 transition-colors duration-300 ${
                    active ? 'bg-[#e9f0ed]' : 'bg-transparent'
                  }`}
                >
                  <StepNumber n={i + 1} active={active} />
                  <span
                    className={`text-[14.5px] leading-snug transition-colors duration-300 ${
                      active
                        ? 'font-semibold text-gray-900'
                        : 'font-medium text-gray-600'
                    }`}
                  >
                    {text}
                  </span>
                </li>
              );
            })}
          </ol>
        </>
      ) : (
        <div className="rounded-xl border border-gray-200 p-4 flex flex-col gap-2.5">
          <ol className="flex flex-col gap-2.5">
            {STEPS.map((text, i) => (
              <li key={text} className="flex items-center gap-3">
                <span className="w-6 h-6 shrink-0 rounded-full border-[1.5px] border-gray-300 text-gray-500 flex items-center justify-center text-xs font-semibold">
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {text}
                </span>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={() => setReplaying(true)}
            className="self-start inline-flex items-center gap-1.5 pt-1.5 text-[12.5px] font-semibold text-[#0f6e56] hover:text-[#085041] transition-colors cursor-pointer"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Replay guide
          </button>
        </div>
      )}
    </div>
  );
}
