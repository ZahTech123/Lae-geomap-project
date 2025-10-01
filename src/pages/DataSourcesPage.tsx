import React, { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { TableName } from "@/lib/permissions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import {
  fetchAllTaxRecords,
  fetchAllProperties,
  fetchAllOwners,
  updateTaxRecord,
  updateProperty,
  updateOwner,
  deleteTaxRecord,
  deleteProperty,
  deleteOwner,
  TaxRecord,
  Property,
  Owner
} from "@/integrations/supabase/services";

// Helper function to format land details JSON
const formatLandDetails = (landDetails: any): string => {
  if (!landDetails) return '-';
  
  try {
    const details = typeof landDetails === 'string' ? JSON.parse(landDetails) : landDetails;
    const parts: string[] = [];
    
    if (details.land_use) parts.push(details.land_use);
    if (details.area_sq_m) parts.push(`${details.area_sq_m} sq m`);
    
    return parts.length > 0 ? parts.join(', ') : '-';
  } catch {
    return '-';
  }
};

// Helper function to format building details JSON
const formatBuildingDetails = (buildingDetails: any): string => {
  if (!buildingDetails) return '-';
  
  try {
    const details = typeof buildingDetails === 'string' ? JSON.parse(buildingDetails) : buildingDetails;
    const parts: string[] = [];
    
    if (details.floors) parts.push(`Floors: ${details.floors}`);
    if (details.amenity) parts.push(`Amenity: ${details.amenity}`);
    if (details.condition) parts.push(`Condition: ${details.condition}`);
    if (details.year_built) parts.push(`Built: ${details.year_built}`);
    
    return parts.length > 0 ? parts.join(', ') : '-';
  } catch {
    return '-';
  }
};

