import { supabase } from './client';
import { PostgrestError } from '@supabase/supabase-js';
import * as GeoJSON from 'geojson';
import { Database } from './types';

export type TaxRecord = Database['public']['Tables']['tax_records']['Row'];
export type PlanningData = Database['public']['Tables']['planning_data']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Property = Database['public']['Tables']['properties']['Row'];
export type CustomerLot = Database['public']['Tables']['customer_lots']['Row'];
export type Owner = Database['public']['Tables']['owners']['Row'];

export const fetchBuildingFootprints = async (): Promise<GeoJSON.FeatureCollection | null> => {
  const { data, error } = await supabase
    .from('building_footprints')
    .select('geometry');

  if (error) {
    console.error('Error fetching building footprints:', error);
    return null;
  }

  const geojsonData: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: data.map((feature: any) => ({
      type: 'Feature',
      geometry: feature.geometry,
      properties: {},
    })),
  };

  return geojsonData;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
  }
};

export async function fetchPropertiesGeoJSON() {
  const { data, error } = await supabase.rpc('get_all_properties_geojson');

  if (error) {
    console.error('Error fetching properties GeoJSON:', error);
    return null;
  }

  return data as unknown as GeoJSON.FeatureCollection;
}

export async function fetchTaxRecordsByPropertyId(propertyId: number): Promise<TaxRecord[] | null> {
  const { data, error } = await supabase
    .from('tax_records')
    .select('*')
    .eq('property_id', propertyId);

  if (error) {
    console.error(`Error fetching tax records for property ${propertyId}:`, error);
    return null;
  }

  return data;
}

export async function fetchAllTaxRecords(): Promise<TaxRecord[] | null> {
  const { data, error } = await supabase
    .from('tax_records')
    .select('*');

  if (error) {
    console.error('Error fetching all tax records:', error);
    return null;
  }

  return data;
}

export async function fetchAllProperties(): Promise<Property[] | null> {
  const { data, error } = await supabase
    .from('properties')
    .select('*');

  if (error) {
    console.error('Error fetching all properties:', error);
    return null;
  }

  return data;
}

export async function fetchAllCustomerLots(): Promise<CustomerLot[] | null> {
  const { data, error } = await supabase
    .from('customer_lots')
    .select('*');

  if (error) {
    console.error('Error fetching all customer lots:', error);
    return null;
  }

  return data;
}

export async function fetchAllOwners(): Promise<Owner[] | null> {
  const { data, error } = await supabase
    .from('owners')
    .select('*');

  if (error) {
    console.error('Error fetching all owners:', error);
    return null;
  }

  return data;
}

export async function fetchPlanningDataByPropertyId(propertyId: number): Promise<PlanningData[] | null> {
  const { data, error } = await supabase
    .from('planning_data')
    .select('*')
    .eq('property_id', propertyId);

  if (error) {
    console.error(`Error fetching planning data for property ${propertyId}:`, error);
    return null;
  }

  return data;
}

export async function fetchPropertiesCount(): Promise<number | null> {
  const { count, error } = await supabase
    .from('properties')
    .select('*', { count: 'exact' });

  if (error) {
    console.error('Error fetching properties count:', error);
    return null;
  }
  return count;
}

export async function fetchTaxRecordsCount(): Promise<number | null> {
  const { count, error } = await supabase
    .from('tax_records')
    .select('*', { count: 'exact' });

  if (error) {
    console.error('Error fetching tax records count:', error);
    return null;
  }
  return count;
}

export async function fetchCustomerLotsCount(): Promise<number | null> {
  const { count, error } = await supabase
    .from('customer_lots')
    .select('*', { count: 'exact' });

  if (error) {
    console.error('Error fetching customer lots count:', error);
    return null;
  }
  return count;
}

export async function fetchBuildingFootprintsCount(): Promise<number | null> {
  const { count, error } = await supabase
    .from('building_footprints')
    .select('*', { count: 'exact' });

  if (error) {
    console.error('Error fetching building footprints count:', error);
    return null;
  }
  return count;
}

export async function fetchUserProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}
