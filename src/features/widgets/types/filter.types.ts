export interface FilterState {
  habitats: {
    mangroves: boolean;
    saltmarsh: boolean;
    seagrass: boolean;
  };
  typologyScale: 'scale5' | 'scale18';
  quantileFilter: number | null; // e.g. 0.5 for median cutoff, or null if off
}

export const INITIAL_FILTER_STATE: FilterState = {
  habitats: {
    mangroves: true,
    saltmarsh: true,
    seagrass: true,
  },
  typologyScale: 'scale5',
  quantileFilter: null,
};
