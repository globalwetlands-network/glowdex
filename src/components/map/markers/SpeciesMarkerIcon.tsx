interface SpeciesMarkerIconProps {
  size?: number;
}

export function SpeciesMarkerIcon({ size = 14 }: SpeciesMarkerIconProps) {
  const r = size / 2;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Species observation"
    >
      <circle
        cx={r}
        cy={r}
        r={r - 1.5}
        fill="#00827F"
        fillOpacity={0.85}
        stroke="white"
        strokeWidth={1.5}
      />
    </svg>
  );
}
