import { type ReactNode } from 'react';
import type { Geometry } from 'geojson';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

/** Zoom that fits a whole 1° grid tile with some surrounding context. */
const ZOOM = 6.3;

interface ExampleMapBackdropProps {
  latitude: number;
  longitude: number;
  /** The example grid tile, drawn in its typology colour and outlined as selected. */
  tile?: { geometry: Geometry; color: string };
  /** Tooltip rendered at the map centre (the example place). */
  children: ReactNode;
}

/** Mapbox Static Images overlay for the tile, styled like the map's selection. */
function tileOverlay(tile: NonNullable<ExampleMapBackdropProps['tile']>) {
  const feature = {
    type: 'Feature',
    properties: {
      fill: tile.color,
      'fill-opacity': 0.35,
      stroke: '#000000',
      'stroke-width': 2,
    },
    geometry: tile.geometry,
  };
  return `geojson(${encodeURIComponent(JSON.stringify(feature))})/`;
}

/**
 * Static map image centred on the example place — same light style as the
 * app's map — with the example tile overlaid and the given tooltip anchored at
 * the centre. Uses the Mapbox Static Images API with the app's public token;
 * without a token it falls back to a plain panel.
 */
export function ExampleMapBackdrop({
  latitude,
  longitude,
  tile,
  children,
}: ExampleMapBackdropProps) {
  const src = MAPBOX_TOKEN
    ? `https://api.mapbox.com/styles/v1/mapbox/light-v10/static/${
        tile ? tileOverlay(tile) : ''
      }${longitude},${latitude},${ZOOM},0/960x540@2x?access_token=${MAPBOX_TOKEN}`
    : null;

  return (
    // Fills the carousel stage, so map steps share the panel steps' frame.
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-[#e8ece9]">
      {src && (
        <img
          src={src}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {/* Marker at the image centre, i.e. exactly on the example place (the
          static image is centred on it); the tooltip is anchored above it.
          nowrap: a zero-width anchor would otherwise squeeze the tooltip. */}
      <div className="absolute top-1/2 left-1/2 whitespace-nowrap">
        <span className="absolute -top-2 -left-2 h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow" />
        {children}
      </div>
    </div>
  );
}
