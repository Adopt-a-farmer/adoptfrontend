import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Ban
} from 'lucide-react';
import adminService from '@/services/admin';
import { useToast } from '@/hooks/use-toast';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  deactivationReason?: string;
  createdAt: string;
}

interface Profile {
  farmName?: string;
  farmSize?: {
    value: number;
    unit: string;
  };
  farmingType?: string[];
  location?: {
    village: string;
    subCounty: string;
    county: string;
  };
  description?: string;
  specializations?: string[];
  bio?: string;
  experience?: {
    yearsOfExperience: number;
  };
  verificationStatus?: string;
}

interface Document {
  name: string;
  type: string;
  status: string;
  url: string;
}

interface VerificationHistory {
  action: string;
  performedAt: string;
  notes?: string;
}

interface UserDetails {
  user: User;
  profile?: Profile;
  documents?: Document[];
  verificationHistory?: VerificationHistory[];
}

interface UserDetailModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onActionComplete?: () => void;
}

export default function UserDetailModal({
  userId,
  isOpen,
  onClose,
  onActionComplete
}: UserDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [showSuspendForm, setShowSuspendForm] = useState(false);
  const { toast } = useToast();

  const refreshUserDetails = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await adminService.getUserDetails(userId);
      setUserDetails(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch user details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [userId, toast]);

  useEffect(() => {
    if (userId && isOpen) {
      refreshUserDetails();
    }
  }, [userId, isOpen, refreshUserDetails]);

  const handleVerify = async () => {
    if (!userId) return;
    
    setActionLoading(true);
    try {
      await adminService.verifyUser(userId, { isVerified: true });
      toast({
        title: 'Success',
        description: 'User verified successfully'
      });
      onActionComplete?.();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to verify user',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!userId || !rejectReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for rejection',
        variant: 'destructive'
      });
      return;
    }
    
    setActionLoading(true);
    try {
      await adminService.verifyUser(userId, { isVerified: false, notes: rejectReason });
      toast({
        title: 'Success',
        description: 'User rejected'
      });
      setShowRejectForm(false);
      setRejectReason('');
      onActionComplete?.();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reject user',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async (suspend: boolean) => {
    if (!userId) return;
    
    if (suspend && !suspendReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for suspension',
        variant: 'destructive'
      });
      return;
    }
    
    setActionLoading(true);
    try {
      await adminService.suspendUser(userId, suspend, suspendReason);
      toast({
        title: 'Success',
        description: `User ${suspend ? 'suspended' : 'unsuspended'} successfully`
      });
      setShowSuspendForm(false);
      setSuspendReason('');
      refreshUserDetails(); // Refresh data
      onActionComplete?.();
      onActionComplete?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : `Failed to ${suspend ? 'suspend' : 'unsuspend'} user`,
        variant: 'destructive'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadDocument = (url: string, name: string) => {
    window.open(url, '_blank');
  };

  if (!userDetails || loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center h-64">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const { user, profile, documents, verificationHistory } = userDetails;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">User Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Personal Information</span>
                <div className="flex gap-2">
                  <Badge variant={user.isActive ? "default" : "secondary"}>
                    {user.isActive ? 'Active' : 'Suspended'}
                  </Badge>
                  <Badge variant={
                    profile?.verificationStatus === 'verified' ? 'default' :
                    profile?.verificationStatus === 'pending' ? 'secondary' : 'destructive'
                  }>
                    {profile?.verificationStatus || 'Unknown'}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{user.phone || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Joined</p>
                    <p className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {user.deactivationReason && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm font-medium text-red-900">Suspension Reason:</p>
                  <p className="text-sm text-red-700">{user.deactivationReason}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Information */}
          {profile && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {user.role === 'farmer' ? 'Farm' : user.role === 'expert' ? 'Professional' : 'Profile'} Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user.role === 'farmer' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Farm Name</p>
                      <p className="font-medium">{profile.farmName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Farm Size</p>
                      <p className="font-medium">
                        {profile.farmSize?.value} {profile.farmSize?.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Farming Type</p>
                      <p className="font-medium">{profile.farmingType?.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">
                        {profile.location?.village}, {profile.location?.subCounty}, {profile.location?.county}
                      </p>
                    </div>
                    {profile.description && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">Description</p>
                        <p className="font-medium">{profile.description}</p>
                      </div>
                    )}
                  </div>
                )}

                {user.role === 'expert' && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Specializations</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {profile.specializations?.map((spec: string, idx: number) => (
                          <Badge key={idx} variant="secondary">{spec}</Badge>
                        ))}
                      </div>
                    </div>
                    {profile.bio && (
                      <div>
                        <p className="text-sm text-gray-500">Bio</p>
                        <p className="font-medium">{profile.bio}</p>
                      </div>
                    )}
                    {profile.experience?.yearsOfExperience && (
                      <div>
                        <p className="text-sm text-gray-500">Years of Experience</p>
                        <p className="font-medium">{profile.experience.yearsOfExperience} years</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {documents && documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Verification Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents.map((doc: Document, idx: number) => (
                    <div key={idx} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <FileText className="h-8 w-8 text-gray-500" />
                        <Badge variant={
                          doc.status === 'approved' || doc.status === 'verified' ? 'default' :
                          doc.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {doc.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{doc.type.replace('_', ' ')}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => handleDownloadDocument(doc.url, doc.name)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        View Document
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Verification History */}
          {verificationHistory && verificationHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Verification History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {verificationHistory.map((history: VerificationHistory, idx: number) => (
                    <div key={idx} className="border-l-4 border-gray-300 pl-4 py-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium capitalize">{history.action}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(history.performedAt).toLocaleString()}
                        </p>
                      </div>
                      {history.notes && (
                        <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Verification Actions */}
                {profile?.verificationStatus === 'pending' && (
                  <div className="flex gap-3">
                    <Button
                      onClick={handleVerify}
                      disabled={actionLoading}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve User
                    </Button>
                    <Button
                      onClick={() => setShowRejectForm(!showRejectForm)}
                      disabled={actionLoading}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject User
                    </Button>
                  </div>
                )}

                {/* Reject Form */}
                {showRejectForm && (
                  <div className="space-y-3 p-4 bg-red-50 rounded-lg">
                    <label className="block text-sm font-medium">Rejection Reason</label>
                    <Textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Provide a detailed reason for rejection..."
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleReject}
                        disabled={actionLoading || !rejectReason.trim()}
                        variant="destructive"
                        size="sm"
                      >
                        Confirm Rejection
                      </Button>
                      <Button
                        onClick={() => {
                          setShowRejectForm(false);
                          setRejectReason('');
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Suspend/Unsuspend Actions */}
                <div className="border-t pt-4">
                  {user.isActive ? (
                    <div className="space-y-3">
                      <Button
                        onClick={() => setShowSuspendForm(!showSuspendForm)}
                        disabled={actionLoading}
                        variant="outline"
                        className="w-full border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Suspend User Account
                      </Button>

                      {showSuspendForm && (
                        <div className="space-y-3 p-4 bg-yellow-50 rounded-lg">
                          <label className="block text-sm font-medium">Suspension Reason</label>
                          <Textarea
                            value={suspendReason}
                            onChange={(e) => setSuspendReason(e.target.value)}
                            placeholder="Provide a reason for suspension..."
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleSuspend(true)}
                              disabled={actionLoading || !suspendReason.trim()}
                              variant="destructive"
                              size="sm"
                            >
                              Confirm Suspension
                            </Button>
                            <Button
                              onClick={() => {
                                setShowSuspendForm(false);
                                setSuspendReason('');
                              }}
                              variant="outline"
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleSuspend(false)}
                      disabled={actionLoading}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Unsuspend User Account
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
