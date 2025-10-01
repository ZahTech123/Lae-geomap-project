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
  const { data, error } = await supabase.rpc('get_properties_with_details_geojson');

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

export async function fetchOwnerByParcelId(parcelId: string): Promise<Owner | null> {
  const { data, error } = await supabase
    .from('owners')
    .select('*')
    .eq('parcel_id', parcelId)
    .single();

  if (error) {
    console.error(`Error fetching owner for parcel ${parcelId}:`, error);
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

export async function fetchOwnersCount(): Promise<number | null> {
  const { count, error } = await supabase
    .from('owners')
    .select('*', { count: 'exact' });

  if (error) {
    console.error('Error fetching owners count:', error);
    return null;
  }
  return count;
}

export async function fetchPlanningDataCount(): Promise<number | null> {
  const { count, error } = await supabase
    .from('planning_data')
    .select('*', { count: 'exact' });

  if (error) {
    console.error('Error fetching planning data count:', error);
    return null;
  }
  return count;
}

export async function fetchTaxRevenueSummary(): Promise<{
  totalRecords: number;
  totalRevenue: number;
  paidAmount: number;
  unpaidAmount: number;
  collectionRate: number;
} | null> {
  const { data, error } = await supabase
    .from('tax_records')
    .select('amount_due, payment_status');

  if (error) {
    console.error('Error fetching tax revenue summary:', error);
    return null;
  }

  let totalRevenue = 0;
  let paidAmount = 0;
  let unpaidAmount = 0;
  let paidCount = 0;
  let unpaidCount = 0;

  data.forEach(record => {
    const amount = parseFloat(String(record.amount_due || 0));
    if (!isNaN(amount)) {
      totalRevenue += amount;
      if (record.payment_status?.toLowerCase() === 'paid') {
        paidAmount += amount;
        paidCount++;
      } else if (record.payment_status?.toLowerCase() === 'unpaid') {
        unpaidAmount += amount;
        unpaidCount++;
      }
    }
  });

  const collectionRate = totalRevenue > 0 ? (paidAmount / totalRevenue) * 100 : 0;

  return {
    totalRecords: data.length,
    totalRevenue,
    paidAmount,
    unpaidAmount,
    collectionRate
  };
}

export async function fetchPropertiesWithOwners(): Promise<{
  totalProperties: number;
  propertiesWithOwners: number;
  propertiesWithoutOwners: number;
} | null> {
  const { data: properties, error: propError } = await supabase
    .from('properties')
    .select('parcel_id');

  if (propError) {
    console.error('Error fetching properties:', propError);
    return null;
  }

  const { data: owners, error: ownerError } = await supabase
    .from('owners')
    .select('parcel_id');

  if (ownerError) {
    console.error('Error fetching owners:', ownerError);
    return null;
  }

  const ownedParcelIds = new Set(owners.filter(o => o.parcel_id).map(o => o.parcel_id));
  const propertiesWithOwners = properties.filter(p => p.parcel_id && ownedParcelIds.has(p.parcel_id)).length;

  return {
    totalProperties: properties.length,
    propertiesWithOwners,
    propertiesWithoutOwners: properties.length - propertiesWithOwners
  };
}

export async function fetchPropertiesByLandUse(): Promise<Array<{
  land_use: string;
  count: number;
  total_area: number;
}> | null> {
  const { data, error } = await supabase
    .from('properties')
    .select('land_details');

  if (error) {
    console.error('Error fetching properties by land use:', error);
    return null;
  }

  const landUseCounts: Record<string, { count: number; area: number }> = {};

  data.forEach(property => {
    const landDetails = property.land_details as any;
    const landUse = landDetails?.land_use || 'Unknown';
    const areaStr = landDetails?.area_sq_m || '0';
    const area = parseFloat(String(areaStr).replace(/,/g, ''));

    if (!landUseCounts[landUse]) {
      landUseCounts[landUse] = { count: 0, area: 0 };
    }
    landUseCounts[landUse].count++;
    if (!isNaN(area)) {
      landUseCounts[landUse].area += area;
    }
  });

  return Object.entries(landUseCounts)
    .map(([land_use, stats]) => ({
      land_use,
      count: stats.count,
      total_area: stats.area
    }))
    .sort((a, b) => b.count - a.count);
}

export async function fetchZoningDistribution(): Promise<Array<{
  zoning_code: string;
  count: number;
}> | null> {
  const { data, error } = await supabase
    .from('planning_data')
    .select('zoning_code');

  if (error) {
    console.error('Error fetching zoning distribution:', error);
    return null;
  }

  const zoningCounts: Record<string, number> = {};

  data.forEach(record => {
    const zoning = record.zoning_code || 'Unknown';
    zoningCounts[zoning] = (zoningCounts[zoning] || 0) + 1;
  });

  return Object.entries(zoningCounts)
    .map(([zoning_code, count]) => ({ zoning_code, count }))
    .sort((a, b) => b.count - a.count);
}

export async function fetchLeaseExpirationStats(): Promise<{
  totalLeases: number;
  expiringSoon: number;
  activeLeases: number;
} | null> {
  const { data, error } = await supabase
    .from('owners')
    .select('date_of_grant, term_of_lease');

  if (error) {
    console.error('Error fetching lease expiration stats:', error);
    return null;
  }

  let totalLeases = 0;
  let expiringSoon = 0;
  let activeLeases = 0;
  const currentDate = new Date();
  const fiveYearsFromNow = new Date();
  fiveYearsFromNow.setFullYear(currentDate.getFullYear() + 5);

  data.forEach(owner => {
    if (owner.date_of_grant && owner.term_of_lease) {
      totalLeases++;
      const grantDate = new Date(owner.date_of_grant);
      const termMatch = owner.term_of_lease.match(/(\d+)\s*YRS?/i);
      
      if (termMatch) {
        const termYears = parseInt(termMatch[1]);
        const expirationDate = new Date(grantDate);
        expirationDate.setFullYear(grantDate.getFullYear() + termYears);

        if (expirationDate > currentDate) {
          activeLeases++;
          if (expirationDate <= fiveYearsFromNow) {
            expiringSoon++;
          }
        }
      }
    }
  });

  return {
    totalLeases,
    expiringSoon,
    activeLeases
  };
}

export async function fetchTopOwners(limit: number = 10): Promise<Array<{
  owner_name: string;
  property_count: number;
}> | null> {
  const { data, error } = await supabase
    .from('owners')
    .select('owner_name');

  if (error) {
    console.error('Error fetching top owners:', error);
    return null;
  }

  const ownerCounts: Record<string, number> = {};

  data.forEach(owner => {
    const name = owner.owner_name || 'Unknown';
    ownerCounts[name] = (ownerCounts[name] || 0) + 1;
  });

  return Object.entries(ownerCounts)
    .map(([owner_name, property_count]) => ({ owner_name, property_count }))
    .sort((a, b) => b.property_count - a.property_count)
    .slice(0, limit);
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

// Update functions
export async function updateTaxRecord(taxRecordId: number, updates: Partial<TaxRecord>): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('tax_records')
    .update(updates)
    .eq('tax_record_id', taxRecordId);

  if (error) {
    console.error('Error updating tax record:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updateProperty(propertyId: number, updates: Partial<Property>): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('properties')
    .update(updates)
    .eq('property_id', propertyId);

  if (error) {
    console.error('Error updating property:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updateCustomerLot(id: number, updates: Partial<CustomerLot>): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('customer_lots')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating customer lot:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updateOwner(id: number, updates: Partial<Owner>): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('owners')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating owner:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Delete functions
export async function deleteTaxRecord(taxRecordId: number): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('tax_records')
    .delete()
    .eq('tax_record_id', taxRecordId);

  if (error) {
    console.error('Error deleting tax record:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteProperty(propertyId: number): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('property_id', propertyId);

  if (error) {
    console.error('Error deleting property:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteCustomerLot(id: number): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('customer_lots')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting customer lot:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteOwner(id: number): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('owners')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting owner:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
