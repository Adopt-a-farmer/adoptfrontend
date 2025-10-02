import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, DollarSign, Users, Calendar, TrendingUp, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { reportService } from '@/services/reportService';
import { toast } from 'sonner';

const AdminReports = () => {
  const [period, setPeriod] = useState('month');
  const [reportType, setReportType] = useState('overview');
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: reportData, isLoading, error, refetch } = useQuery({
    queryKey: ['adminReport', period, reportType],
    queryFn: () => reportService.generateAdminReport(period, reportType),
  });

  const report = reportData?.data;

  const handleDownloadCSV = async () => {
    setIsDownloading(true);
    try {
      await reportService.downloadAdminReportCSV(period, reportType);
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download report');
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load report</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Platform Reports</h2>
          <p className="text-gray-500 mt-1">View and download platform-wide reports</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={(value) => setPeriod(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleDownloadCSV}
            disabled={isDownloading}
            className="bg-green-600 hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-2" />
            {isDownloading ? 'Downloading...' : 'Download CSV'}
          </Button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <Tabs value={reportType} onValueChange={setReportType}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="visits">Visits</TabsTrigger>
          <TabsTrigger value="yields">Yields</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* User Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                User Summary
              </CardTitle>
              <CardDescription>Platform user statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {report?.overviewSummary?.users?.total || 0}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Farmers</p>
                  <p className="text-2xl font-bold text-green-600">
                    {report?.overviewSummary?.users?.farmers || 0}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Adopters</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {report?.overviewSummary?.users?.adopters || 0}
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Experts</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {report?.overviewSummary?.users?.experts || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    KES {report?.overviewSummary?.financial?.totalRevenue?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Platform Revenue</p>
                  <p className="text-2xl font-bold text-blue-600">
                    KES {report?.overviewSummary?.financial?.platformRevenue?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Payments</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {report?.overviewSummary?.financial?.paymentCount || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Activity Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Adoptions</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {report?.overviewSummary?.activity?.adoptions || 0}
                  </p>
                </div>
                <div className="p-4 bg-teal-50 rounded-lg">
                  <p className="text-sm text-gray-600">Active Adoptions</p>
                  <p className="text-2xl font-bold text-teal-600">
                    {report?.overviewSummary?.activity?.activeAdoptions || 0}
                  </p>
                </div>
                <div className="p-4 bg-pink-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Visits</p>
                  <p className="text-2xl font-bold text-pink-600">
                    {report?.overviewSummary?.activity?.visits || 0}
                  </p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg">
                  <p className="text-sm text-gray-600">Completed Visits</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {report?.overviewSummary?.activity?.completedVisits || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Payment Analytics
              </CardTitle>
              <CardDescription>Detailed payment statistics and breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    KES {report?.paymentsSummary?.totalRevenue?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Platform Revenue</p>
                  <p className="text-2xl font-bold text-blue-600">
                    KES {report?.paymentsSummary?.platformRevenue?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Fees</p>
                  <p className="text-2xl font-bold text-purple-600">
                    KES {report?.paymentsSummary?.totalFees?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Payments</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {report?.paymentsSummary?.totalPayments || 0}
                  </p>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {report?.paymentsSummary?.paymentsByType && (
                  <div>
                    <h4 className="font-semibold mb-3">Payments by Type</h4>
                    <div className="space-y-2">
                      {Object.entries(report.paymentsSummary.paymentsByType).map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="font-medium capitalize">{type}</span>
                          <span className="text-gray-600">{count as number}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {report?.paymentsSummary?.paymentsByStatus && (
                  <div>
                    <h4 className="font-semibold mb-3">Payments by Status</h4>
                    <div className="space-y-2">
                      {Object.entries(report.paymentsSummary.paymentsByStatus).map(([status, count]) => (
                        <div key={status} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="font-medium capitalize">{status}</span>
                          <span className="text-gray-600">{count as number}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Payments */}
              {report?.paymentsSummary?.detailedPayments?.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Recent Payments</h4>
                  <div className="space-y-2">
                    {report.paymentsSummary.detailedPayments.slice(0, 10).map((payment, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-50 rounded gap-2"
                      >
                        <div>
                          <p className="font-medium">{payment.user} ({payment.userRole})</p>
                          <p className="text-sm text-gray-500">
                            {new Date(payment.date).toLocaleDateString()} • {payment.type}
                          </p>
                          <p className="text-xs text-gray-400">Ref: {payment.reference}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            KES {payment.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Fees: KES {payment.fees.toLocaleString()}
                          </p>
                          <span className="inline-block px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            {payment.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visits Tab */}
        <TabsContent value="visits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Visit Analytics
              </CardTitle>
              <CardDescription>Detailed visit statistics and breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Visits</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {report?.visitsSummary?.totalVisits || 0}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-green-600">
                    {report?.visitsSummary?.averageRating?.toFixed(1) || '0.0'} / 5.0
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {report?.visitsSummary?.totalVisits > 0
                      ? Math.round((report?.visitsSummary?.byStatus?.completed || 0) / report.visitsSummary.totalVisits * 100)
                      : 0}%
                  </p>
                </div>
              </div>

              {/* Visit Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {report?.visitsSummary?.byStatus && (
                  <div>
                    <h4 className="font-semibold mb-3">Visits by Status</h4>
                    <div className="space-y-2">
                      {Object.entries(report.visitsSummary.byStatus).map(([status, count]) => (
                        <div key={status} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="font-medium capitalize">{status}</span>
                          <span className="text-gray-600">{count as number}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {report?.visitsSummary?.byVisitorType && (
                  <div>
                    <h4 className="font-semibold mb-3">Visits by Visitor Type</h4>
                    <div className="space-y-2">
                      {Object.entries(report.visitsSummary.byVisitorType).map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="font-medium capitalize">{type}</span>
                          <span className="text-gray-600">{count as number}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Visits */}
              {report?.visitsSummary?.detailedVisits?.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Recent Visits</h4>
                  <div className="space-y-2">
                    {report.visitsSummary.detailedVisits.slice(0, 10).map((visit, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-gray-50 rounded gap-2"
                      >
                        <div>
                          <p className="font-medium">{visit.farmName}</p>
                          <p className="text-sm text-gray-500">
                            Farmer: {visit.farmer} | Visitor: {visit.visitor} ({visit.visitorType})
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(visit.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                            visit.status === 'completed' ? 'bg-green-100 text-green-800' :
                            visit.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {visit.status}
                          </span>
                          {visit.rating && (
                            <p className="text-sm mt-1">
                              <span className="text-yellow-500">★</span> {visit.rating}/5
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Yields Tab */}
        <TabsContent value="yields" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Yield Analytics
              </CardTitle>
              <CardDescription>Platform-wide yield and production statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Yield Records</p>
                  <p className="text-2xl font-bold text-green-600">
                    {report?.yieldsSummary?.totalRecords || 0}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Farmers Reporting</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {report?.yieldsSummary?.farmersReporting || 0}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Yield</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {report?.yieldsSummary?.totalYield?.toLocaleString() || 0}
                  </p>
                </div>
              </div>

              {/* Yield by Crop */}
              {report?.yieldsSummary?.yieldByCrop && Object.keys(report.yieldsSummary.yieldByCrop).length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Yield by Crop</h4>
                  <div className="space-y-2">
                    {Object.entries(report.yieldsSummary.yieldByCrop).map(([crop, data]) => {
                      const cropData = data as { total: number; count: number; unit: string };
                      return (
                        <div key={crop} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="font-medium">{crop}</span>
                          <span className="text-gray-600">
                            {cropData.total.toLocaleString()} {cropData.unit} ({cropData.count} records)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent Yield Records */}
              {report?.yieldsSummary?.detailedYields?.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Recent Yield Records</h4>
                  <div className="space-y-2">
                    {report.yieldsSummary.detailedYields.slice(0, 10).map((yieldRecord, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded"
                      >
                        <div>
                          <p className="font-medium">{yieldRecord.farmName}</p>
                          <p className="text-sm text-gray-500">
                            Farmer: {yieldRecord.farmer} | Crop: {yieldRecord.crop}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(yieldRecord.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">
                            {yieldRecord.amount} {yieldRecord.unit}
                          </p>
                          {yieldRecord.quality && (
                            <span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              {yieldRecord.quality}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminReports;
