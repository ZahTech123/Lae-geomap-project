import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { X } from 'lucide-react';

interface PropertyDetailsPanelProps {
  property: Record<string, any> | null;
  onClose?: () => void;
}

const PropertyDetailsPanel: React.FC<PropertyDetailsPanelProps> = ({ property, onClose }) => {

  console.log("PropertyDetailsPanel received property:", property);

  if (!property) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Select a property on the map to view its details.
      </div>
    );
  }

  let parsedProperty = property;
  if (property.prop_details && typeof property.prop_details === 'string') {
    try {
      parsedProperty = JSON.parse(property.prop_details);
      console.log("Parsed prop_details:", parsedProperty);
    } catch (e) {
      console.error("Failed to parse prop_details:", e);
    }
  }

  // Directly access flattened properties from parsedProperty
  const ownerName = parsedProperty.owner_name || 'Not Registered';
  const contactInfo = parsedProperty.contact_info || 'N/A';
  const termOfLease = parsedProperty.term_of_lease || 'N/A';
  const titleReference = parsedProperty.title_reference || 'N/A';
  const dateOfGrant = parsedProperty.date_of_grant ? new Date(parsedProperty.date_of_grant).toLocaleDateString() : 'N/A';

  const zoningCode = parsedProperty.zoning_code || 'N/A';
  const permitStatus = parsedProperty.permit_status || 'N/A';
  const planningLastUpdated = parsedProperty.last_updated_at ? new Date(parsedProperty.last_updated_at).toLocaleDateString() : 'N/A';

  const taxYear = parsedProperty.tax_year;
  const amountDue = parsedProperty.amount_due;
  const paymentStatus = parsedProperty.payment_status;
  const recordDate = parsedProperty.record_date ? new Date(parsedProperty.record_date).toLocaleDateString() : 'N/A';

  const renderDetails = (details: Record<string, any>) => {
    if (!details || Object.keys(details).length === 0) {
      return <p className="text-foreground">N/A</p>;
    }
    return (
      <ul className="list-disc list-inside ml-4 text-foreground">
        {Object.entries(details).map(([key, value]) => (
          <li key={key}><span className="font-semibold">{key.replace(/_/g, ' ')}:</span> {value || 'N/A'}</li>
        ))}
      </ul>
    );
  };

  let landDetailsParsed = {};
  if (parsedProperty.land_details) {
    try {
      landDetailsParsed = typeof parsedProperty.land_details === 'string'
        ? JSON.parse(parsedProperty.land_details)
        : parsedProperty.land_details;
    } catch (e) {
      console.error("Failed to parse land_details:", e);
    }
  }

  let buildingDetailsParsed = {};
  if (parsedProperty.building_details) {
    try {
      buildingDetailsParsed = typeof parsedProperty.building_details === 'string'
        ? JSON.parse(parsedProperty.building_details)
        : parsedProperty.building_details;
    } catch (e) {
      console.error("Failed to parse building_details:", e);
    }
  }

  return (
    <div className="p-4 space-y-4 group relative">
      {/* Central Close Button - Only visible on hover */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-background hover:bg-accent rounded-full shadow-lg border border-border"
          aria-label="Close Property Information Panel"
        >
          <X className="h-5 w-5 text-foreground" />
        </button>
      )}
      <Card className="bg-background/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Property Information</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <div className="space-y-2">
            <p className="text-foreground"><span className="font-semibold">Address:</span> {parsedProperty.address}</p>
            <p className="text-foreground"><span className="font-semibold">Section:</span> {parsedProperty.section}</p>
            <p className="text-foreground"><span className="font-semibold">Lot:</span> {parsedProperty.lot}</p>
            <p className="text-foreground"><span className="font-semibold">Parcel ID:</span> {parsedProperty.parcel_id}</p>
            <p className="text-foreground"><span className="font-semibold">Valuation Number:</span> {parsedProperty.val_no}</p>
            <p className="font-semibold mt-3">Land Details:</p>
            {renderDetails(landDetailsParsed)}
            <p className="font-semibold mt-3">Building Details:</p>
            {renderDetails(buildingDetailsParsed)}
          </div>
        </CardContent>
      </Card>

      {/* Ownership Information */}
      <Card className="bg-background/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Ownership Information</CardTitle>
        </CardHeader>
          <CardContent className="text-sm">
            <div className="space-y-2">
              <p className="text-foreground"><span className="font-semibold">Owner:</span> {ownerName}</p>
              <p className="text-foreground"><span className="font-semibold">Contact Info:</span> {contactInfo}</p>
              <p className="text-foreground"><span className="font-semibold">Lease Term:</span> {termOfLease}</p>
              <p className="text-foreground"><span className="font-semibold">Title Reference:</span> {titleReference}</p>
              <p className="text-foreground"><span className="font-semibold">Date of Grant:</span> {dateOfGrant}</p>
            </div>
        </CardContent>
      </Card>

      {/* Tax Records */}
      <Card className="bg-background/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Tax Records</CardTitle>
        </CardHeader>
          <CardContent className="text-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Year</TableHead>
                  <TableHead className="font-semibold">Amount Due</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Record Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taxYear ? (
                  <TableRow>
                    <TableCell className="text-foreground">{taxYear}</TableCell>
                    <TableCell className="text-foreground">{amountDue}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          paymentStatus === 'Paid'
                            ? 'default'
                            : paymentStatus === 'Overdue'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-foreground">{recordDate}</TableCell>
                  </TableRow>
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-foreground">
                      No tax records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
        </CardContent>
      </Card>

      {/* Planning & Zoning */}
      <Card className="bg-background/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Planning & Zoning</CardTitle>
        </CardHeader>
          <CardContent className="text-sm">
            <div className="space-y-2">
              <p className="text-foreground"><span className="font-semibold">Zoning Code:</span> {zoningCode}</p>
              <p className="text-foreground"><span className="font-semibold">Permit Status:</span> {permitStatus}</p>
              <p className="text-foreground"><span className="font-semibold">Last Updated:</span> {planningLastUpdated}</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyDetailsPanel;
