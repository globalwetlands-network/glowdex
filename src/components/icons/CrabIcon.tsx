interface CrabIconProps {
  size?: number;
  className?: string;
}

/**
 * Fiddler Crab icon — geometric outline style matching the Lucide icon system.
 *
 * The oversized left claw is the defining feature of the Fiddler Crab and
 * makes the asymmetry immediately readable even at 14px. Body is a hexagon
 * (top-down view) with three walking legs per side and bilateral claw arms.
 *
 * viewBox: 0 0 24 24 · strokeWidth: 1.5 · fill: none
 */
export function CrabIcon({ size = 20, className }: CrabIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M8 12 L16 12 L17 15 L16 17 L8 17 L7 15 Z M8 12 L2 6 M2 6 L0.5 4 M2 6 L1 8.5 M16 12 L21 9 M21 9 L22.5 7.5 M21 9 L22.5 10.5 M8 13.5 L4 16 M7.5 15.5 L3.5 18.5 M8 17 L5 21 M16 13.5 L20 16 M16.5 15.5 L20.5 18.5 M16 17 L19 21" />
    </svg>
  );
}
