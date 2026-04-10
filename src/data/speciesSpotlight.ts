import type { FeatureCollection } from 'geojson';

export type ConservationStatus = 'CR' | 'EN' | 'VU' | 'NT' | 'LC' | 'DD';

export interface SpeciesPopulationSegment {
  label: string;
  value: number;
  color: string;
}

export interface SpeciesDistribution {
  type: 'geojson';
  data: FeatureCollection;
  layerId: string;
  fillColor: string;
  strokeColor: string;
  fillOpacity: number;
}

export interface SpeciesSpotlightData {
  id: string;
  commonName: string;
  localName?: string;
  scientificName: string;
  conservationStatus: ConservationStatus;
  iucnUrl: string;
  populationEstimate: {
    min: number;
    max: number;
    year: number;
    trend: 'increasing' | 'decreasing' | 'stable' | 'unknown';
  };
  summaryText: string;
  populationSegments: SpeciesPopulationSegment[];
  distribution: SpeciesDistribution;
  dataApplicability: string;
  dataSource: string;
  learnMoreUrl: string;
  mapTipText: string;
  stub?: boolean;
}

const katalaData: SpeciesSpotlightData = {
  id: 'katala',
  commonName: 'Philippine Cockatoo',
  localName: 'Katala',
  scientificName: 'Cacatua haematuropygia',
  conservationStatus: 'CR',
  iucnUrl: 'https://www.iucnredlist.org/species/22684795/117578604',
  populationEstimate: { min: 430, max: 750, year: 2023, trend: 'decreasing' },
  summaryText:
    'The Katala is Critically Endangered. Only **430–750** mature individuals remain in the wild, mostly in **Palawan** and the Sulu Archipelago. Mangrove destruction is among the leading drivers of its decline.',
  populationSegments: [
    { label: 'Rasa Island (core)', value: 300, color: '#00827F' },
    { label: 'Other Palawan sites', value: 200, color: '#4CAF82' },
    { label: 'Sulu Archipelago', value: 100, color: '#8BC4A0' },
    { label: 'Other sites', value: 150, color: '#D9E8E3' },
  ],
  distribution: {
    type: 'geojson',
    layerId: 'species-katala-range',
    fillColor: '#00827F',
    strokeColor: '#00827F',
    fillOpacity: 0.2,
    data: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Palawan (primary range)' },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [117.15, 8.35],
                [117.95, 9.15],
                [118.65, 10.45],
                [119.25, 11.35],
                [119.95, 11.2],
                [119.5, 10.05],
                [118.8, 9.2],
                [118.2, 8.55],
                [117.5, 7.85],
                [117.15, 8.35],
              ],
            ],
          },
        },
        {
          type: 'Feature',
          properties: { name: 'Sulu Archipelago (remnant)' },
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [119.9, 5.85],
                [120.7, 5.95],
                [121.5, 6.1],
                [121.55, 5.8],
                [120.75, 5.6],
                [119.9, 5.6],
                [119.9, 5.85],
              ],
            ],
          },
        },
      ],
    },
  },
  dataApplicability: 'National',
  dataSource: 'IUCN Red List, Katala Foundation',
  learnMoreUrl: 'https://katalafoundation.org/',
  mapTipText: 'Show Katala distribution range',
};

const fiddlerCrabData: SpeciesSpotlightData = {
  id: 'fiddler-crab',
  commonName: 'Fiddler Crab',
  scientificName: 'Uca spp.',
  conservationStatus: 'VU',
  iucnUrl: 'https://www.iucnredlist.org',
  populationEstimate: { min: 0, max: 0, year: 0, trend: 'unknown' },
  summaryText: '',
  populationSegments: [],
  distribution: {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
    layerId: 'species-fiddler-crab-range',
    fillColor: '#00827F',
    strokeColor: '#00827F',
    fillOpacity: 0.2,
  },
  dataApplicability: '',
  dataSource: '',
  learnMoreUrl: '',
  mapTipText: '',
  stub: true,
};

const proboscisMonkeyData: SpeciesSpotlightData = {
  id: 'proboscis-monkey',
  commonName: 'Proboscis Monkey',
  scientificName: 'Nasalis larvatus',
  conservationStatus: 'EN',
  iucnUrl: 'https://www.iucnredlist.org',
  populationEstimate: { min: 0, max: 0, year: 0, trend: 'unknown' },
  summaryText: '',
  populationSegments: [],
  distribution: {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
    layerId: 'species-proboscis-monkey-range',
    fillColor: '#00827F',
    strokeColor: '#00827F',
    fillOpacity: 0.2,
  },
  dataApplicability: '',
  dataSource: '',
  learnMoreUrl: '',
  mapTipText: '',
  stub: true,
};

export const SPECIES_SPOTLIGHT_DATA: SpeciesSpotlightData[] = [
  katalaData,
  fiddlerCrabData,
  proboscisMonkeyData,
];
