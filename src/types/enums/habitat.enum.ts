export const Habitat = {
  MANGROVES: 'mangroves',
  SALTMARSH: 'saltmarsh',
  SEAGRASS: 'seagrass',
} as const;

export type Habitat = (typeof Habitat)[keyof typeof Habitat];
