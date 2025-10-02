import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Users, Calendar, Award, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { reportService } from '@/services/reportService';
import { toast } from 'sonner';

const ExpertReports = () => {
  const [period, setPeriod] = useState('month');
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: reportData, isLoading, error, refetch } = useQuery({
    queryKey: ['expertReport', period],
    queryFn: () => reportService.generateExpertReport(period),
  });

  const report = reportData?.data;

  const handleDownloadCSV = async () => {
    setIsDownloading(true);
    try {
      await reportService.downloadExpertReportCSV(period);
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
          <h2 className="text-3xl font-bold text-gray-900">Expert Impact Reports</h2>
          <p className="text-gray-500 mt-1">View and download your mentorship and consultation reports</p>
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

      {/* Expert Info */}
      <Card>
        <CardHeader>
          <CardTitle>Expert Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-semibold">{report?.expert?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Years of Experience</p>
              <p className="font-semibold">{report?.expert?.yearsOfExperience || 'N/A'}</p>
            </div>
          </div>
          {report?.expert?.specializations && report.expert.specializations.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">Specializations</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {report.expert.specializations.map((spec, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mentorship Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Mentorship Summary
          </CardTitle>
          <CardDescription>Overview of your mentorship activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Mentorships</p>
              <p className="text-2xl font-bold text-blue-600">
                {report?.mentorshipSummary?.totalMentorships || 0}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Active Mentorships</p>
              <p className="text-2xl font-bold text-green-600">
                {report?.mentorshipSummary?.activeMentorships || 0}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-purple-600">
                {report?.mentorshipSummary?.completedMentorships || 0}
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">Farmers Helped</p>
              <p className="text-2xl font-bold text-orange-600">
                {report?.mentorshipSummary?.farmersHelped || 0}
              </p>
            </div>
          </div>
          {report?.mentorshipSummary?.averageRating > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600">Average Rating</p>
              <div className="flex items-center mt-1">
                <span className="text-yellow-500 text-2xl mr-2">★</span>
                <span className="text-2xl font-bold text-yellow-600">
                  {report.mentorshipSummary.averageRating.toFixed(1)} / 5.0
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visit Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Visit Summary
          </CardTitle>
          <CardDescription>Your farm consultation visit statistics</CardDescription>
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
              <p className="text-sm text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-blue-600">
                {report?.visitSummary?.averageRating?.toFixed(1) || '0.0'} / 5.0
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Impact Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Impact Metrics
          </CardTitle>
          <CardDescription>Your overall impact on the farming community</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-indigo-50 rounded-lg">
              <p className="text-sm text-gray-600">Farmers Reached</p>
              <p className="text-2xl font-bold text-indigo-600">
                {report?.impactMetrics?.farmersReached || 0}
              </p>
            </div>
            <div className="p-4 bg-teal-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-teal-600">
                {report?.impactMetrics?.totalSessions || 0}
              </p>
            </div>
            <div className="p-4 bg-pink-50 rounded-lg">
              <p className="text-sm text-gray-600">Knowledge Areas</p>
              <p className="text-2xl font-bold text-pink-600">
                {report?.impactMetrics?.knowledgeAreasShared || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Mentorships */}
      {report?.detailedData?.mentorships?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Recent Mentorships
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {report.detailedData.mentorships.map((mentorship, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 rounded-lg gap-2"
                >
                  <div className="flex-1">
                    <p className="font-medium">{mentorship.farmName}</p>
                    <p className="text-sm text-gray-500">Farmer: {mentorship.farmer}</p>
                    <p className="text-xs text-gray-400">
                      Started: {new Date(mentorship.startDate).toLocaleDateString()}
                    </p>
                    {mentorship.focusAreas && mentorship.focusAreas.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {mentorship.focusAreas.map((area, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs"
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 text-sm rounded-full mb-2 ${
                        mentorship.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : mentorship.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {mentorship.status}
                    </span>
                    {mentorship.sessionsCompleted > 0 && (
                      <p className="text-sm text-gray-600">
                        {mentorship.sessionsCompleted} sessions
                      </p>
                    )}
                    {mentorship.rating && (
                      <div className="flex items-center justify-end mt-1">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span className="font-semibold">{mentorship.rating}/5</span>
                      </div>
                    )}
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
              {report.detailedData.visits.map((visit, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-gray-50 rounded-lg gap-2"
                >
                  <div>
                    <p className="font-medium">{visit.farmName}</p>
                    <p className="text-sm text-gray-500">Farmer: {visit.farmer}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(visit.date).toLocaleDateString()}
                    </p>
                    {visit.purpose && (
                      <p className="text-sm text-gray-600 mt-1">{visit.purpose}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 text-sm rounded-full mb-2 ${
                        visit.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : visit.status === 'confirmed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {visit.status}
                    </span>
                    {visit.duration && (
                      <p className="text-xs text-gray-500">{visit.duration} mins</p>
                    )}
                    {visit.rating && (
                      <div className="flex items-center justify-end mt-1">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span className="font-semibold">{visit.rating}/5</span>
                      </div>
                    )}
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

export default ExpertReports;
