import { DownloadSummaryButton } from 'glowdex';

const cell = {
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

// Right-aligned by design (sits at the end of the selected-tile header).
export const Default = () => (
  <div style={{ width: 320 }}>
    <DownloadSummaryButton
      selectedCell={cell}
      scale="scale5"
      statisticalSummaries={[]}
      species={[]}
      partners={[]}
      localSiteContext={null}
    />
  </div>
);
