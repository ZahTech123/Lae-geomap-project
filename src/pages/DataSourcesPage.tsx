import React, { useState, useEffect } from 'react';
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
import { fetchAllTaxRecords, fetchAllProperties, fetchAllCustomerLots, TaxRecord, Property, CustomerLot } from "@/integrations/supabase/services";

const DataSourcesPage = () => {
  const [taxRecords, setTaxRecords] = useState<TaxRecord[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [customerLots, setCustomerLots] = useState<CustomerLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('tax_records'); // Default active tab

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
      const fetchedCustomerLots = await fetchAllCustomerLots();
      if (fetchedCustomerLots) {
        setCustomerLots(fetchedCustomerLots);
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
      case 'customer_lots':
        currentData = customerLots;
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
            <TabsTrigger value="customer_lots">Customer Lots</TabsTrigger>
          </TabsList>

          <TabsContent value="tax_records">
            <div className="border rounded-md mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tax Record ID</TableHead>
                    <TableHead>Property ID</TableHead>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Tax Year</TableHead>
                    <TableHead>Amount Due</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Record Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item: TaxRecord) => (
                    <TableRow key={item.tax_record_id}>
                      <TableCell className="font-medium">{item.tax_record_id}</TableCell>
                      <TableCell>{item.property_id}</TableCell>
                      <TableCell>{item.customer_name}</TableCell>
                      <TableCell>{item.tax_year}</TableCell>
                      <TableCell>{item.amount_due}</TableCell>
                      <TableCell>{item.payment_status}</TableCell>
                      <TableCell>{item.record_date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="properties">
            <div className="border rounded-md mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property ID</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Land Details</TableHead>
                    <TableHead>Building Details</TableHead>
                    <TableHead>Last Valuation Year</TableHead>
                    <TableHead>Owner User ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item: Property) => (
                    <TableRow key={item.property_id}>
                      <TableCell className="font-medium">{item.property_id}</TableCell>
                      <TableCell>{item.address}</TableCell>
                      <TableCell>{item.land_details}</TableCell>
                      <TableCell>{item.building_details}</TableCell>
                      <TableCell>{item.last_valuation_year}</TableCell>
                      <TableCell>{item.owner_user_id}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="customer_lots">
            <div className="border rounded-md mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Customer ID</TableHead>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Lot Number</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Ward</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Contact Info</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item: CustomerLot) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>{item.customer_id}</TableCell>
                      <TableCell>{item.customer_name}</TableCell>
                      <TableCell>{item.lot_number}</TableCell>
                      <TableCell>{item.section}</TableCell>
                      <TableCell>{item.ward}</TableCell>
                      <TableCell>{item.address}</TableCell>
                      <TableCell>{item.contact_info}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default DataSourcesPage;
