import { DownloadSummaryButton } from 'glowdex';
import { CELL } from './_fixtures';

// Right-aligned by design (sits at the end of the selected-tile header).
export const Default = () => (
  <div style={{ width: 320 }}>
    <DownloadSummaryButton
      selectedCell={CELL}
      scale="scale5"
      statisticalSummaries={[]}
      species={[]}
      partners={[]}
      localSiteContext={null}
    />
  </div>
);
