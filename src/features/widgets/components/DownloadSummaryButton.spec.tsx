import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  render,
  screen,
  waitFor,
  fireEvent,
  cleanup,
} from '@testing-library/react';
import { DownloadSummaryButton } from './DownloadSummaryButton';
import type { EnrichedGridCell } from '@/app/types/app.types';

const generateMock = vi.fn();

vi.mock('../utils/generateCellSummaryPdf', () => ({
  generateCellSummaryPdf: (...args: unknown[]) => generateMock(...args),
}));

function makeCell(): EnrichedGridCell {
  return {
    id: 4821,
    country: 'Indonesia',
    iso3: 'IDN',
    residuals: {},
    cluster5: 3,
    cluster18: 12,
    mangroves: true,
    saltmarsh: false,
    seagrass: false,
    centerCoords: { latitude: -2.15, longitude: 106.42 },
  } as EnrichedGridCell;
}

function renderButton() {
  return render(
    <DownloadSummaryButton
      selectedCell={makeCell()}
      scale="scale5"
      statisticalSummaries={[]}
      species={[]}
      partners={[]}
      localSiteContext={null}
    />,
  );
}

describe('DownloadSummaryButton', () => {
  beforeEach(() => {
    generateMock.mockReset();
    cleanup();
  });

  it('generates a PDF summary for the selected cell on click', async () => {
    generateMock.mockResolvedValueOnce(undefined);
    renderButton();

    fireEvent.click(screen.getByRole('button', { name: /download.*summary/i }));

    await waitFor(() => expect(generateMock).toHaveBeenCalledTimes(1));
    const summary = generateMock.mock.calls[0][0];
    expect(summary.location.tileId).toBe(4821);
    expect(summary.citation).toContain('Sievers et al. (2021)');
  });

  it('shows an error message when generation fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    generateMock.mockRejectedValueOnce(new Error('boom'));
    renderButton();

    fireEvent.click(screen.getByRole('button', { name: /download.*summary/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/try again/i);
    errorSpy.mockRestore();
  });
});
