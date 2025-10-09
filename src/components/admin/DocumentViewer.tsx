import { useState } from 'react';
import { X, Download, ZoomIn, ZoomOut, Check, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiCall } from '@/services/api';

interface DocumentViewerProps {
  document: {
    _id: string;
    url: string;
    type: string;
    uploadedAt: string;
    status?: 'pending' | 'approved' | 'rejected';
  };
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    profilePicture?: string;
  };
  onClose: () => void;
  onStatusUpdate: () => void;
}

export default function DocumentViewer({ document, user, onClose, onStatusUpdate }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'pending':
      default:
        return 'bg-yellow-500';
    }
  };

  const handleApprove = async () => {
    try {
      setLoading(true);
      await apiCall('PUT', `/admin/documents/${document._id}/status`, {
        status: 'approved'
      });
      
      toast({
        title: 'Success',
        description: 'Document approved successfully',
      });
      
      onStatusUpdate();
      onClose();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to approve document',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please provide a reason for rejection',
      });
      return;
    }

    try {
      setLoading(true);
      await apiCall('PUT', `/admin/documents/${document._id}/status`, {
        status: 'rejected',
        reason: rejectionReason
      });
      
      toast({
        title: 'Success',
        description: 'Document rejected successfully',
      });
      
      onStatusUpdate();
      onClose();
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.response?.data?.message || 'Failed to reject document',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    window.open(document.url, '_blank');
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const isPDF = document.type.toLowerCase().includes('pdf') || document.url.toLowerCase().endsWith('.pdf');

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle>Document Verification</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Review and verify user documents
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Document Preview - Left Side (2/3 width on large screens) */}
            <div className="lg:col-span-2 space-y-4">
              {/* Zoom Controls */}
              <div className="flex items-center justify-between bg-muted p-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleZoomOut}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">{zoom}%</span>
                  <Button variant="outline" size="sm" onClick={handleZoomIn}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>

              {/* Document Display */}
              <div className="border rounded-lg overflow-auto bg-muted/50 flex items-center justify-center min-h-[500px]">
                {isPDF ? (
                  <iframe
                    src={document.url}
                    className="w-full h-[600px]"
                    title="Document Preview"
                  />
                ) : (
                  <img
                    src={document.url}
                    alt="Document"
                    style={{ width: `${zoom}%` }}
                    className="max-w-none"
                  />
                )}
              </div>
            </div>

            {/* User Info & Actions - Right Side (1/3 width on large screens) */}
            <div className="space-y-4">
              {/* User Information */}
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-semibold">User Information</h3>
                <Separator />
                
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.profilePicture} alt={`${user.firstName} ${user.lastName}`} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Role:</span>
                    <Badge variant="secondary">{user.role}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Document Type:</span>
                    <span className="font-medium capitalize">{document.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uploaded:</span>
                    <span className="font-medium text-xs">{formatDate(document.uploadedAt)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className={getStatusColor(document.status)}>
                      {document.status || 'pending'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {document.status === 'pending' && (
                <div className="border rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold">Actions</h3>
                  <Separator />
                  
                  {!showRejectionForm ? (
                    <div className="space-y-2">
                      <Button 
                        className="w-full" 
                        onClick={handleApprove}
                        disabled={loading}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve Document
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={() => setShowRejectionForm(true)}
                        disabled={loading}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Document
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="reason">Rejection Reason *</Label>
                        <Textarea
                          id="reason"
                          placeholder="Please provide a detailed reason for rejection..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          rows={4}
                          className="mt-1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Button 
                          variant="destructive" 
                          className="w-full"
                          onClick={handleReject}
                          disabled={loading || !rejectionReason.trim()}
                        >
                          {loading ? 'Rejecting...' : 'Confirm Rejection'}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            setShowRejectionForm(false);
                            setRejectionReason('');
                          }}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Already Processed */}
              {document.status !== 'pending' && (
                <div className="border rounded-lg p-4">
                  <p className="text-sm text-muted-foreground text-center">
                    This document has already been {document.status}.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
