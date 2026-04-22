import { Habitat } from '@/types/enums/habitat.enum';
export interface ClusterRaw {
  ID: string;
  cluster_5?: string;
  hex_5?: string;
  cluster_18?: string;
  hex_18?: string;
  mang_presence: string;
  salt_presence: string;
  seag_presence: string;
  [key: string]: string | undefined;
}

export interface Cluster {
  id: number;
  name: string; // e.g. "Cluster 1"
  color: string;
  fillColor: string; // usually with opacity
  clusterNumber: number;
}

export interface TypologyMap {
  scale5: Record<number, Cluster>;
  scale18: Record<number, Cluster>;
}

export type HabitatPresence = {
  [Habitat.MANGROVES]: boolean;
  [Habitat.SALTMARSH]: boolean;
  [Habitat.SEAGRASS]: boolean;
};
