export type ConservationStatus = 'CR' | 'EN' | 'VU' | 'NT' | 'LC' | 'DD';

export interface SpeciesSpotlightData {
  id: string;
  commonName: string;
  localName?: string;
  scientificName: string;
  conservationStatus: ConservationStatus;
  iucnUrl: string;
  summaryText: string;
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
  summaryText:
    'The Katala is Critically Endangered. Only **430–750** mature individuals remain in the wild, mostly in **Palawan** and the Sulu Archipelago. Mangrove destruction is among the leading drivers of its decline.',
  dataApplicability: 'National',
  dataSource: 'IUCN Red List, Katala Foundation',
  learnMoreUrl: 'https://katalafoundation.org/',
  mapTipText: 'Show Katala observation locations',
};

const fiddlerCrabData: SpeciesSpotlightData = {
  id: 'fiddler-crab',
  commonName: 'Fiddler Crab',
  scientificName: 'Uca spp.',
  conservationStatus: 'VU',
  iucnUrl: 'https://www.iucnredlist.org',
  summaryText: '',
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
  summaryText: '',
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
