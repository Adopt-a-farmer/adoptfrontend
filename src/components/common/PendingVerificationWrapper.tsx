import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  ShieldCheck, 
  FileText, 
  Mail, 
  Phone, 
  AlertCircle,
  CheckCircle,
  Eye
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface PendingVerificationWrapperProps {
  children: React.ReactNode;
  userType: 'farmer' | 'expert';
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

const PendingVerificationWrapper: React.FC<PendingVerificationWrapperProps> = ({
  children,
  userType,
  verificationStatus
}) => {
  const { user } = useAuth();

  if (verificationStatus === 'verified') {
    return <>{children}</>;
  }

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Pending Verification
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-300">
            <AlertCircle className="h-3 w-3 mr-1" />
            Verification Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    if (verificationStatus === 'pending') {
      return {
        title: 'Account Under Review',
        message: userType === 'farmer' 
          ? 'Your farmer profile is currently being reviewed by our team. This process typically takes 1-3 business days.'
          : 'Your expert profile is currently being reviewed by our team. We\'re verifying your credentials and experience.',
        icon: <Clock className="h-12 w-12 text-yellow-500" />
      };
    } else if (verificationStatus === 'rejected') {
      return {
        title: 'Verification Required',
        message: 'Your account verification was rejected. Please contact support or resubmit your documents.',
        icon: <AlertCircle className="h-12 w-12 text-red-500" />
      };
    }
  };

  const statusInfo = getStatusMessage();

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Blurred background content */}
      <div 
        className="absolute inset-0 filter blur-sm opacity-30 pointer-events-none"
        style={{ filter: 'blur(8px) brightness(0.7)' }}
      >
        {children}
      </div>

      {/* Overlay with pending message */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-2xl shadow-2xl border-2">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              {statusInfo?.icon}
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              {statusInfo?.title}
            </CardTitle>
            {getStatusBadge()}
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 text-lg leading-relaxed">
                {statusInfo?.message}
              </p>
            </div>

            {/* Verification checklist */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Verification Process
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Account created successfully</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Email verified</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Profile information submitted</span>
                </div>
                
                <div className="flex items-center text-sm">
                  {verificationStatus === 'pending' ? (
                    <Clock className="h-4 w-4 text-yellow-500 mr-3 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500 mr-3 flex-shrink-0" />
                  )}
                  <span className="text-gray-700">
                    {verificationStatus === 'pending' 
                      ? 'Admin review in progress...' 
                      : 'Admin review completed - action required'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* What happens next */}
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="font-semibold text-green-900 mb-4 flex items-center">
                <ShieldCheck className="h-5 w-5 mr-2" />
                What Happens Next?
              </h3>
              
              <div className="space-y-2 text-sm text-gray-700">
                {userType === 'farmer' ? (
                  <>
                    <p>• Our team will review your farm information and documents</p>
                    <p>• We may contact you for additional information if needed</p>
                    <p>• Once verified, you'll have full access to connect with adopters</p>
                    <p>• You'll be able to showcase your farm and receive support</p>
                  </>
                ) : (
                  <>
                    <p>• Our team will verify your credentials and experience</p>
                    <p>• We may check your certifications and previous work</p>
                    <p>• Once verified, you can start offering consulting services</p>
                    <p>• You'll be able to connect with farmers and earn income</p>
                  </>
                )}
              </div>
            </div>

            {/* Contact information */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Need Help?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2 text-blue-500" />
                  <span>support@adoptafarmer.com</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2 text-blue-500" />
                  <span>+1 (555) 123-4567</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {verificationStatus === 'rejected' && (
                <Button className="flex-1" variant="default">
                  <FileText className="h-4 w-4 mr-2" />
                  Resubmit Documents
                </Button>
              )}
              
              <Button variant="outline" className="flex-1">
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
              
              <Button variant="ghost" className="flex-1">
                <Eye className="h-4 w-4 mr-2" />
                Preview Dashboard
              </Button>
            </div>

            {/* User info */}
            <div className="text-center text-sm text-gray-500 pt-4 border-t">
              <p>Logged in as: <span className="font-medium">{user?.firstName} {user?.lastName}</span></p>
              <p>Account Type: <span className="font-medium capitalize">{userType}</span></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PendingVerificationWrapper;