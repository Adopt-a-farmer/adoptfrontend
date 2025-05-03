
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Users, Leaf, CreditCard, TrendingUp } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalFarmers: 0,
    totalAdopters: 0,
    totalPayments: 0,
    totalRevenue: 0,
  });
  
  const [paymentsData, setPaymentsData] = useState<any[]>([]);
  const [farmersData, setFarmersData] = useState<any[]>([]);
  
  const fetchDashboardData = async () => {
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
      
      // Calculate total revenue
      const totalRevenue = paymentsData?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
      
      setStats({
        totalFarmers: farmersCount || 0,
        totalAdopters: adoptersData?.length || 0,
        totalPayments: paymentsData?.length || 0,
        totalRevenue,
      });
      
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
      
      setPaymentsData(formattedPaymentsData);
      
      // Process farmers data for pie chart
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
      
      setFarmersData(formattedFarmersData);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Farmers</p>
                <p className="text-3xl font-bold">{stats.totalFarmers}</p>
              </div>
              <div className="rounded-full bg-green-100 p-3 text-green-600">
                <Leaf className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Adopters</p>
                <p className="text-3xl font-bold">{stats.totalAdopters}</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Payments</p>
                <p className="text-3xl font-bold">{stats.totalPayments}</p>
              </div>
              <div className="rounded-full bg-purple-100 p-3 text-purple-600">
                <CreditCard className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="rounded-full bg-amber-100 p-3 text-amber-600">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly payment amounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
