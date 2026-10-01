import {
  Component,
  Suspense,
  lazy,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { ClosingCta } from './ClosingCta';
import { FactSheet } from './FactSheet';
import { Faqs } from './Faqs';
import { Hero } from './Hero';
import { HowItWorks } from './HowItWorks';
import { Partners } from './Partners';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';
import { WhoItsFor } from './WhoItsFor';
import { WhyItMatters } from './WhyItMatters';

// Lazy: the worked example reuses the app's widgets (plotly, react-markdown,
// …), which must not weigh down the hero's first paint.
const SeeItInAction = lazy(() =>
  import('./SeeItInAction/SeeItInAction').then((m) => ({
    default: m.SeeItInAction,
  })),
);

/**
 * Reserves the section's space until its chunk has loaded, sized to the
 * measured section (carousel plus assistant explainer) so the sections below
 * don't jump when it mounts. White, like the section it stands in for.
 */
function SectionPlaceholder() {
  return (
    <div
      aria-hidden="true"
      className="min-h-[2300px] bg-white lg:min-h-[1760px]"
    />
  );
}

interface SectionErrorBoundaryProps {
  children: ReactNode;
}

interface SectionErrorBoundaryState {
  hasError: boolean;
}

/**
 * Contains a failure in an optional below-the-fold section (e.g. its lazy
 * chunk failing to load after a redeploy) so it can't take the hero — and the
 * way into the map — down with it. The section is simply omitted.
 */
class SectionErrorBoundary extends Component<
  SectionErrorBoundaryProps,
  SectionErrorBoundaryState
> {
  state: SectionErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): SectionErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Landing page section failed to load:', error);
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

/** Mounts `children` once the placeholder scrolls within ~one viewport. */
function WhenNearViewport({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isNear, setIsNear] = useState(
    () => typeof IntersectionObserver === 'undefined',
  );

  useEffect(() => {
    if (isNear || !ref.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setIsNear(true);
      },
      { rootMargin: '100% 0px' },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isNear]);

  return isNear ? (
    children
  ) : (
    <div ref={ref}>
      <SectionPlaceholder />
    </div>
  );
}

/** Height of the fixed `SiteHeader` (its `h-[72px]`), in px. */
const HEADER_HEIGHT = 72;

/**
 * True while any of the element is still under the fixed header, i.e. the
 * header is over the hero and should stay transparent. Seeded from the
 * element's position before first paint (so a restored scroll position or a
 * deep link below the hero starts solid), then kept current by an
 * IntersectionObserver, or by scroll/resize listeners where that's missing.
 */
function useIsUnderHeader(ref: RefObject<HTMLElement | null>) {
  const [isUnder, setIsUnder] = useState(true);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () =>
      setIsUnder(el.getBoundingClientRect().bottom > HEADER_HEIGHT);
    measure();

    if (typeof IntersectionObserver === 'undefined') {
      window.addEventListener('scroll', measure, { passive: true });
      window.addEventListener('resize', measure);
      return () => {
        window.removeEventListener('scroll', measure);
        window.removeEventListener('resize', measure);
      };
    }

    const observer = new IntersectionObserver(
      // The latest entry wins when several arrive in one batch (fast scrolls).
      (entries) => setIsUnder(entries[entries.length - 1].isIntersecting),
      // Shrink the viewport's top by the header height: the element stops
      // "intersecting" once its bottom edge scrolls up past the header.
      { rootMargin: `-${HEADER_HEIGHT}px 0px 0px 0px` },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return isUnder;
}

/**
 * Scopes the landing page's scroll behaviour to the document while it's
 * mounted (see `.landing-page` in globals.css), so it doesn't leak into /map.
 */
function useLandingScrollBehaviour() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('landing-page');
    return () => root.classList.remove('landing-page');
  }, []);
}

/**
 * Public landing page at `/`: the shared header (transparent over the hero,
 * solid below it), then the hero, the fact sheet, the worked example, who it's
 * for, how it works, why it matters, partners, FAQs, the closing call to
 * action, and the footer.
 */
export function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const overHero = useIsUnderHeader(heroRef);
  useLandingScrollBehaviour();

  return (
    <>
      <SiteHeader transparent={overHero} />
      <main>
        <div ref={heroRef}>
          <Hero />
        </div>
        <FactSheet />
        <SectionErrorBoundary>
          <WhenNearViewport>
            <Suspense fallback={<SectionPlaceholder />}>
              <SeeItInAction />
            </Suspense>
          </WhenNearViewport>
        </SectionErrorBoundary>
        <WhoItsFor />
        <HowItWorks />
        <WhyItMatters />
        <Partners />
        <Faqs />
        <ClosingCta />
      </main>
      <SiteFooter />
    </>
  );
}
