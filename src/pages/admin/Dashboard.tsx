
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Users, Leaf, CreditCard, TrendingUp, Package } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const fetchDashboardStats = async () => {
  try {
    // Get farmers count
    const { count: farmersCount } = await supabase
      .from('farmers')
      .select('*', { count: 'exact', head: true });
    
    // Get adopters count
    const { data: adoptersData } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'adopter');
    
    // Get payments data
    const { data: paymentsData } = await supabase
      .from('payments')
      .select('*');
    
    // Get suppliers count
    const { count: suppliersCount } = await supabase
      .from('suppliers')
      .select('*', { count: 'exact', head: true });
    
    // Calculate total revenue
    const totalRevenue = paymentsData?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
    
    return {
      totalFarmers: farmersCount || 0,
      totalAdopters: adoptersData?.length || 0,
      totalPayments: paymentsData?.length || 0,
      totalRevenue,
      totalSuppliers: suppliersCount || 0
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

const fetchPaymentsData = async () => {
  try {
    const { data: paymentsData } = await supabase
      .from('payments')
      .select('*');
    
    // Process payments data for charts
    const paymentsByMonth: Record<string, number> = {};
    paymentsData?.forEach(payment => {
      const date = new Date(payment.payment_date);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      paymentsByMonth[monthYear] = (paymentsByMonth[monthYear] || 0) + payment.amount;
    });
    
    const formattedPaymentsData = Object.keys(paymentsByMonth).map(key => ({
      name: key,
      amount: paymentsByMonth[key]
    }));
    
    return formattedPaymentsData.sort((a, b) => {
      // Sort by date (assuming format is "MMM YYYY")
      const dateA = new Date(a.name);
      const dateB = new Date(b.name);
      return dateA.getTime() - dateB.getTime();
    });
  } catch (error) {
    console.error('Error fetching payments data:', error);
    throw error;
  }
};

const fetchFarmersData = async () => {
  try {
    const { data: farmersWithFunding } = await supabase
      .from('farmers')
      .select('location, fundingraised');
    
    const fundingByLocation: Record<string, number> = {};
    farmersWithFunding?.forEach(farmer => {
      fundingByLocation[farmer.location] = (fundingByLocation[farmer.location] || 0) + farmer.fundingraised;
    });
    
    const formattedFarmersData = Object.keys(fundingByLocation).map(key => ({
      name: key,
      value: fundingByLocation[key]
    }));
    
    return formattedFarmersData;
  } catch (error) {
    console.error('Error fetching farmers data:', error);
    throw error;
  }
};

const generateMonthlyGrowthData = (paymentsData: any[]) => {
  if (!paymentsData.length) return [];
  
  // Convert to monthly growth percentages
  const growthData = [];
  for (let i = 1; i < paymentsData.length; i++) {
    const prevAmount = paymentsData[i-1].amount;
    const currentAmount = paymentsData[i].amount;
    const growthPercent = prevAmount > 0 ? ((currentAmount - prevAmount) / prevAmount) * 100 : 100;
    
    growthData.push({
      name: paymentsData[i].name,
      growth: Math.round(growthPercent * 100) / 100
    });
  }
  
  return growthData;
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats
  });
  
  const { data: paymentsData = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['paymentsData'],
    queryFn: fetchPaymentsData
  });
  
  const { data: farmersData = [], isLoading: farmersLoading } = useQuery({
    queryKey: ['farmersData'],
    queryFn: fetchFarmersData
  });
  
  const growthData = generateMonthlyGrowthData(paymentsData);
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="farmers">Farmers</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatsCard 
              title="Total Farmers"
              value={stats?.totalFarmers}
              icon={<Leaf className="h-6 w-6" />}
              iconColor="green"
              isLoading={statsLoading}
            />
            
            <StatsCard 
              title="Total Adopters"
              value={stats?.totalAdopters}
              icon={<Users className="h-6 w-6" />}
              iconColor="blue"
              isLoading={statsLoading}
            />
            
            <StatsCard 
              title="Total Payments"
              value={stats?.totalPayments}
              icon={<CreditCard className="h-6 w-6" />}
              iconColor="purple"
              isLoading={statsLoading}
            />
            
            <StatsCard 
              title="Total Revenue"
              value={stats?.totalRevenue}
              format="currency"
              icon={<TrendingUp className="h-6 w-6" />}
              iconColor="amber"
              isLoading={statsLoading}
            />
            
            <StatsCard 
              title="Total Suppliers"
              value={stats?.totalSuppliers}
              icon={<Package className="h-6 w-6" />}
              iconColor="indigo"
              isLoading={statsLoading}
            />
          </div>
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>Monthly payment amounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {paymentsLoading ? (
                    <div className="h-full w-full flex items-center justify-center">
                      <Skeleton className="h-full w-full" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={paymentsData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 60,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end" 
                          height={60}
                        />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value}`} />
                        <Bar dataKey="amount" fill="#4f46e5" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Funding by Location</CardTitle>
                <CardDescription>Distribution of funds raised per location</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {farmersLoading ? (
                    <div className="h-full w-full flex items-center justify-center">
                      <Skeleton className="h-full w-full" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={farmersData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {farmersData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${value}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="financials">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Growth</CardTitle>
                <CardDescription>Percentage change in revenue month over month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {paymentsLoading ? (
                    <Skeleton className="h-full w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={growthData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 60,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end" 
                          height={60}
                        />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Line 
                          type="monotone" 
                          dataKey="growth" 
                          stroke="#8884d8" 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* More financial charts could go here */}
          </div>
        </TabsContent>
        
        <TabsContent value="farmers">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Farmer Distribution</CardTitle>
                <CardDescription>Geographic distribution of farmers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {farmersLoading ? (
                    <Skeleton className="h-full w-full" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={farmersData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          label
                        >
                          {farmersData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${value}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>New users over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                {statsLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <p className="text-center text-muted-foreground">
                    Detailed user analytics will be available soon
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value?: number;
  format?: 'number' | 'currency' | 'percentage';
  icon: React.ReactNode;
  iconColor: 'blue' | 'green' | 'purple' | 'amber' | 'indigo';
  isLoading?: boolean;
}

const StatsCard = ({ title, value, format = 'number', icon, iconColor, isLoading = false }: StatsCardProps) => {
  const formatValue = () => {
    if (value === undefined) return '';
    
    switch (format) {
      case 'currency':
        return `$${value.toFixed(2)}`;
      case 'percentage':
        return `${value}%`;
      default:
        return value.toString();
    }
  };
  
  const getIconClass = () => {
    const baseClasses = "rounded-full p-3";
    switch (iconColor) {
      case 'blue':
        return `${baseClasses} bg-blue-100 text-blue-600`;
      case 'green':
        return `${baseClasses} bg-green-100 text-green-600`;
      case 'purple':
        return `${baseClasses} bg-purple-100 text-purple-600`;
      case 'amber':
        return `${baseClasses} bg-amber-100 text-amber-600`;
      case 'indigo':
        return `${baseClasses} bg-indigo-100 text-indigo-600`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-600`;
    }
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mt-1" />
            ) : (
              <p className="text-3xl font-bold">{formatValue()}</p>
            )}
          </div>
          <div className={getIconClass()}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
