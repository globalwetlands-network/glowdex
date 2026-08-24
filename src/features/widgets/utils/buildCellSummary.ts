import type { EnrichedGridCell } from '@/app/types/app.types';
import type {
  AIStatisticalIndicatorSummary,
  LocalSiteContext,
} from '@/api/types';
import type { SpeciesConfigResponse } from '@/api/species';
import { TYPOLOGY_5_INFO } from '@/data/constants/typology.constants';
import { CONSERVATION_STATUS_INFO } from '@/data/speciesSpotlight';
import { formatCoordinate } from '@/utils/coordinates';
import { getInterpretation, indicatorLabel } from './indicatorStats';

export interface CellSummaryLocation {
  country: string;
  iso3: string;
  tileId: number;
  coordinates: string;
  latitude: number | null;
  longitude: number | null;
}

export interface CellSummaryTypology {
  number: number;
  name: string | null;
  description: string | null;
  scale: 'scale5' | 'scale18';
}

export interface CellSummaryIndicator {
  label: string;
  /** Human, typology-relative reading of the percentile (e.g. "above typical range"). */
  interpretation: string;
  value: number;
  percentile: number;
  median: number;
  q1: number;
  q3: number;
}

export interface CellSummarySpecies {
  commonName: string;
  scientificName: string;
  conservationStatus: string;
}

export interface CellSummaryLocalCondition {
  siteType: string;
  totalDensity: number;
  combinedSE: number;
  samplesN: number;
}

export interface CellSummaryLocalMonitoring {
  siteName: string;
  country: string;
  partner: string;
  year: number;
  conditions: CellSummaryLocalCondition[];
}

export interface CellSummary {
  /** ISO date (YYYY-MM-DD) the summary was generated. */
  generatedDate: string;
  hasMangrove: boolean;
  location: CellSummaryLocation;
  typology: CellSummaryTypology;
  indicators: CellSummaryIndicator[];
  species: CellSummarySpecies[];
  localMonitoring: CellSummaryLocalMonitoring | null;
  /** Prose explaining that indicator values are typology-relative, not global. */
  caveat: string;
  /** Source attribution + generation date. */
  citation: string;
}

export interface BuildCellSummaryInput {
  cell: EnrichedGridCell;
  scale: 'scale5' | 'scale18';
  statisticalSummaries?: AIStatisticalIndicatorSummary[];
  species: SpeciesConfigResponse[];
  localSiteContext: LocalSiteContext | null;
  /** ISO date string; injected so the builder stays pure/testable. */
  generatedDate: string;
}

const TYPOLOGY_SOURCE =
  'Sievers et al. (2021), Ecological Indicators 131:108141, ' +
  'https://doi.org/10.1016/j.ecolind.2021.108141';

/**
 * Assembles a structured, export-ready summary of a selected grid cell
 * from the data already present in the app. Pure and deterministic — the
 * generation date is passed in rather than read from the clock — so it can
 * be unit-tested and rendered to any output format (see
 * generateCellSummaryPdf).
 *
 * Gracefully handles cells with no species and no local monitoring data:
 * those sections come back as an empty array / null respectively.
 */
export function buildCellSummary({
  cell,
  scale,
  statisticalSummaries,
  species,
  localSiteContext,
  generatedDate,
}: BuildCellSummaryInput): CellSummary {
  const clusterId = (scale === 'scale5' ? cell.cluster5 : cell.cluster18) ?? 0;

  const typologyInfo = scale === 'scale5' ? TYPOLOGY_5_INFO[clusterId] : null;
  const typology: CellSummaryTypology = {
    number: clusterId,
    name: typologyInfo?.name ?? null,
    description: typologyInfo?.description ?? null,
    scale,
  };

  const coords = cell.centerCoords ?? {
    latitude: cell.lat ?? 0,
    longitude: cell.lng ?? 0,
  };
  const hasCoords = !!cell.centerCoords || cell.lat != null || cell.lng != null;

  const location: CellSummaryLocation = {
    country: cell.country || 'Unknown',
    iso3: cell.iso3 || '',
    tileId: cell.id,
    coordinates: hasCoords ? formatCoordinate(coords) : 'Not available',
    latitude: hasCoords ? coords.latitude : null,
    longitude: hasCoords ? coords.longitude : null,
  };

  const indicators: CellSummaryIndicator[] = (statisticalSummaries ?? []).map(
    (s) => ({
      label: indicatorLabel(s.key, s.indicator),
      interpretation: getInterpretation(s.key, s.percentile, s.cellValue),
      value: s.cellValue,
      percentile: s.percentile,
      median: s.median,
      q1: s.q1,
      q3: s.q3,
    }),
  );

  const summarySpecies: CellSummarySpecies[] = species.map((s) => ({
    commonName: s.commonName,
    scientificName: s.scientificName,
    conservationStatus:
      CONSERVATION_STATUS_INFO[s.conservationStatus]?.label ??
      s.conservationStatus,
  }));

  const localMonitoring: CellSummaryLocalMonitoring | null = localSiteContext
    ? {
        siteName: localSiteContext.siteName,
        country: localSiteContext.country,
        partner: localSiteContext.partner,
        year: localSiteContext.year,
        conditions: localSiteContext.conditions.map((c) => ({
          siteType: c.siteType,
          totalDensity: c.totalDensity,
          combinedSE: c.combinedSE,
          samplesN: c.samplesN,
        })),
      }
    : null;

  const caveat =
    `Indicator values and percentiles are relative to this location's ` +
    `typology (Typology ${clusterId}), not global absolutes. A percentile ` +
    `of 90, for example, means the value is higher than 90% of coastal ` +
    `wetland cells within the same typology group. These numbers will be ` +
    `misread if taken out of their typology context.`;

  const citation =
    `MBCAM — Mangrove Biodiversity & Condition Action Map (GLOWdex). ` +
    `Typology classification from ${TYPOLOGY_SOURCE}. ` +
    `Summary generated ${generatedDate}.`;

  return {
    generatedDate,
    hasMangrove: cell.mangroves,
    location,
    typology,
    indicators,
    species: summarySpecies,
    localMonitoring,
    caveat,
    citation,
  };
}
