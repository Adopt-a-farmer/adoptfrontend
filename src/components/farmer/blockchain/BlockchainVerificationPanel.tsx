import React, { useState, useEffect } from 'react';
import { Shield, ExternalLink, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import blockchainService, { FarmerVerificationStatus } from '@/services/blockchainService';
import { Skeleton } from '@/components/ui/skeleton';
import BlockchainBadge from '@/components/shared/BlockchainBadge';

interface BlockchainVerificationPanelProps {
  farmerId: string;
  showGenerateWallet?: boolean;
}

const BlockchainVerificationPanel: React.FC<BlockchainVerificationPanelProps> = ({
  farmerId,
  showGenerateWallet = true
}) => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<FarmerVerificationStatus | null>(null);
  const { toast } = useToast();

  const fetchVerificationStatus = async () => {
    try {
      setLoading(true);
      const status = await blockchainService.getFarmerVerificationStatus(farmerId);
      setVerificationStatus(status);
    } catch (error) {
      console.error('Error fetching verification status:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch blockchain verification status',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [farmerId]);

  const handleGenerateWallet = async () => {
    try {
      setGenerating(true);
      const result = await blockchainService.generateWallet();
      
      toast({
        title: 'Wallet Generated',
        description: 'Your blockchain wallet has been created successfully. Please save your private key securely!',
      });

      // Show private key in a modal or alert
      if (result.privateKey) {
        alert(`⚠️ IMPORTANT: Save your private key securely!\n\nAddress: ${result.address}\n\nPrivate Key: ${result.privateKey}\n\n${result.warning}`);
      }

      // Refresh status
      await fetchVerificationStatus();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate wallet';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Blockchain Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  const isRegistered = verificationStatus?.blockchainAddress !== null;
  const isVerified = verificationStatus?.verified || false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Blockchain Verification
        </CardTitle>
        <CardDescription>
          Your blockchain verification status and on-chain identity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div>
          <BlockchainBadge
            verified={isVerified}
            address={verificationStatus?.blockchainAddress || undefined}
            registrationTx={verificationStatus?.registrationTx}
            verificationTx={verificationStatus?.verificationTx}
            isRegistered={isRegistered}
            size="lg"
            showDetails={true}
          />
        </div>

        {/* Status Details */}
        {!isRegistered && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You are not yet registered on the blockchain. {showGenerateWallet ? 'Generate a wallet to get started.' : 'Please wait for admin to register you.'}
            </AlertDescription>
          </Alert>
        )}

        {isRegistered && !isVerified && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Your blockchain registration is pending admin verification. You'll be notified once verified.
            </AlertDescription>
          </Alert>
        )}

        {isVerified && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              🎉 Congratulations! You are verified on the blockchain. Your farming activities are now cryptographically secured.
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {!isRegistered && showGenerateWallet && (
            <Button
              onClick={handleGenerateWallet}
              disabled={generating}
              className="w-full"
            >
              {generating ? 'Generating...' : 'Generate Blockchain Wallet'}
            </Button>
          )}

          {verificationStatus?.blockchainAddress && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(`https://polygonscan.com/address/${verificationStatus.blockchainAddress}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Blockchain Explorer
            </Button>
          )}

          <Button
            variant="ghost"
            onClick={fetchVerificationStatus}
            className="w-full"
          >
            Refresh Status
          </Button>
        </div>

        {/* Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <h4 className="font-semibold text-sm text-blue-900">Why Blockchain Verification?</h4>
          <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
            <li>Immutable proof of your farming activities</li>
            <li>Builds trust with adopters and buyers</li>
            <li>Product traceability from farm to table</li>
            <li>Cannot be faked or manipulated</li>
            <li>Increases your credibility and marketability</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlockchainVerificationPanel;
