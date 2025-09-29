import React, { useEffect, useState } from 'react';
import { fetchTaxRecordsByPropertyId, fetchPlanningDataByPropertyId, TaxRecord, PlanningData } from '../../integrations/supabase/services';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';

interface PropertyDetailsPanelProps {
  propertyId: number | null;
  propertyDetails: Record<string, any> | null;
}

const PropertyDetailsPanel: React.FC<PropertyDetailsPanelProps> = ({ propertyId, propertyDetails }) => {
  const [taxRecords, setTaxRecords] = useState<TaxRecord[]>([]);
  const [planningData, setPlanningData] = useState<PlanningData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!propertyId) return;

      setLoading(true);
      const [taxData, planningData] = await Promise.all([
        fetchTaxRecordsByPropertyId(propertyId),
        fetchPlanningDataByPropertyId(propertyId),
      ]);

      setTaxRecords(taxData || []);
      setPlanningData(planningData || []);
      setLoading(false);
    };

    fetchData();
  }, [propertyId]);

  if (!propertyId || !propertyDetails) {
    return (
      <div className="p-4 text-center text-gray-500">
        Select a property on the map to view its details.
      </div>
    );
  }

  // Destructure the nested objects from the propertyDetails prop
  const { prop_details, owner_details } = propertyDetails;

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Property Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Address:</strong> {owner_details?.contact_info ? owner_details.contact_info : prop_details.address}</p>
          <p><strong>Land Details:</strong> {prop_details.land_details}</p>
          <p><strong>Building Details:</strong> {prop_details.building_details}</p>
          <p><strong>Last Valuation:</strong> {prop_details.last_valuation_year}</p>
          <p><strong>Section:</strong> {prop_details.section}</p>
          <p><strong>Lots:</strong> {prop_details.lots}</p>
          <p><strong>Land Use:</strong> {prop_details.land_use}</p>
          <p><strong>Area (sq m):</strong> {prop_details.area_sq_m}</p>
          <p><strong>Parcel ID:</strong> {prop_details.parcel_id}</p>
          <p><strong>Zone ID:</strong> {prop_details.zone_id}</p>
        </CardContent>
      </Card>

      {/* New Card for Ownership Information */}
      <Card>
        <CardHeader>
          <CardTitle>Ownership Information</CardTitle>
        </CardHeader>
        <CardContent>
          {owner_details ? (
            <div>
              <p><strong>Owner:</strong> {owner_details.owner_name || 'Not Registered'}</p>
              <p><strong>Lease Term:</strong> {owner_details.term_of_lease || 'N/A'}</p>
              <p><strong>Title Reference:</strong> {owner_details.title_reference || 'N/A'}</p>
            </div>
          ) : (
            <p>No owner information available for this property.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tax Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Amount Due</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxRecords.length > 0 ? (
                taxRecords.map((record) => (
                  <TableRow key={record.tax_record_id}>
                    <TableCell>{record.customer_name || 'N/A'}</TableCell>
                    <TableCell>{record.tax_year}</TableCell>
                    <TableCell>{record.amount_due}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          record.payment_status === 'Paid'
                            ? 'default'
                            : record.payment_status === 'Overdue'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {record.payment_status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No tax records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Planning & Zoning</CardTitle>
        </CardHeader>
        <CardContent>
          {planningData.length > 0 ? (
            planningData.map((data) => (
              <div key={data.planning_id}>
                <p><strong>Zoning Code:</strong> {data.zoning_code}</p>
                <p><strong>Permit Status:</strong> {data.permit_status}</p>
                <p><strong>Last Updated:</strong> {new Date(data.last_updated_at || '').toLocaleDateString()}</p>
              </div>
            ))
          ) : (
            <p>No planning data found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyDetailsPanel;
