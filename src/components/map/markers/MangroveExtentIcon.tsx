interface MangroveExtentIconProps {
  size?: number;
}

export function MangroveExtentIcon({ size = 14 }: MangroveExtentIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Mangrove habitat extent"
    >
      <rect
        x={1}
        y={1}
        width={size - 2}
        height={size - 2}
        rx={2}
        fill="#1d9e75"
        fillOpacity={0.6}
        stroke="#1d9e75"
        strokeWidth={1}
      />
    </svg>
  );
}
