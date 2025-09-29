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

interface FilterPanelProps {
  onApplyFilters: (filters: Record<string, any>) => void;
  uniqueZoneIds: string[];
  uniqueLandUseValues: string[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onApplyFilters, uniqueZoneIds, uniqueLandUseValues }) => {
  const [landUse, setLandUse] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [taxStatus, setTaxStatus] = useState('');

  const handleApply = () => {
    onApplyFilters({
      landUse,
      zoneId,
      ownerName,
      taxStatus,
    });
  };

  const handleClear = () => {
    setLandUse('');
    setZoneId('');
    setOwnerName('');
    setTaxStatus('');
    onApplyFilters({}); // Clear all filters
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Filter Map Data</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-4">
        <div>
          <Label htmlFor="land-use">Land Use</Label>
          <Select value={landUse} onValueChange={setLandUse}>
            <SelectTrigger id="land-use">
              <SelectValue placeholder="Select Land Use" />
            </SelectTrigger>
            <SelectContent>
              {uniqueLandUseValues.map((landUseValue) => (
                <SelectItem key={landUseValue} value={landUseValue}>
                  {landUseValue}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="zone-id">Zone ID</Label>
          <Select value={zoneId} onValueChange={setZoneId}>
            <SelectTrigger id="zone-id">
              <SelectValue placeholder="Select Zone ID" />
            </SelectTrigger>
            <SelectContent>
              {uniqueZoneIds.map((id) => (
                <SelectItem key={id} value={id}>{id}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="owner-name">Owner Name</Label>
          <Input
            id="owner-name"
            placeholder="e.g., VOCO POINT TRADING PTY LTD"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="tax-status">Tax Payment Status</Label>
          <Select value={taxStatus} onValueChange={setTaxStatus}>
            <SelectTrigger id="tax-status">
              <SelectValue placeholder="Select Tax Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <div className="p-4 border-t flex justify-end gap-2">
        <Button variant="outline" onClick={handleClear}>Clear Filters</Button>
        <Button onClick={handleApply}>Apply Filters</Button>
      </div>
    </Card>
  );
};

export default FilterPanel;
