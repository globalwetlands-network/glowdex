import { apiClient } from './client';

export interface HubResponse {
  id: string;
  institution: string;
  city: string;
  country: string;
  /** [longitude, latitude] — GeoJSON / Mapbox convention */
  coordinates: [number, number];
  lead: string;
  role: string;
  websiteUrl: string;
}

export interface HubsResponse {
  hubs: HubResponse[];
  total: number;
}

export async function fetchHubs(): Promise<HubsResponse> {
  return apiClient<HubsResponse>('/hubs');
}

export async function fetchHubById(id: string): Promise<HubResponse> {
  return apiClient<HubResponse>(`/hubs/${id}`);
}
