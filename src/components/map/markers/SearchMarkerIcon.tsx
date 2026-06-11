interface SearchMarkerIconProps {
  size?: number;
}

export function SearchMarkerIcon({ size = 24 }: SearchMarkerIconProps) {
  return (
    <svg
      width={size}
      height={Math.round(size * 1.33)}
      viewBox="0 0 24 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
      aria-label="Search result location"
    >
      <path
        d="M12 0C5.373 0 0 5.373 0 12c0 7.333 12 20 12 20S24 19.333 24 12C24 5.373 18.627 0 12 0z"
        fill="#0a5c47"
      />
      <circle cx="12" cy="11" r="4.5" fill="white" opacity="0.9" />
    </svg>
  );
}
