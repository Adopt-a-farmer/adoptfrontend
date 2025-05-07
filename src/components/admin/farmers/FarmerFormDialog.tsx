
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import FarmerForm, { FarmerFormValues } from './FarmerForm';
import { Farmer } from '@/types';

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        <FarmerForm
          onSubmit={onSubmit}
          onCancel={onClose}
          defaultValues={getDefaultValues()}
          submitLabel={submitLabel}
          isEditing={!!farmer}
        />
      </DialogContent>
    </Dialog>
  );
};

export default FarmerFormDialog;