const DataSourcesPage = () => {
  const { user } = useAuth();
  const [taxRecords, setTaxRecords] = useState<TaxRecord[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('tax_records');

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});

  const { toast } = useToast();

  // Helper function to check if user is restricted
  const isRestrictedUser = () => {
    return user?.email === 'zahlytics@gmail.com' || user?.email === 'testuser@gmail.com';
  };

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      const fetchedTaxRecords = await fetchAllTaxRecords();
      if (fetchedTaxRecords) {
        setTaxRecords(fetchedTaxRecords);
      }
      const fetchedProperties = await fetchAllProperties();
      if (fetchedProperties) {
        setProperties(fetchedProperties);
      }
      const fetchedOwners = await fetchAllOwners();
      if (fetchedOwners) {
        setOwners(fetchedOwners);
      }
      setLoading(false);
    };

    getData();
  }, []);

  const getFilteredData = () => {
    let currentData: any[] = [];
    switch (activeTab) {
      case 'tax_records':
        currentData = taxRecords;
        break;
      case 'properties':
        currentData = properties;
        break;
      case 'owners':
        currentData = owners;
        break;
      default:
        currentData = [];
    }

    return currentData.filter(item =>
      Object.values(item).some(val =>
        String(val || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const filteredData = getFilteredData();

  const handleEdit = (record: any) => {
    setCurrentRecord(record);
    setEditFormData({ ...record });
    setEditDialogOpen(true);
  };

  const handleDelete = (record: any) => {
    setCurrentRecord(record);
    setDeleteDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!currentRecord) return;

    let result;
    switch (activeTab) {
      case 'tax_records':
        result = await updateTaxRecord(currentRecord.tax_record_id, editFormData);
        if (result.success) {
          setTaxRecords(prev =>
            prev.map(item =>
              item.tax_record_id === currentRecord.tax_record_id ? { ...item, ...editFormData } : item
            )
          );
        }
        break;
      case 'properties':
        result = await updateProperty(currentRecord.property_id, editFormData);
        if (result.success) {
          setProperties(prev =>
            prev.map(item =>
              item.property_id === currentRecord.property_id ? { ...item, ...editFormData } : item
            )
          );
        }
        break;
      case 'owners':
        result = await updateOwner(currentRecord.id, editFormData);
        if (result.success) {
          setOwners(prev =>
            prev.map(item =>
              item.id === currentRecord.id ? { ...item, ...editFormData } : item
            )
          );
        }
        break;
      default:
        result = { success: false, error: 'Unknown table type' };
    }

    if (result.success) {
      toast({
        title: "Success",
        description: "Record updated successfully",
      });
      setEditDialogOpen(false);
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update record",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!currentRecord) return;

    let result;
    switch (activeTab) {
      case 'tax_records':
        result = await deleteTaxRecord(currentRecord.tax_record_id);
        if (result.success) {
          setTaxRecords(prev =>
            prev.filter(item => item.tax_record_id !== currentRecord.tax_record_id)
          );
        }
        break;
      case 'properties':
        result = await deleteProperty(currentRecord.property_id);
        if (result.success) {
          setProperties(prev =>
            prev.filter(item => item.property_id !== currentRecord.property_id)
          );
        }
        break;
      case 'owners':
        result = await deleteOwner(currentRecord.id);
        if (result.success) {
          setOwners(prev =>
            prev.filter(item => item.id !== currentRecord.id)
          );
        }
        break;
      default:
        result = { success: false, error: 'Unknown table type' };
    }

    if (result.success) {
      toast({
        title: "Success",
        description: "Record deleted successfully",
      });
      setDeleteDialogOpen(false);
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete record",
        variant: "destructive",
      });
    }
  };

  const renderEditForm = () => {
    if (!currentRecord) return null;

    switch (activeTab) {
      case 'tax_records':
        return (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="val_no">Val No</Label>
              <Input
                id="val_no"
                value={editFormData.val_no || ''}
                onChange={(e) => setEditFormData({ ...editFormData, val_no: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tax_year">Tax Year</Label>
              <Input
                id="tax_year"
                type="number"
                value={editFormData.tax_year || ''}
                onChange={(e) => setEditFormData({ ...editFormData, tax_year: parseInt(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount_due">Amount Due</Label>
              <Input
                id="amount_due"
                type="number"
                step="0.01"
                value={editFormData.amount_due || ''}
                onChange={(e) => setEditFormData({ ...editFormData, amount_due: parseFloat(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payment_status">Payment Status</Label>
              <Input
                id="payment_status"
                value={editFormData.payment_status || ''}
                onChange={(e) => setEditFormData({ ...editFormData, payment_status: e.target.value })}
              />
            </div>
          </div>
        );

      case 'properties':
        // Parse JSONB fields for editing
        const landDetails = typeof editFormData.land_details === 'string' 
          ? JSON.parse(editFormData.land_details || '{}')
          : editFormData.land_details || {};
        const buildingDetails = typeof editFormData.building_details === 'string'
          ? JSON.parse(editFormData.building_details || '{}')
          : editFormData.building_details || {};

        return (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="building_id">Building ID</Label>
              <Input
                id="building_id"
                value={editFormData.building_id || ''}
                onChange={(e) => setEditFormData({ ...editFormData, building_id: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="building_name">Building Name</Label>
              <Input
                id="building_name"
                value={editFormData.building_name || ''}
                onChange={(e) => setEditFormData({ ...editFormData, building_name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={editFormData.address || ''}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="section">Section</Label>
              <Input
                id="section"
                value={editFormData.section || ''}
                onChange={(e) => setEditFormData({ ...editFormData, section: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lot">Lot</Label>
              <Input
                id="lot"
                value={editFormData.lot || ''}
                onChange={(e) => setEditFormData({ ...editFormData, lot: e.target.value })}
              />
            </div>

            {/* Land Details Section */}
            <div className="border-t pt-4 mt-2">
              <h4 className="font-semibold mb-3">Land Details</h4>
              <div className="grid gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="land_use">Land Use</Label>
                  <Input
                    id="land_use"
                    value={landDetails.land_use || ''}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      land_details: { ...landDetails, land_use: e.target.value }
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="area_sq_m">Area (sq m)</Label>
                  <Input
                    id="area_sq_m"
                    value={landDetails.area_sq_m || ''}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      land_details: { ...landDetails, area_sq_m: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Building Details Section */}
            <div className="border-t pt-4 mt-2">
              <h4 className="font-semibold mb-3">Building Details</h4>
              <div className="grid gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="floors">Floors</Label>
                  <Input
                    id="floors"
                    type="number"
                    value={buildingDetails.floors || ''}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      building_details: { ...buildingDetails, floors: e.target.value ? parseInt(e.target.value) : null }
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amenity">Amenity</Label>
                  <Input
                    id="amenity"
                    value={buildingDetails.amenity || ''}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      building_details: { ...buildingDetails, amenity: e.target.value }
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="condition">Condition</Label>
                  <Input
                    id="condition"
                    value={buildingDetails.condition || ''}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      building_details: { ...buildingDetails, condition: e.target.value }
                    })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="year_built">Year Built</Label>
                  <Input
                    id="year_built"
                    type="number"
                    value={buildingDetails.year_built || ''}
                    onChange={(e) => setEditFormData({
                      ...editFormData,
                      building_details: { ...buildingDetails, year_built: e.target.value ? parseInt(e.target.value) : null }
                    })}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'owners':
        return (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="owner_name">Owner Name</Label>
              <Input
                id="owner_name"
                value={editFormData.owner_name || ''}
                onChange={(e) => setEditFormData({ ...editFormData, owner_name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="section">Section</Label>
              <Input
                id="section"
                value={editFormData.section || ''}
                onChange={(e) => setEditFormData({ ...editFormData, section: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lot">Lot</Label>
              <Input
                id="lot"
                value={editFormData.lot || ''}
                onChange={(e) => setEditFormData({ ...editFormData, lot: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact_info">Contact Info</Label>
              <Input
                id="contact_info"
                value={editFormData.contact_info || ''}
                onChange={(e) => setEditFormData({ ...editFormData, contact_info: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title_reference">Title Reference</Label>
              <Input
                id="title_reference"
                value={editFormData.title_reference || ''}
                onChange={(e) => setEditFormData({ ...editFormData, title_reference: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="term_of_lease">Term of Lease</Label>
              <Input
                id="term_of_lease"
                value={editFormData.term_of_lease || ''}
                onChange={(e) => setEditFormData({ ...editFormData, term_of_lease: e.target.value })}
                placeholder="e.g., 99 YRS"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date_of_grant">Date of Grant</Label>
              <Input
                id="date_of_grant"
                type="date"
                value={editFormData.date_of_grant || ''}
                onChange={(e) => setEditFormData({ ...editFormData, date_of_grant: e.target.value })}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const ActionsDropdown = ({ record }: { record: any }) => {
    // Determine the table name based on active tab
    const getTableName = (): TableName => {
      switch (activeTab) {
        case 'tax_records':
          return 'tax_records';
        case 'properties':
          return 'properties';
        case 'owners':
          return 'owners';
        default:
          return 'properties'; // fallback
      }
    };

    const tableName = getTableName();

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {!isRestrictedUser() && (
            <PermissionGate table={tableName} action="write">
              <DropdownMenuItem onClick={() => handleEdit(record)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            </PermissionGate>
          )}
          <PermissionGate table={tableName} action="delete">
            <DropdownMenuItem onClick={() => handleDelete(record)} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </PermissionGate>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Data Sources</h1>
      <p className="text-muted-foreground mb-4">Manage your data connections and sources.</p>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search data..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <div>Loading data...</div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tax_records">Tax Records</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="owners">Owners</TabsTrigger>
          </TabsList>

          <TabsContent value="tax_records">
            <div className="border rounded-md mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tax Record ID</TableHead>
                    <TableHead>Property ID</TableHead>
                    <TableHead>Val No</TableHead>
                    <TableHead>Tax Year</TableHead>
                    {!isRestrictedUser() && <TableHead>Amount Due</TableHead>}
                    {!isRestrictedUser() && <TableHead>Payment Status</TableHead>}
                    <TableHead>Record Date</TableHead>
                    {!isRestrictedUser() && <TableHead className="w-[50px]">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item: TaxRecord) => (
                    <TableRow key={item.tax_record_id}>
                      <TableCell className="font-medium">{item.tax_record_id}</TableCell>
                      <TableCell>{item.property_id}</TableCell>
                      <TableCell>{item.val_no}</TableCell>
                      <TableCell>{item.tax_year}</TableCell>
                      {!isRestrictedUser() && <TableCell>{item.amount_due}</TableCell>}
                      {!isRestrictedUser() && <TableCell>{item.payment_status}</TableCell>}
                      <TableCell>{item.record_date}</TableCell>
                      {!isRestrictedUser() && (
                        <TableCell>
                          <ActionsDropdown record={item} />
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="properties">
            <div className="border rounded-md mt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property ID</TableHead>
                    <TableHead>Building ID</TableHead>
                    <TableHead>Parcel ID</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Lot</TableHead>
                    <TableHead>Val No</TableHead>
                    <TableHead>Building Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Land Details</TableHead>
                    <TableHead>Building Details</TableHead>
                    {!isRestrictedUser() && <TableHead className="w-[50px]">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item: Property) => (
                    <TableRow key={item.property_id}>
                      <TableCell className="font-medium">{item.property_id}</TableCell>
                      <TableCell>{item.building_id}</TableCell>
                      <TableCell>{item.parcel_id}</TableCell>
                      <TableCell>{item.section}</TableCell>
                      <TableCell>{item.lot}</TableCell>
                      <TableCell>{item.val_no}</TableCell>
                      <TableCell>{item.building_name}</TableCell>
                      <TableCell>{item.address}</TableCell>
                      <TableCell>{formatLandDetails(item.land_details)}</TableCell>
                      <TableCell>{formatBuildingDetails(item.building_details)}</TableCell>
                      {!isRestrictedUser() && (
                        <TableCell>
                          <ActionsDropdown record={item} />
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="owners">
            <div className="border rounded-md mt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Owner ID</TableHead>
                    <TableHead>Owner Name</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Lot</TableHead>
                    <TableHead>Parcel ID</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Title Reference</TableHead>
                    <TableHead>Term of Lease</TableHead>
                    <TableHead>Date of Grant</TableHead>
                    {!isRestrictedUser() && <TableHead className="w-[50px]">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item: Owner) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>{item.owner_id}</TableCell>
                      <TableCell>{item.owner_name}</TableCell>
                      <TableCell>{item.section}</TableCell>
                      <TableCell>{item.lot}</TableCell>
                      <TableCell>{item.parcel_id}</TableCell>
                      <TableCell>{item.contact_info}</TableCell>
                      <TableCell>{item.title_reference}</TableCell>
                      <TableCell>{item.term_of_lease}</TableCell>
                      <TableCell>{item.date_of_grant}</TableCell>
                      {!isRestrictedUser() && (
                        <TableCell>
                          <ActionsDropdown record={item} />
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Record</DialogTitle>
            <DialogDescription>
              Make changes to the record. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {renderEditForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSave}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the record from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DataSourcesPage;
