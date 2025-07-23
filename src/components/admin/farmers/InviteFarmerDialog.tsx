import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface InviteFarmerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  inviteToken: string;
  farmerName: string;
  email: string;
}

const InviteFarmerDialog = ({ 
  isOpen, 
  onClose, 
  inviteToken, 
  farmerName, 
  email 
}: InviteFarmerDialogProps) => {
  const { toast } = useToast();
  
  const inviteUrl = `${window.location.origin}/auth/farmer-invite/${inviteToken}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast({
        title: "Copied!",
        description: "Invitation link copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const openInNewTab = () => {
    window.open(inviteUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Farmer Invitation Created</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              An invitation has been created for <strong>{farmerName}</strong> ({email})
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="invite-url">Invitation Link</Label>
            <div className="flex space-x-2">
              <Input
                id="invite-url"
                value={inviteUrl}
                readOnly
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={openInNewTab}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-700">
              <strong>Instructions:</strong>
              <br />
              1. Share this link with {farmerName} via email or SMS
              <br />
              2. The farmer will create their account using this link
              <br />
              3. The link expires in 7 days
              <br />
              4. Once activated, they can access their dashboard
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InviteFarmerDialog;