import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, FileText, TrendingUp, Calendar, DollarSign, Users, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { reportService } from '@/services/reportService';
import { toast } from 'sonner';

const FarmerReports = () => {
  const [period, setPeriod] = useState('month');
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: reportData, isLoading, error, refetch } = useQuery({
    queryKey: ['farmerReport', period],
    queryFn: () => reportService.generateFarmerReport(period),
  });

  const report = reportData?.data;

  const handleDownloadCSV = async () => {
    setIsDownloading(true);
    try {
      await reportService.downloadFarmerReportCSV(period);
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
          <h2 className="text-3xl font-bold text-gray-900">Farm Reports</h2>
          <p className="text-gray-500 mt-1">View and download your farm performance reports</p>
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

      {/* Farm Info */}
      <Card>
        <CardHeader>
          <CardTitle>Farm Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Farm Name</p>
              <p className="font-semibold">{report?.farmer?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-semibold flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {report?.farmer?.location}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Farm Size</p>
              <p className="font-semibold">{report?.farmer?.farmSize}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Crops</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {report?.farmer?.crops?.map((crop, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  {crop}
                </span>
              ))}
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
          <CardDescription>Revenue and payment statistics for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                KES {report?.financialSummary?.totalRevenue?.toLocaleString() || 0}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Net Revenue</p>
              <p className="text-2xl font-bold text-blue-600">
                KES {report?.financialSummary?.netRevenue?.toLocaleString() || 0}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Fees</p>
              <p className="text-2xl font-bold text-purple-600">
                KES {report?.financialSummary?.totalFees?.toLocaleString() || 0}
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">Payments</p>
              <p className="text-2xl font-bold text-orange-600">
                {report?.financialSummary?.paymentCount || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adoption Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Adoption Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-indigo-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Adoptions</p>
              <p className="text-2xl font-bold text-indigo-600">
                {report?.adoptionSummary?.totalAdoptions || 0}
              </p>
            </div>
            <div className="p-4 bg-teal-50 rounded-lg">
              <p className="text-sm text-gray-600">Active Adoptions</p>
              <p className="text-2xl font-bold text-teal-600">
                {report?.adoptionSummary?.activeAdoptions || 0}
              </p>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg">
              <p className="text-sm text-gray-600">Avg per Adoption</p>
              <p className="text-2xl font-bold text-pink-600">
                KES {Math.round(report?.adoptionSummary?.averageFundingPerAdoption || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visit Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Visit Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Visits</p>
              <p className="text-2xl font-bold">{report?.visitSummary?.totalVisits || 0}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {report?.visitSummary?.completedVisits || 0}
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {report?.visitSummary?.pendingVisits || 0}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-blue-600">
                {report?.visitSummary?.averageSatisfaction?.toFixed(1) || '0.0'} / 5.0
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Yield Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Yield Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Yield</p>
              <p className="text-2xl font-bold text-amber-600">
                {report?.yieldSummary?.totalYield?.toLocaleString() || 0}
              </p>
            </div>
            <div className="p-4 bg-lime-50 rounded-lg">
              <p className="text-sm text-gray-600">Yield Records</p>
              <p className="text-2xl font-bold text-lime-600">
                {report?.yieldSummary?.yieldRecords || 0}
              </p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-lg">
              <p className="text-sm text-gray-600">Average Yield</p>
              <p className="text-2xl font-bold text-emerald-600">
                {Math.round(report?.yieldSummary?.averageYield || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {report?.yieldSummary?.yieldByCrop && Object.keys(report.yieldSummary.yieldByCrop).length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Yield by Crop</h4>
              <div className="space-y-2">
                {Object.entries(report.yieldSummary.yieldByCrop).map(([crop, data]) => {
                  const yieldInfo = data as { total: number; count: number; unit: string };
                  return (
                    <div key={crop} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="font-medium">{crop}</span>
                      <span className="text-gray-600">
                        {yieldInfo.total.toLocaleString()} {yieldInfo.unit} ({yieldInfo.count} records)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Recent Payments */}
            {report?.detailedData?.payments?.slice(0, 5).length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Recent Payments</h4>
                <div className="space-y-2">
                  {report.detailedData.payments.slice(0, 5).map((payment, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{payment.from}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(payment.date).toLocaleDateString()} - {payment.type}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          KES {payment.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Net: KES {payment.netAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Visits */}
            {report?.detailedData?.visits?.slice(0, 5).length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Recent Visits</h4>
                <div className="space-y-2">
                  {report.detailedData.visits.slice(0, 5).map((visit, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{visit.visitor}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(visit.date).toLocaleDateString()} - {visit.status}
                        </p>
                      </div>
                      {visit.rating && (
                        <div className="flex items-center">
                          <span className="text-yellow-500 mr-1">★</span>
                          <span className="font-semibold">{visit.rating}/5</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FarmerReports;
