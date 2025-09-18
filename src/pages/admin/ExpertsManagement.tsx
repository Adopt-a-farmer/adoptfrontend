import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle,
  GraduationCap,
  FileText,
  Mail,
  Phone,
  Calendar,
  Award,
  Star,
  Download,
  Eye
} from 'lucide-react';
import { adminService } from '@/services/admin';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';

const ExpertsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();
  
  // Fetch experts data using admin service
  const { data: expertsData, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-experts', currentPage, searchTerm, statusFilter],
    queryFn: () => adminService.getAllExperts({
      page: currentPage,
      limit: 20,
      search: searchTerm || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined
    }),
    keepPreviousData: true
  });

  const experts = Array.isArray(expertsData?.data) ? expertsData.data : [];

  const handleVerifyExpert = async (expertId: string, status: string, notes?: string) => {
    try {
      await adminService.verifyExpert(expertId, { status, notes });
      refetch();
      toast({
        title: 'Success',
        description: `Expert ${status === 'verified' ? 'verified' : 'rejected'} successfully`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update expert status',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-3 w-3" />;
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'rejected':
        return <XCircle className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Experts Management</h1>
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Experts</h3>
            <p className="text-muted-foreground mb-4">Unable to load expert data. Please try again.</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Experts Management</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Experts</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expertsData?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Registered experts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {experts.length > 0 ? experts.filter(e => e.verificationStatus === 'verified').length : 0}
            </div>
            <p className="text-xs text-muted-foreground">Verified experts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {experts.length > 0 ? experts.filter(e => e.verificationStatus === 'pending').length : 0}
            </div>
            <p className="text-xs text-muted-foreground">Pending verification</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {experts.length > 0 ? experts.filter(e => e.isActive).length : 0}
            </div>
            <p className="text-xs text-muted-foreground">Active experts</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Experts</CardTitle>
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search experts..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-60 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : experts.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Experts Found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'No experts match your search criteria.' : 'No experts have registered yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {experts.map((expert) => (
                <Card key={expert._id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                          <GraduationCap className="h-8 w-8 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold">
                              {expert.user?.firstName} {expert.user?.lastName}
                            </h3>
                            <Badge className={getStatusColor(expert.verificationStatus)}>
                              {getStatusIcon(expert.verificationStatus)}
                              <span className="ml-1">
                                {expert.verificationStatus.charAt(0).toUpperCase() + expert.verificationStatus.slice(1)}
                              </span>
                            </Badge>
                            {!expert.isActive && (
                              <Badge variant="outline" className="bg-gray-100 text-gray-800">
                                Inactive
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div className="space-y-1">
                              <p className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <strong>Email:</strong> {expert.user?.email}
                              </p>
                              <p className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <strong>Phone:</strong> {expert.user?.phone || 'Not provided'}
                              </p>
                              <p className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <strong>Joined:</strong> {new Date(expert.createdAt).toLocaleDateString()}
                              </p>
                              <p className="flex items-center gap-2">
                                <Award className="h-4 w-4" />
                                <strong>Experience:</strong> {expert.experience?.yearsOfExperience || 0} years
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p><strong>Specializations:</strong> {expert.specializations?.join(', ') || 'None'}</p>
                              <p><strong>Education:</strong> {expert.experience?.education?.length || 0} degrees</p>
                              <p><strong>Certifications:</strong> {expert.experience?.certifications?.length || 0} certs</p>
                              <p className="flex items-center gap-2">
                                <Star className="h-4 w-4" />
                                <strong>Rating:</strong> {expert.statistics?.averageRating || 0}/5
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 min-w-[120px]">
                        {expert.verificationStatus === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleVerifyExpert(expert._id, 'verified')}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Verify
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerifyExpert(expert._id, 'rejected')}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {expert.verificationStatus === 'verified' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerifyExpert(expert._id, 'pending')}
                          >
                            Unverify
                          </Button>
                        )}
                        {expert.verificationStatus === 'rejected' && (
                          <Button
                            size="sm"
                            onClick={() => handleVerifyExpert(expert._id, 'verified')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Verify Now
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      {expert.bio && (
                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground">
                            <strong>Bio:</strong> {expert.bio}
                          </p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-blue-900">Mentorship Stats</p>
                          <p className="text-xs text-blue-700">Total: {expert.statistics?.totalMentorships || 0}</p>
                          <p className="text-xs text-blue-700">Active: {expert.statistics?.activeMentorships || 0}</p>
                          <p className="text-xs text-blue-700">Rating: {expert.statistics?.averageRating || 0}/5</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-green-900">Qualifications</p>
                          <p className="text-xs text-green-700">Experience: {expert.experience?.yearsOfExperience || 0} years</p>
                          <p className="text-xs text-green-700">Education: {expert.experience?.education?.length || 0} degrees</p>
                          <p className="text-xs text-green-700">Certs: {expert.experience?.certifications?.length || 0}</p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-purple-900">Documents</p>
                          <p className="text-xs text-purple-700">
                            Uploaded: {expert.verificationDocuments?.length || 0}
                          </p>
                          <p className="text-xs text-purple-700">
                            Approved: {expert.verificationDocuments?.filter(doc => doc.status === 'approved').length || 0}
                          </p>
                          <p className="text-xs text-purple-700">Status: {expert.isActive ? 'Active' : 'Inactive'}</p>
                        </div>
                      </div>

                      {/* Education */}
                      {expert.experience?.education && expert.experience.education.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" />
                            Education
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {expert.experience.education.map((edu, index) => (
                              <div key={index} className="p-2 bg-gray-50 rounded">
                                <p className="font-medium text-sm">{edu.degree} in {edu.field}</p>
                                <p className="text-xs text-muted-foreground">{edu.institution} ({edu.year})</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Certifications */}
                      {expert.experience?.certifications && expert.experience.certifications.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            Certifications
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {expert.experience.certifications.map((cert, index) => (
                              <div key={index} className="p-2 bg-gray-50 rounded">
                                <p className="font-medium text-sm">{cert.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {cert.issuingOrganization} - {new Date(cert.issueDate).getFullYear()}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Verification Documents */}
                      {expert.verificationDocuments && expert.verificationDocuments.length > 0 && (
                        <div className="border-t pt-4">
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Verification Documents
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {expert.verificationDocuments.map((doc, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-gray-600" />
                                  <div>
                                    <p className="text-sm font-medium">{doc.fileName}</p>
                                    <p className="text-xs text-muted-foreground">{doc.type}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className={
                                    doc.status === 'approved' ? 'bg-green-50 text-green-700' :
                                    doc.status === 'rejected' ? 'bg-red-50 text-red-700' :
                                    'bg-yellow-50 text-yellow-700'
                                  }>
                                    {doc.status}
                                  </Badge>
                                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Specializations */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {expert.specializations?.map((spec, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpertsManagement;