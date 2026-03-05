export interface FilterState {
  habitats: {
    mangroves: boolean;
    saltmarsh: boolean;
    seagrass: boolean;
  };
  typologyScale: 'scale5' | 'scale18';
  quantile: number;
}

export const INITIAL_FILTER_STATE: FilterState = {
  habitats: {
    mangroves: true,
    saltmarsh: false,
    seagrass: false,
  },
  typologyScale: 'scale5',
  quantile: 0.25,
};
