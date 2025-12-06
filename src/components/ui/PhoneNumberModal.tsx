import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone, Loader2 } from 'lucide-react';
import { authService } from '@/services/auth';
import { useToast } from '@/hooks/use-toast';

interface PhoneNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhoneUpdated: (phone: string) => void;
}

export const PhoneNumberModal: React.FC<PhoneNumberModalProps> = ({
  isOpen,
  onClose,
  onPhoneUpdated
}) => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const validatePhone = (phoneNumber: string): boolean => {
    // Remove spaces and check format
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(cleanPhone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    if (!validatePhone(phone)) {
      setError('Please enter a valid phone number (e.g., +254712345678)');
      return;
    }

    setIsLoading(true);

    try {
      await authService.updatePhoneNumber(phone.replace(/\s/g, ''));
      
      // Update stored user data
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        userData.phone = phone.replace(/\s/g, '');
        localStorage.setItem('user', JSON.stringify(userData));
      }

      toast({
        title: 'Phone Number Updated',
        description: 'Your phone number has been saved successfully.',
      });

      onPhoneUpdated(phone);
      onClose();
    } catch (error) {
      console.error('Failed to update phone:', error);
      const apiError = error as { response?: { data?: { message?: string } } };
      setError(apiError?.response?.data?.message || 'Failed to update phone number');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-green-600" />
            Complete Your Profile
          </DialogTitle>
          <DialogDescription>
            Please add your phone number to complete your profile. This is required for account security and communication.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+254 712 345 678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="text-lg"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Enter your phone number with country code (e.g., +254 for Kenya)
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Skip for now
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading || !phone.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Phone Number'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PhoneNumberModal;
