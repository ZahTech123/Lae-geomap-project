import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Database,
  Layers,
  MapPin,
  Globe,
  Clock,
  BarChart3,
  PieChart,
  Users,
  DollarSign,
  FileText,
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import {
  fetchPropertiesCount,
  fetchTaxRecordsCount,
  fetchOwnersCount,
  fetchPlanningDataCount,
  fetchTaxRevenueSummary,
  fetchPropertiesWithOwners,
  fetchPropertiesByLandUse,
  fetchZoningDistribution,
  fetchLeaseExpirationStats,
  fetchTopOwners
} from '@/integrations/supabase/services';

const DataDashboard: React.FC = () => {
  const [propertiesCount, setPropertiesCount] = useState<number>(0);
  const [taxRecordsCount, setTaxRecordsCount] = useState<number>(0);
  const [ownersCount, setOwnersCount] = useState<number>(0);
  const [planningDataCount, setPlanningDataCount] = useState<number>(0);
  const [taxSummary, setTaxSummary] = useState<any>(null);
  const [ownershipData, setOwnershipData] = useState<any>(null);
  const [landUseData, setLandUseData] = useState<any[]>([]);
  const [zoningData, setZoningData] = useState<any[]>([]);
  const [leaseStats, setLeaseStats] = useState<any>(null);
  const [topOwners, setTopOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [
        propCount,
        taxCount,
        ownerCount,
        planningCount,
        taxSummaryData,
        ownershipInfo,
        landUse,
        zoning,
        leases,
        owners
      ] = await Promise.all([
        fetchPropertiesCount(),
        fetchTaxRecordsCount(),
        fetchOwnersCount(),
        fetchPlanningDataCount(),
        fetchTaxRevenueSummary(),
        fetchPropertiesWithOwners(),
        fetchPropertiesByLandUse(),
        fetchZoningDistribution(),
        fetchLeaseExpirationStats(),
        fetchTopOwners(5)
      ]);

      setPropertiesCount(propCount || 0);
      setTaxRecordsCount(taxCount || 0);
      setOwnersCount(ownerCount || 0);
      setPlanningDataCount(planningCount || 0);
      setTaxSummary(taxSummaryData);
      setOwnershipData(ownershipInfo);
      setLandUseData(landUse || []);
      setZoningData(zoning || []);
      setLeaseStats(leases);
      setTopOwners(owners || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PGK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const mainStats = [
    {
      title: 'Total Properties',
      value: formatNumber(propertiesCount),
      change: ownershipData ? `${((ownershipData.propertiesWithOwners / propertiesCount) * 100).toFixed(0)}% with owners` : '',
      changeType: 'positive' as const,
      icon: MapPin,
      description: 'Registered properties'
    },
    {
      title: 'Tax Revenue',
      value: taxSummary ? formatCurrency(taxSummary.totalRevenue) : 'K0',
      change: taxSummary ? `${taxSummary.collectionRate.toFixed(1)}% collected` : '',
      changeType: taxSummary && taxSummary.collectionRate >= 70 ? 'positive' as const : 'neutral' as const,
      icon: DollarSign,
      description: 'Total tax revenue'
    },
    {
      title: 'Property Owners',
      value: formatNumber(ownersCount),
      change: `${formatNumber(propertiesCount)} properties`,
      changeType: 'positive' as const,
      icon: Users,
      description: 'Registered owners'
    },
    {
      title: 'Planning Records',
      value: formatNumber(planningDataCount),
      change: `${((planningDataCount / propertiesCount) * 100).toFixed(0)}% coverage`,
      changeType: 'neutral' as const,
      icon: FileText,
      description: 'Zoning & permits'
    }
  ];

  // Prepare data for visualizations
  const layerData = [
    { name: 'Properties', features: propertiesCount, status: 'active' },
    { name: 'Owners', features: ownersCount, status: 'active' },
    { name: 'Tax Records', features: taxRecordsCount, status: 'active' },
    { name: 'Planning Data', features: planningDataCount, status: 'active' },
  ];

  const taxDistribution = taxSummary ? [
    { name: 'Collected', value: taxSummary.paidAmount, color: '#10b981', percentage: (taxSummary.paidAmount / taxSummary.totalRevenue) * 100 },
    { name: 'Outstanding', value: taxSummary.unpaidAmount, color: '#ef4444', percentage: (taxSummary.unpaidAmount / taxSummary.totalRevenue) * 100 },
  ] : [];

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Municipal Data Dashboard</h1>
          <p className="text-muted-foreground">Monitor urban infrastructure and municipal services</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-gis-success border-gis-success/30">
            <Globe className="h-3 w-3 mr-1" />
            System Online
          </Badge>
          <Badge variant="outline" className="border-border">
            <Clock className="h-3 w-3 mr-1" />
            Last updated: 2 min ago
          </Badge>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, index) => (
          <Card key={index} className="bg-card border-border shadow-panel">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="w-12 h-12 bg-gis-accent/20 rounded-lg flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-gis-accent" />
                  </div>
                  {stat.change && (
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${
                        stat.changeType === 'positive' 
                          ? 'text-gis-success bg-gis-success/20 border-gis-success/30' 
                          : 'text-muted-foreground bg-muted/20'
                      }`}
                    >
                      {stat.change}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Ownership Analysis */}
        <Card className="bg-card border-border shadow-panel">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-gis-accent" />
              Property Ownership
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ownershipData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gis-panel rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Properties with Owners</p>
                    <p className="text-2xl font-bold text-gis-success">{formatNumber(ownershipData.propertiesWithOwners)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gis-success">
                      {((ownershipData.propertiesWithOwners / ownershipData.totalProperties) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gis-panel rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Properties without Owners</p>
                    <p className="text-2xl font-bold text-amber-500">{formatNumber(ownershipData.propertiesWithoutOwners)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-amber-500">
                      {((ownershipData.propertiesWithoutOwners / ownershipData.totalProperties) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <Progress 
                  value={(ownershipData.propertiesWithOwners / ownershipData.totalProperties) * 100} 
                  className="h-3"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Ownership coverage across {formatNumber(ownershipData.totalProperties)} properties
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Loading ownership data...</p>
            )}
          </CardContent>
        </Card>

        {/* Tax Revenue Analysis */}
        <Card className="bg-card border-border shadow-panel">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-gis-accent" />
              Tax Revenue Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {taxSummary ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gis-panel rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Collected Revenue</p>
                    <p className="text-2xl font-bold text-gis-success">{formatCurrency(taxSummary.paidAmount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gis-success">
                      {taxSummary.collectionRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gis-panel rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Outstanding Tax</p>
                    <p className="text-2xl font-bold text-red-500">{formatCurrency(taxSummary.unpaidAmount)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-red-500">
                      {((taxSummary.unpaidAmount / taxSummary.totalRevenue) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <Progress 
                  value={taxSummary.collectionRate} 
                  className="h-3"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Total Revenue: {formatCurrency(taxSummary.totalRevenue)} from {formatNumber(taxSummary.totalRecords)} records
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Loading tax revenue data...</p>
            )}
          </CardContent>
        </Card>

        {/* Land Use Distribution */}
        <Card className="bg-card border-border shadow-panel">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <PieChart className="h-5 w-5 text-gis-accent" />
              Land Use Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {landUseData.slice(0, 6).map((item, index) => {
                const colors = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];
                const color = colors[index % colors.length];
                const total = landUseData.reduce((sum, i) => sum + i.count, 0);
                const percentage = ((item.count / total) * 100).toFixed(1);
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-sm font-medium">{item.land_use}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{formatNumber(item.count)} ({percentage}%)</span>
                    </div>
                    <Progress value={parseFloat(percentage)} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Lease Management */}
        <Card className="bg-card border-border shadow-panel">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gis-accent" />
              Lease Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaseStats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gis-panel rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Total Leases</p>
                    <p className="text-3xl font-bold text-foreground">{formatNumber(leaseStats.totalLeases)}</p>
                  </div>
                  <div className="text-center p-4 bg-gis-panel rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Active</p>
                    <p className="text-3xl font-bold text-gis-success">{formatNumber(leaseStats.activeLeases)}</p>
                  </div>
                  <div className="text-center p-4 bg-gis-panel rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Expiring Soon</p>
                    <p className="text-3xl font-bold text-amber-500">{formatNumber(leaseStats.expiringSoon)}</p>
                  </div>
                </div>
                {leaseStats.expiringSoon > 0 && (
                  <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Attention Required</p>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(leaseStats.expiringSoon)} lease(s) expiring within 5 years
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Loading lease data...</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Layer Usage */}
        <Card className="bg-card border-border shadow-panel">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-gis-accent" />
              Data Layer Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {layerData.map((layer, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gis-panel rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-gis-accent" />
                    <div>
                      <p className="font-medium text-foreground">{layer.name}</p>
                      <p className="text-sm text-muted-foreground">{formatNumber(layer.features)} records</p>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary"
                    className="text-gis-success bg-gis-success/20 border-gis-success/30"
                  >
                    {layer.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Property Owners */}
        <Card className="bg-card border-border shadow-panel">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-gis-accent" />
              Top Property Owners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topOwners.map((owner, index) => {
                const maxCount = topOwners[0]?.property_count || 1;
                const percentage = (owner.property_count / maxCount) * 100;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium truncate max-w-[70%]">{owner.owner_name}</span>
                      <span className="text-sm text-muted-foreground">{formatNumber(owner.property_count)} properties</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Zoning Distribution (if data exists) */}
      {zoningData.length > 0 && (
        <Card className="bg-card border-border shadow-panel">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Layers className="h-5 w-5 text-gis-accent" />
              Zoning Code Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {zoningData.slice(0, 12).map((zone, index) => (
                <div key={index} className="text-center p-4 bg-gis-panel rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">{zone.zoning_code}</p>
                  <p className="text-2xl font-bold text-foreground">{formatNumber(zone.count)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DataDashboard;
