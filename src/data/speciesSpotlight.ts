import katalaImg from '@/assets/species/katala.jpg';
import estuaryStringRayImg from '@/assets/species/estuary-stingray.jpg';
import fiddlerCrabImg from '@/assets/species/fiddler-crab-second.jpg';

/**
 * IUCN Red List Conservation Status codes.
 * https://www.iucnredlist.org/about/categories-and-criteria
 */
export type ConservationStatus =
  | 'EX'
  | 'EW'
  | 'CR'
  | 'EN'
  | 'VU'
  | 'NT'
  | 'LC'
  | 'DD'
  | 'NE';

/**
 * Styling and label information for each IUCN conservation status.
 * Colors follow the IUCN's visual convention (red → green scale).
 */
export interface ConservationStatusInfo {
  /** Full human-readable label (e.g., "Critically Endangered") */
  label: string;
  /** Tailwind text color class */
  textColor: string;
  /** Tailwind background + border classes for badges */
  badgeClasses: string;
}

/**
 * Conservation status metadata keyed by status code.
 * Single source of truth for all status-related styling and labels.
 */
export const CONSERVATION_STATUS_INFO: Record<
  ConservationStatus,
  ConservationStatusInfo
> = {
  CR: {
    label: 'Critically Endangered',
    textColor: 'text-red-700',
    badgeClasses: 'bg-red-100 text-red-700 border-red-200',
  },
  EN: {
    label: 'Endangered',
    textColor: 'text-orange-700',
    badgeClasses: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  VU: {
    label: 'Vulnerable',
    textColor: 'text-amber-700',
    badgeClasses: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  NT: {
    label: 'Near Threatened',
    textColor: 'text-yellow-700',
    badgeClasses: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  LC: {
    label: 'Least Concern',
    textColor: 'text-green-700',
    badgeClasses: 'bg-green-100 text-green-700 border-green-200',
  },
  DD: {
    label: 'Data Deficient',
    textColor: 'text-gray-700',
    badgeClasses: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  EX: {
    label: 'Extinct',
    textColor: 'text-gray-900',
    badgeClasses: 'bg-gray-900 text-white border-gray-900',
  },
  EW: {
    label: 'Extinct in the Wild',
    textColor: 'text-gray-800',
    badgeClasses: 'bg-gray-800 text-white border-gray-800',
  },
  NE: {
    label: 'Not Evaluated',
    textColor: 'text-gray-500',
    badgeClasses: 'bg-gray-50 text-gray-500 border-gray-200',
  },
};

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
  imageUrl?: string;
  imageCredit?: string;
  imageCreditUrl?: string;
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
  imageUrl: katalaImg,
  imageCredit: '© matthewkwan, CC BY-ND',
  imageCreditUrl:
    'https://www.inaturalist.org/taxa/116758-Cacatua-haematuropygia',
};

const fiddlerCrabData: SpeciesSpotlightData = {
  id: 'fiddler-crab',
  commonName: 'Fiddler Crab',
  localName: 'Inverted Fiddler Crab',
  scientificName: 'Cranuca inversa',
  conservationStatus: 'LC',
  iucnUrl: 'https://www.iucnredlist.org',
  summaryText:
    'Cranuca inversa (Inverted Fiddler Crab) was recorded by the **GLOWdex South Africa** team in mangrove habitats along the **KwaZulu-Natal** coast. Fiddler crabs are widely used as bioindicators of mangrove ecosystem health — their presence signals intact intertidal habitat.',
  dataApplicability: 'Regional',
  dataSource: 'GBIF, GLOWdex South Africa',
  learnMoreUrl: 'https://www.fiddlercrab.info/u_inversa.html',
  mapTipText: 'Show Fiddler Crab observation locations',
  imageUrl: fiddlerCrabImg,
  imageCredit: '(c) Nelson Miranda – all rights reserved',
  imageCreditUrl: 'https://www.inaturalist.org/taxa/739157-Cranuca-inversa',
};

const estuaryStingrayData: SpeciesSpotlightData = {
  id: 'estuary-stingray',
  commonName: 'Estuary Stingray',
  scientificName: 'Hemitrygon fluviorum',
  conservationStatus: 'NT',
  iucnUrl: 'https://www.iucnredlist.org/species/161693/a984951',
  summaryText:
    'The Estuary Stingray is Near Threatened and endemic to coastal river systems of eastern **Australia**. It is highly sensitive to estuarine habitat degradation and altered freshwater flows from land use change.',
  dataApplicability: 'Regional',
  dataSource: 'GBIF, IUCN Red List',
  learnMoreUrl: 'https://www.iucnredlist.org',
  mapTipText: 'Show Estuary Stingray observation locations',
  imageUrl: estuaryStringRayImg,
  imageCredit: '© jmfinoz, CC BY-NC',
  imageCreditUrl:
    'https://www.inaturalist.org/taxa/623842-Hemitrygon-fluviorum/browse_photos',
};

export const SPECIES_SPOTLIGHT_DATA: SpeciesSpotlightData[] = [
  katalaData,
  fiddlerCrabData,
  estuaryStingrayData,
];
