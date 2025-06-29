
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Coffee, Wheat, TreePalm, TreeDeciduous, Leaf } from 'lucide-react';
import { Farmer } from '@/types';
import FarmerCard from './FarmerCard';

interface CropAccordionSectionProps {
  farmersByCrop: { [key: string]: Farmer[] };
}

// Crop icon mapping
const getCropIcon = (crop: string) => {
  const cropLower = crop.toLowerCase();
  if (cropLower.includes('coffee')) return Coffee;
  if (cropLower.includes('tea')) return Leaf;
  if (cropLower.includes('wheat') || cropLower.includes('maize') || cropLower.includes('rice')) return Wheat;
  if (cropLower.includes('fruit') || cropLower.includes('mango') || cropLower.includes('avocado')) return TreePalm;
  return TreeDeciduous; // Default for other crops
};

const CropAccordionSection = ({ farmersByCrop }: CropAccordionSectionProps) => {
  return (
    <div className="mb-12">
      <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Browse by Crop Category</h3>
      <Accordion type="single" collapsible className="w-full max-w-6xl mx-auto">
        {Object.entries(farmersByCrop).map(([crop, cropFarmers]) => {
          const CropIcon = getCropIcon(crop);
          return (
            <AccordionItem key={crop} value={crop} className="border rounded-lg mb-4">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <CropIcon className="h-5 w-5 text-farmer-primary" />
                  <span className="text-lg font-medium">{crop}</span>
                  <Badge variant="secondary" className="ml-2">
                    {cropFarmers.length} farmer{cropFarmers.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {cropFarmers.map((farmer) => (
                    <FarmerCard key={farmer.id} farmer={farmer} size="small" />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default CropAccordionSection;
