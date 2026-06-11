import { apiClient } from './client';

export interface PartnerResponse {
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

export interface PartnersResponse {
  partners: PartnerResponse[];
  total: number;
}

export async function fetchPartners(): Promise<PartnersResponse> {
  return apiClient<PartnersResponse>('/partners');
}

export async function fetchPartnerById(id: string): Promise<PartnerResponse> {
  return apiClient<PartnerResponse>(`/partners/${id}`);
}
