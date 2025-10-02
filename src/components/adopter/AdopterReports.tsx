import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, DollarSign, Users, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { reportService } from '@/services/reportService';
import { toast } from 'sonner';

const AdopterReports = () => {
  const [period, setPeriod] = useState('month');
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: reportData, isLoading, error, refetch } = useQuery({
    queryKey: ['adopterReport', period],
    queryFn: () => reportService.generateAdopterReport(period),
  });

  const report = reportData?.data;

  const handleDownloadCSV = async () => {
    setIsDownloading(true);
    try {
      await reportService.downloadAdopterReportCSV(period);
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
          <h2 className="text-3xl font-bold text-gray-900">My Impact Reports</h2>
          <p className="text-gray-500 mt-1">View and download your adoption impact reports</p>
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

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Financial Summary
          </CardTitle>
          <CardDescription>Your contribution statistics for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Contributed</p>
              <p className="text-2xl font-bold text-green-600">
                KES {report?.financialSummary?.totalSpent?.toLocaleString() || 0}
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Net Contribution</p>
              <p className="text-2xl font-bold text-blue-600">
                KES {report?.financialSummary?.netContribution?.toLocaleString() || 0}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Transaction Fees</p>
              <p className="text-2xl font-bold text-purple-600">
                KES {report?.financialSummary?.totalFees?.toLocaleString() || 0}
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">Payments Made</p>
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
          <CardDescription>Overview of your farm adoptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-pink-600">
                {report?.adoptionSummary?.completedAdoptions || 0}
              </p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-gray-600">Farmers Supported</p>
              <p className="text-2xl font-bold text-amber-600">
                {report?.adoptionSummary?.farmersSupported || 0}
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
          <CardDescription>Your farm visit statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Your Avg Rating</p>
              <p className="text-2xl font-bold text-blue-600">
                {report?.visitSummary?.averageRating?.toFixed(1) || '0.0'} / 5.0
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      {report?.detailedData?.payments?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Recent Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.detailedData.payments.slice(0, 10).map((payment, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 rounded-lg gap-2"
                >
                  <div className="flex-1">
                    <p className="font-medium">{payment.type}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(payment.date).toLocaleDateString()} • {payment.farmer || 'General'}
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
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        payment.status === 'success'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Visits */}
      {report?.detailedData?.visits?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Farm Visits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.detailedData.visits.slice(0, 10).map((visit, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{visit.farmName}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(visit.date).toLocaleDateString()} • {visit.status}
                    </p>
                    {visit.duration && (
                      <p className="text-xs text-gray-400">{visit.duration} minutes</p>
                    )}
                  </div>
                  {visit.rating && (
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-1 text-lg">★</span>
                      <span className="font-semibold">{visit.rating}/5</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Adopted Farmers */}
      {report?.detailedData?.adoptions?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Adopted Farmers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.detailedData.adoptions.map((adoption, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 rounded-lg gap-2"
                >
                  <div>
                    <p className="font-medium">{adoption.farmName}</p>
                    <p className="text-sm text-gray-500">Farmer: {adoption.farmer}</p>
                    <p className="text-xs text-gray-400">
                      Started: {new Date(adoption.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 text-sm rounded-full ${
                        adoption.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : adoption.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {adoption.status}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">
                      Total Paid: KES {adoption.totalPaid?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdopterReports;
