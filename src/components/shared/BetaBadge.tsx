/**
 * The "Beta" pill marking the AI assistant as still in beta. One component
 * so the landing page's assistant explainer and the assistant itself always
 * show the same badge.
 */
export function BetaBadge() {
  return (
    <span className="rounded-full border border-glowdex-teal/40 bg-glowdex-teal/10 px-2.5 py-0.5 text-xs font-bold tracking-wide text-glowdex-green uppercase">
      Beta
    </span>
  );
}
