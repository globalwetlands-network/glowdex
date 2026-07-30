interface PartnerMarkerIconProps {
  isNearest?: boolean;
  size?: number;
}

export function PartnerMarkerIcon({
  isNearest = false,
  size = 20,
}: PartnerMarkerIconProps) {
  const outerRadius = size / 2;
  const innerRadius = isNearest ? outerRadius * 0.42 : outerRadius * 0.38;
  const strokeWidth = isNearest ? 3 : 2;
  const strokeColor = isNearest ? '#0a5c47' : '#1d9e75';

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Partner organisation location"
    >
      {/* Outer white circle with teal stroke */}
      <circle
        cx={outerRadius}
        cy={outerRadius}
        r={outerRadius - strokeWidth / 2}
        fill="white"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      {/* Inner blue dot */}
      <circle
        cx={outerRadius}
        cy={outerRadius}
        r={innerRadius}
        fill="#3b82f6"
      />
    </svg>
  );
}
