import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';

interface FilterPanelProps {
  onApplyFilters: (filters: Record<string, any>) => void;
  onClose?: () => void;
  uniqueZoneIds: string[];
  uniqueZoningCodes: string[];
  uniquePermitStatuses: string[];
  uniquePaymentStatuses: string[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({ 
  onApplyFilters,
  onClose,
  uniqueZoneIds, 
  uniqueZoningCodes,
  uniquePermitStatuses,
  uniquePaymentStatuses
}) => {
  const [section, setSection] = useState('');
  const [lot, setLot] = useState('');
  const [parcelId, setParcelId] = useState('');
  const [buildingId, setBuildingId] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [valNo, setValNo] = useState('');
  const [address, setAddress] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [zoningCode, setZoningCode] = useState('');
  const [permitStatus, setPermitStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  const handleApply = () => {
    onApplyFilters({
      section,
      lot,
      parcelId,
      buildingId,
      buildingName,
      valNo,
      address,
      ownerName,
      zoningCode,
      permitStatus,
      paymentStatus,
    });
  };

  const handleClear = () => {
    setSection('');
    setLot('');
    setParcelId('');
    setBuildingId('');
    setBuildingName('');
    setValNo('');
    setAddress('');
    setOwnerName('');
    setZoningCode('');
    setPermitStatus('');
    setPaymentStatus('');
    onApplyFilters({}); // Clear all filters
  };

  return (
    <div className="h-full max-h-[calc(100vh-3.5rem)] w-80 group relative">
      {/* Central Close Button - Only visible on hover */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-white hover:bg-gray-100 rounded-full shadow-lg border border-gray-200"
          aria-label="Close Filter Panel"
        >
          <X className="h-5 w-5 text-gray-700 hover:text-gray-900" />
        </button>
      )}
      <Card className="h-full flex flex-col relative overflow-hidden">
        <CardHeader className="flex-shrink-0">
          <CardTitle>Filter Map Data</CardTitle>
        </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-4">
        <div>
          <Label htmlFor="section">Section</Label>
          <Input
            id="section"
            placeholder="e.g., 1, 2, 87"
            value={section}
            onChange={(e) => setSection(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="lot">Lot</Label>
          <Input
            id="lot"
            placeholder="e.g., 1, 70, 74"
            value={lot}
            onChange={(e) => setLot(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="parcel-id">Parcel ID</Label>
          <Input
            id="parcel-id"
            placeholder="e.g., wd2_00513"
            value={parcelId}
            onChange={(e) => setParcelId(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="building-id">Building ID</Label>
          <Input
            id="building-id"
            placeholder="e.g., BW2_01"
            value={buildingId}
            onChange={(e) => setBuildingId(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="building-name">Building Name</Label>
          <Input
            id="building-name"
            placeholder="Enter building name"
            value={buildingName}
            onChange={(e) => setBuildingName(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="val-no">Valuation Number</Label>
          <Input
            id="val-no"
            placeholder="e.g., 30142, 50101"
            value={valNo}
            onChange={(e) => setValNo(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            placeholder="Enter address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="owner-name">Owner Name</Label>
          <Input
            id="owner-name"
            placeholder="e.g., PAPUA NEW GUINEA GOVERNMENT"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="zoning-code">Zoning Code</Label>
          <Select value={zoningCode} onValueChange={setZoningCode}>
            <SelectTrigger id="zoning-code">
              <SelectValue placeholder="Select Zoning Code" />
            </SelectTrigger>
            <SelectContent>
              {uniqueZoningCodes.map((code) => (
                <SelectItem key={code} value={code}>
                  {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="permit-status">Permit Status</Label>
          <Select value={permitStatus} onValueChange={setPermitStatus}>
            <SelectTrigger id="permit-status">
              <SelectValue placeholder="Select Permit Status" />
            </SelectTrigger>
            <SelectContent>
              {uniquePermitStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="payment-status">Payment Status</Label>
          <Select value={paymentStatus} onValueChange={setPaymentStatus}>
            <SelectTrigger id="payment-status">
              <SelectValue placeholder="Select Payment Status" />
            </SelectTrigger>
            <SelectContent>
              {uniquePaymentStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
        <div className="flex-shrink-0 p-4 border-t bg-background flex justify-center gap-2">
          <Button variant="outline" onClick={handleClear}>Clear Filters</Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </div>
      </Card>
    </div>
  );
};

export default FilterPanel;
