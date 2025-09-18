import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, Wallet } from 'lucide-react';
import PaystackPayment from '@/components/payment/PaystackPayment';
import { toast } from 'sonner';

interface ContributionDialogProps {
  farmerId: string;
  farmerName: string;
  adoptionId?: string;
  contributionType?: 'additional' | 'monthly' | 'one-time';
  buttonText?: string;
  buttonVariant?: 'default' | 'outline' | 'secondary';
  buttonSize?: 'sm' | 'default' | 'lg';
  className?: string;
  onSuccess?: () => void;
}

const ContributionDialog: React.FC<ContributionDialogProps> = ({
  farmerId,
  farmerName,
  adoptionId,
  contributionType = 'additional',
  buttonText = 'Add Contribution',
  buttonVariant = 'default',
  buttonSize = 'default',
  className = '',
  onSuccess
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePaymentSuccess = () => {
    setIsOpen(false);
    toast.success('Contribution successful! Thank you for supporting the farmer.');
    onSuccess?.();
  };

  const handlePaymentCancel = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={buttonVariant} 
          size={buttonSize}
          className={`${className}`}
        >
          {contributionType === 'additional' ? (
            <PlusCircle className="mr-2 h-4 w-4" />
          ) : (
            <Wallet className="mr-2 h-4 w-4" />
          )}
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {contributionType === 'additional' 
              ? `Additional Support for ${farmerName}`
              : `Support ${farmerName}`
            }
          </DialogTitle>
        </DialogHeader>
        <PaystackPayment
          farmerId={farmerId}
          farmerName={farmerName}
          adoptionId={adoptionId}
          contributionType={contributionType}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
          initialAmount={contributionType === 'additional' ? 1000 : 2000}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ContributionDialog;
