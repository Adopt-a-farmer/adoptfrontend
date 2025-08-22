import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import FarmerForm, { FarmerFormValues } from './FarmerForm';
import { Farmer } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/mock/client';
import InviteFarmerDialog from './InviteFarmerDialog';

interface FarmerFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FarmerFormValues) => void;
  farmer?: Farmer | null;
  dialogTitle: string;
  dialogDescription: string;
  submitLabel: string;
}

const FarmerFormDialog: React.FC<FarmerFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  farmer,
  dialogTitle,
  dialogDescription,
  submitLabel,
}) => {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [invitationData, setInvitationData] = useState<any>(null);
  const { toast } = useToast();

  // Extract and prepare form values from farmer if editing
  const getDefaultValues = (): FarmerFormValues | undefined => {
    if (!farmer) return undefined;
    
    // Extract county and constituency from location if it follows the format "County, Constituency"
    let county = '';
    let constituency = '';
    
    if (farmer.location.includes(',')) {
      const parts = farmer.location.split(',');
      county = parts[0].trim();
      constituency = parts[1].trim();
    }
    
    return {
      name: farmer.name,
      location: farmer.location,
      county: county,
      constituency: constituency,
      description: farmer.description || '',
      crops: farmer.crops || [],
      farming_experience_years: farmer.farming_experience_years,
      fundinggoal: farmer.fundinggoal,
      featured: farmer.featured,
      image_url: farmer.image_url,
    };
  };

  const handleSubmit = async (data: FarmerFormValues) => {
    try {
      // Call the original onSubmit first
      onSubmit(data);

      // If this is a new farmer (no farmer prop), check for invitation
      if (!farmer) {
        // Give it a moment for the database to process the farmer creation
        setTimeout(async () => {
          try {
            const { data: farmersData } = await supabase
              .from('farmers')
              .select('id')
              .eq('name', data.name)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            if (farmersData) {
              const { data: invitationData } = await supabase
                .from('farmer_invitations')
                .select('*')
                .eq('farmer_id', farmersData.id)
                .single();

              if (invitationData) {
                setInvitationData({
                  ...invitationData,
                  farmer_name: data.name,
                  email: invitationData.email
                });
                setShowInviteDialog(true);
              }
            }
          } catch (error) {
            console.log('No invitation created or error checking:', error);
          }
        }, 1000);
      }
    } catch (error: any) {
      console.error('Error in form submission:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process farmer data",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogDescription}</DialogDescription>
          </DialogHeader>
          <FarmerForm
            onSubmit={handleSubmit}
            onCancel={onClose}
            defaultValues={getDefaultValues()}
            submitLabel={submitLabel}
            isEditing={!!farmer}
          />
        </DialogContent>
      </Dialog>

      {showInviteDialog && invitationData && (
        <InviteFarmerDialog
          isOpen={showInviteDialog}
          onClose={() => setShowInviteDialog(false)}
          inviteToken={invitationData.invite_token}
          farmerName={invitationData.farmer_name}
          email={invitationData.email}
        />
      )}
    </>
  );
};

export default FarmerFormDialog;