import React from 'react';
import { Shield, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BlockchainBadgeProps {
  verified: boolean;
  address?: string;
  registrationTx?: string;
  verificationTx?: string;
  isRegistered?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
}

const BlockchainBadge: React.FC<BlockchainBadgeProps> = ({
  verified,
  address,
  registrationTx,
  verificationTx,
  isRegistered = false,
  size = 'md',
  showDetails = true,
  className
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  };

  if (!isRegistered && !address) {
    return null;
  }

  const getBadgeContent = () => {
    if (verified) {
      return {
        icon: <CheckCircle className="mr-1" size={iconSizes[size]} />,
        text: 'Blockchain Verified',
        variant: 'default' as const,
        bgColor: 'bg-green-100 text-green-800 border-green-300',
        tooltip: 'This farmer is verified on the blockchain with cryptographic proof of authenticity.'
      };
    } else if (isRegistered) {
      return {
        icon: <Clock className="mr-1" size={iconSizes[size]} />,
        text: 'Pending Verification',
        variant: 'secondary' as const,
        bgColor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        tooltip: 'This farmer is registered on blockchain but awaiting admin verification.'
      };
    } else {
      return {
        icon: <AlertCircle className="mr-1" size={iconSizes[size]} />,
        text: 'Not Verified',
        variant: 'outline' as const,
        bgColor: 'bg-gray-100 text-gray-800 border-gray-300',
        tooltip: 'This farmer is not yet verified on the blockchain.'
      };
    }
  };

  const badgeContent = getBadgeContent();

  const badge = (
    <Badge
      variant={badgeContent.variant}
      className={cn(
        'flex items-center font-semibold border',
        badgeContent.bgColor,
        sizeClasses[size],
        className
      )}
    >
      <Shield className="mr-1" size={iconSizes[size]} />
      {badgeContent.icon}
      {badgeContent.text}
    </Badge>
  );

  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent>
            <p>{badgeContent.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="space-y-2">
      {badge}
      {showDetails && address && (
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex items-start gap-2">
            <span className="font-medium min-w-[80px]">Address:</span>
            <code className="bg-gray-100 px-2 py-0.5 rounded text-xs break-all">
              {address}
            </code>
          </div>
          {registrationTx && (
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[80px]">Registered:</span>
              <a
                href={`https://polygonscan.com/tx/${registrationTx}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-xs break-all"
              >
                {registrationTx.substring(0, 10)}...{registrationTx.substring(registrationTx.length - 8)}
              </a>
            </div>
          )}
          {verificationTx && verified && (
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[80px]">Verified:</span>
              <a
                href={`https://polygonscan.com/tx/${verificationTx}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-xs break-all"
              >
                {verificationTx.substring(0, 10)}...{verificationTx.substring(verificationTx.length - 8)}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BlockchainBadge;
