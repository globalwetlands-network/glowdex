import { Habitat } from '@/types/enums/habitat.enum';
export interface FilterState {
  habitats: {
    [Habitat.MANGROVES]: boolean;
    [Habitat.SALTMARSH]: boolean;
    [Habitat.SEAGRASS]: boolean;
  };
  typologyScale: 'scale5' | 'scale18';
  quantile: number;
}

export const INITIAL_FILTER_STATE: FilterState = {
  habitats: {
    [Habitat.MANGROVES]: true,
    [Habitat.SALTMARSH]: false,
    [Habitat.SEAGRASS]: false,
  },
  typologyScale: 'scale5',
  quantile: 0.25,
};
