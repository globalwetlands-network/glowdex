// Shared preview fixtures, shaped like the app's runtime data.
// Typology colours come from the dataset (`hex_5` / `hex_18` columns), not from code; these are
// the current values recorded in docs/design/claude-design-context.md §1.2. Names and fills
// follow deriveTypologies.ts (`Typology N`, fill = colour at 30% opacity). Re-check after a
// model rerun changes the palette.

const HEX_5 = ['#cd2626', '#eead0e', '#43cd80', '#6ca6cd', '#b452cd'];
const HEX_18 = [
  '#FF3030',
  '#CD2626',
  '#EE7600',
  '#EEC900',
  '#EEAD0E',
  '#EEDC82',
  '#98FB98',
  '#43CD80',
  '#AEEEEE',
  '#6CA6CD',
  '#4876FF',
  '#6959CD',
  '#EEAEEE',
  '#9F79EE',
  '#B452CD',
  '#FF3E96',
  '#EE799F',
  '#FF6A6A',
];

const FILL_OPACITY = 0.3;

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function toScale(hexes: string[]) {
  return Object.fromEntries(
    hexes.map((color, i) => {
      const id = i + 1;
      return [
        id,
        {
          id,
          name: `Typology ${id}`,
          clusterNumber: id,
          color,
          fillColor: hexToRgba(color, FILL_OPACITY),
        },
      ];
    }),
  );
}

export const TYPOLOGIES = { scale5: toScale(HEX_5), scale18: toScale(HEX_18) };

export const CELL = {
  id: 1234,
  country: 'Australia',
  iso3: 'AUS',
  lat: -12.46,
  lng: 130.84,
  cluster5: 5,
  cluster18: 12,
  residuals: {},
  mangroves: true,
  saltmarsh: false,
  seagrass: true,
  centerCoords: { latitude: -12.46, longitude: 130.84 },
};
