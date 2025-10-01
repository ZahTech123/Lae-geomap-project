import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { TrendingUp, DollarSign, MapPin, CheckCircle } from 'lucide-react';

interface MapAnalyticsCardsProps {
  propertiesGeoJSON: GeoJSON.FeatureCollection | null;
}

const MapAnalyticsCards: React.FC<MapAnalyticsCardsProps> = ({ propertiesGeoJSON }) => {
  // Calculate statistics from the filtered properties
  const statistics = useMemo(() => {
    if (!propertiesGeoJSON || !propertiesGeoJSON.features.length) {
      return {
        totalProperties: 0,
        totalArea: 0,
        outstandingTax: 0,
        paymentRate: 0,
        paymentData: [],
        sectionData: [],
      };
    }

    let totalArea: number = 0;
    let outstandingTax: number = 0;
    let paidCount: number = 0;
    let unpaidCount: number = 0;
    const sectionCounts: Record<string, { paid: number; unpaid: number }> = {};

    propertiesGeoJSON.features.forEach((feature) => {
      const props = feature.properties;
      if (!props) return;

      // Calculate total area
      const landDetails = props.land_details as any;
      if (landDetails?.area_sq_m) {
        const area = parseFloat(landDetails.area_sq_m.replace(/,/g, ''));
        if (!isNaN(area)) {
          totalArea += area;
        }
      }

      // Calculate payment status
      const paymentStatus = props.payment_status?.toLowerCase();
      if (paymentStatus === 'paid') {
        paidCount++;
      } else if (paymentStatus === 'unpaid') {
        unpaidCount++;
        // Add to outstanding tax if unpaid
        if (props.amount_due) {
          const amountDueStr = String(props.amount_due);
          const amountDueNum = parseFloat(amountDueStr);
          if (!isNaN(amountDueNum) && isFinite(amountDueNum)) {
            outstandingTax += amountDueNum;
          }
        }
      }

      // Count by section
      const section = props.section || 'Unknown';
      if (!sectionCounts[section]) {
        sectionCounts[section] = { paid: 0, unpaid: 0 };
      }
      if (paymentStatus === 'paid') {
        sectionCounts[section].paid++;
      } else if (paymentStatus === 'unpaid') {
        sectionCounts[section].unpaid++;
      }
    });

    const totalProperties = propertiesGeoJSON.features.length;
    const totalWithStatus = paidCount + unpaidCount;
    const paymentRate = totalWithStatus > 0 ? (paidCount / totalWithStatus) * 100 : 0;

    // Prepare payment data for donut chart
    const paymentData = [
      { name: 'Paid', value: paidCount, color: '#10b981' },
      { name: 'Unpaid', value: unpaidCount, color: '#ef4444' },
    ].filter(item => item.value > 0);

    // Prepare section data for bar chart (top 10 sections)
    const sectionData = Object.entries(sectionCounts)
      .map(([section, counts]) => ({
        section: `Section ${section}`,
        paid: counts.paid,
        unpaid: counts.unpaid,
        total: counts.paid + counts.unpaid,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    return {
      totalProperties,
      totalArea,
      outstandingTax,
      paymentRate,
      paymentData,
      sectionData,
    };
  }, [propertiesGeoJSON]);

  // Format number with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(num));
  };

  // Format currency
  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PGK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card backdrop-blur-md border border-border p-3 rounded-lg shadow-lg">
          <p className="text-sm text-foreground font-medium">{payload[0].name}</p>
          <p className="text-lg text-primary font-bold">{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" fontSize={10} textAnchor="middle" dominantBaseline="central">
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="flex gap-4 items-end">
        {/* Card 1: Key Metrics Summary */}
        <div className="backdrop-blur-md bg-card border border-border shadow-lg rounded-lg p-3 hover:shadow-xl transition-shadow duration-300 w-80 h-44 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground">Key Metrics</h3>
            <TrendingUp className="h-4 w-4 text-primary" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Total Properties</span>
              </div>
              <span className="text-base font-bold text-foreground">
                {formatNumber(statistics.totalProperties)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Total Area</span>
              </div>
              <span className="text-base font-bold text-foreground">
                {formatNumber(statistics.totalArea)} m²
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-3 w-3 text-red-500" />
                <span className="text-xs text-muted-foreground">Outstanding Tax</span>
              </div>
              <span className="text-base font-bold text-red-500">
                {formatCurrency(statistics.outstandingTax)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="text-xs text-muted-foreground">Payment Rate</span>
              </div>
              <span className="text-base font-bold text-green-500">
                {statistics.paymentRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Donut Chart - Payment Status */}
        <div className="backdrop-blur-md bg-card border border-border shadow-lg rounded-lg p-3 hover:shadow-xl transition-shadow duration-300 w-72 h-44 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground">Payment Status</h3>
            <DollarSign className="h-4 w-4 text-primary" />
          </div>

          {statistics.paymentData.length > 0 ? (
            <div className="flex items-center justify-between gap-2 flex-1">
              {/* Donut Chart */}
              <div className="w-28 h-28 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statistics.paymentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={28}
                      outerRadius={45}
                      paddingAngle={5}
                      dataKey="value"
                      labelLine={false}
                    >
                      {statistics.paymentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend on the right */}
              <div className="flex flex-col justify-center gap-3 flex-1">
                {statistics.paymentData.map((item) => (
                  <div key={item.name} className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs font-medium text-foreground">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex flex-col ml-5">
                      <span className="text-lg font-bold text-foreground">
                        {item.value}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {((item.value / statistics.paymentData.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-muted-foreground">No payment data available</p>
            </div>
          )}
        </div>

        {/* Card 3: Bar Chart - Properties by Section */}
        <div className="backdrop-blur-md bg-card border border-border shadow-lg rounded-lg p-3 hover:shadow-xl transition-shadow duration-300 w-80 h-44 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-foreground">Properties by Section</h3>
            <MapPin className="h-4 w-4 text-primary" />
          </div>

          {statistics.sectionData.length > 0 ? (
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statistics.sectionData}>
                  <XAxis
                    dataKey="section"
                    stroke="hsl(217, 10%, 64%)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(217, 10%, 64%)"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', color: 'hsl(217, 10%, 64%)' }}
                  />
                  <Bar dataKey="paid" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="unpaid" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center">
              <p className="text-xs text-muted-foreground">No section data available</p>
            </div>
          )}
        </div>
    </div>
  );
};

export default MapAnalyticsCards;
