import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';

import type { EnrichedGridCell } from '@/app/types/app.types';
import type {
  AIStatisticalIndicatorSummary,
  LocalSiteContext,
} from '@/api/types';
import type { SpeciesConfigResponse } from '@/api/species';
import type { PartnerResponse } from '@/api/partners';

import { buildCellSummary } from '../utils/buildCellSummary';
import { getRegionSpecies } from '../utils/getRegionSpecies';
import { generateCellSummaryPdf } from '../utils/generateCellSummaryPdf';

interface DownloadSummaryButtonProps {
  selectedCell: EnrichedGridCell;
  scale: 'scale5' | 'scale18';
  statisticalSummaries?: AIStatisticalIndicatorSummary[];
  species: SpeciesConfigResponse[];
  partners: PartnerResponse[];
  localSiteContext: LocalSiteContext | null;
}

/**
 * Downloads a PDF summary of the currently selected grid cell.
 * Assembles the data from what the app already holds, then renders a
 * PDF (jsPDF is lazy-loaded inside generateCellSummaryPdf). Available
 * from the selected-cell view for partners to reuse in reports,
 * teaching and presentations (GLO-172).
 */
export function DownloadSummaryButton({
  selectedCell,
  scale,
  statisticalSummaries,
  species,
  partners,
  localSiteContext,
}: DownloadSummaryButtonProps) {
  const posthog = usePostHog();
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleDownload = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setHasError(false);
    try {
      const regionSpecies = getRegionSpecies(
        selectedCell.centerCoords,
        species,
        partners,
      );
      const generatedDate = new Date().toISOString().slice(0, 10);
      const summary = buildCellSummary({
        cell: selectedCell,
        scale,
        statisticalSummaries,
        species: regionSpecies,
        localSiteContext,
        generatedDate,
      });
      await generateCellSummaryPdf(summary);
      try {
        posthog?.capture('cell_summary_downloaded', {
          cell_id: String(selectedCell.id),
          country: selectedCell.country ?? null,
          typology_scale: scale,
          indicator_count: summary.indicators.length,
          species_count: summary.species.length,
          has_local_data: summary.localMonitoring !== null,
        });
      } catch (error) {
        console.error(
          'Failed to capture cell_summary_downloaded event:',
          error,
        );
      }
    } catch (error) {
      console.error('Failed to generate cell summary PDF:', error);
      setHasError(true);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDownload}
        disabled={isGenerating}
        aria-label="Download a PDF summary of the selected tile"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-800 hover:bg-teal-100 hover:border-teal-300 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait"
      >
        {isGenerating ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
        {isGenerating ? 'Preparing…' : 'Download summary'}
      </button>
      {hasError && (
        <p role="alert" className="text-[11px] text-red-600">
          Couldn’t generate the summary. Please try again.
        </p>
      )}
    </div>
  );
}
