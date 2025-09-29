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
  LineChart
} from 'lucide-react';
import {
  fetchPropertiesCount,
  fetchTaxRecordsCount,
  fetchCustomerLotsCount,
  fetchBuildingFootprintsCount
} from '@/integrations/supabase/services';

const DataDashboard: React.FC = () => {
  const [propertiesCount, setPropertiesCount] = useState<number | null>(null);
  const [taxRecordsCount, setTaxRecordsCount] = useState<number | null>(null);
  const [customerLotsCount, setCustomerLotsCount] = useState<number | null>(null);
  const [buildingFootprintsCount, setBuildingFootprintsCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [
        propCount,
        taxCount,
        customerCount,
        buildingCount
      ] = await Promise.all([
        fetchPropertiesCount(),
        fetchTaxRecordsCount(),
        fetchCustomerLotsCount(),
        fetchBuildingFootprintsCount()
      ]);

      setPropertiesCount(propCount);
      setTaxRecordsCount(taxCount);
      setCustomerLotsCount(customerCount);
      setBuildingFootprintsCount(buildingCount);
      setLoading(false);
    };

    fetchData();
  }, []);

  const totalLayers = (propertiesCount || 0) + (taxRecordsCount || 0) + (customerLotsCount || 0) + (buildingFootprintsCount || 0);
  const totalFeatures = (propertiesCount || 0) + (buildingFootprintsCount || 0); // Assuming properties and building footprints are primary geographic features

  // Sample data for charts (will be updated with real data where possible)
  const layerData = [
    { name: 'Properties', features: propertiesCount || 0, status: 'active' },
    { name: 'Tax Records', features: taxRecordsCount || 0, status: 'active' },
    { name: 'Customer Lots', features: customerLotsCount || 0, status: 'active' },
    { name: 'Building Footprints', features: buildingFootprintsCount || 0, status: 'active' },
    // POI, Boundaries, Water are placeholders for now, or could be derived from other data sources
    { name: 'POI', features: 5634, status: 'inactive' },
    { name: 'Boundaries', features: 3421, status: 'active' },
    { name: 'Water', features: 2876, status: 'active' },
  ];

  const usageData = [
    { day: 'Mon', views: 240, exports: 45 },
    { day: 'Tue', views: 300, exports: 67 },
    { day: 'Wed', views: 280, exports: 52 },
    { day: 'Thu', views: 390, exports: 78 },
    { day: 'Fri', views: 450, exports: 89 },
    { day: 'Sat', views: 320, exports: 65 },
    { day: 'Sun', views: 270, exports: 48 },
  ];

  const performanceData = [
    { time: '00:00', load: 45, response: 120 },
    { time: '04:00', load: 35, response: 98 },
    { time: '08:00', load: 78, response: 180 },
    { time: '12:00', load: 92, response: 220 },
    { time: '16:00', load: 85, response: 195 },
    { time: '20:00', load: 70, response: 165 },
  ];

  const typeDistribution = [
    { name: 'Vector', value: 45, color: '#0ea5e9' },
    { name: 'Raster', value: 25, color: '#8b5cf6' },
    { name: 'Point', value: 20, color: '#10b981' },
    { name: 'Other', value: 10, color: '#f59e0b' },
  ];

  const stats = [
    {
      title: 'Total Layers',
      value: totalLayers.toLocaleString(),
      change: '+3', // Placeholder
      changeType: 'positive' as const,
      icon: Layers,
      description: 'Active data layers'
    },
    {
      title: 'Features',
      value: totalFeatures.toLocaleString(),
      change: '+12%', // Placeholder
      changeType: 'positive' as const,
      icon: MapPin,
      description: 'Geographic features'
    },
    {
      title: 'Daily Views',
      value: '1,247', // Placeholder
      change: '+8%', // Placeholder
      changeType: 'positive' as const,
      icon: Activity,
      description: 'Map views today'
    },
    {
      title: 'Data Size',
      value: '2.4 GB', // Placeholder
      change: '+150MB', // Placeholder
      changeType: 'neutral' as const,
      icon: Database,
      description: 'Total storage used'
    }
  ];

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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
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
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Layer Usage Chart */}
        <Card className="bg-card border-border shadow-panel">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-gis-accent" />
              Layer Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {layerData.map((layer, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{layer.name}</span>
                    <span className="text-sm text-muted-foreground">{layer.features.toLocaleString()}</span>
                  </div>
                  <Progress value={(layer.features / 12453) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Type Distribution */}
        <Card className="bg-card border-border shadow-panel">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <PieChart className="h-5 w-5 text-gis-accent" />
              Data Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {typeDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{item.value}%</span>
                    <Progress value={item.value} className="w-20 h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Usage Trends */}
        <Card className="bg-card border-border shadow-panel">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <LineChart className="h-5 w-5 text-gis-accent" />
              Weekly Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {usageData.map((day, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{day.day}</span>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Views: {day.views}</span>
                      <span>Exports: {day.exports}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Progress value={(day.views / 450) * 100} className="flex-1 h-2" />
                    <Progress value={(day.exports / 89) * 100} className="flex-1 h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Performance */}
        <Card className="bg-card border-border shadow-panel">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-gis-accent" />
              System Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.time}</span>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Load: {item.load}%</span>
                      <span>Response: {item.response}ms</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Progress value={item.load} className="flex-1 h-2" />
                    <Progress value={(item.response / 220) * 100} className="flex-1 h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Layer Status Table */}
      <Card className="bg-card border-border shadow-panel">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Database className="h-5 w-5 text-gis-accent" />
            Layer Status
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
                    <p className="text-sm text-muted-foreground">{layer.features.toLocaleString()} features</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Progress value={75} className="w-24" />
                  <Badge 
                    variant="secondary"
                    className={layer.status === 'active' 
                      ? 'text-gis-success bg-gis-success/20 border-gis-success/30'
                      : 'text-muted-foreground bg-muted/20'
                    }
                  >
                    {layer.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataDashboard;
