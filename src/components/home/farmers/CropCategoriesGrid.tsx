
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coffee, Wheat, TreePalm, TreeDeciduous, Leaf, Carrot, Apple, Grape } from 'lucide-react';
import { Farmer } from '@/types';

interface CropCategoriesGridProps {
  farmersByCrop: { [key: string]: Farmer[] };
  onCropSelect: (crop: string) => void;
}

// Crop icon mapping with more variety
const getCropIcon = (crop: string) => {
  const cropLower = crop.toLowerCase();
  if (cropLower.includes('coffee')) return Coffee;
  if (cropLower.includes('tea')) return Leaf;
  if (cropLower.includes('wheat') || cropLower.includes('maize') || cropLower.includes('rice')) return Wheat;
  if (cropLower.includes('fruit') || cropLower.includes('mango') || cropLower.includes('avocado')) return TreePalm;
  if (cropLower.includes('apple')) return Apple;
  if (cropLower.includes('grape')) return Grape;
  if (cropLower.includes('carrot') || cropLower.includes('vegetable')) return Carrot;
  return TreeDeciduous; // Default for other crops
};

const CropCategoriesGrid = ({ farmersByCrop, onCropSelect }: CropCategoriesGridProps) => {
  const cropEntries = Object.entries(farmersByCrop);
  
  // Split crops into chunks for responsive grid display
  const chunkSize = 8; // Adjust for mobile vs desktop
  const cropChunks = [];
  for (let i = 0; i < cropEntries.length; i += chunkSize) {
    cropChunks.push(cropEntries.slice(i, i + chunkSize));
  }

  return (
    <div className="mb-12">
      <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Browse by Crop Category</h3>
      <div className="max-w-6xl mx-auto px-4">
        {cropChunks.map((chunk, chunkIndex) => (
          <div key={chunkIndex} className="mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {chunk.map(([crop, cropFarmers]) => {
                const CropIcon = getCropIcon(crop);
                return (
                  <Button
                    key={crop}
                    variant="outline"
                    className="h-auto p-3 flex flex-col items-center gap-2 hover:bg-farmer-primary/10 hover:border-farmer-primary transition-all aspect-square"
                    onClick={() => onCropSelect(crop)}
                  >
                    <CropIcon className="h-5 w-5 text-farmer-primary flex-shrink-0" />
                    <span className="text-xs font-medium text-center leading-tight line-clamp-2">{crop}</span>
                    <Badge variant="secondary" className="text-xs">
                      {cropFarmers.length}
                    </Badge>
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CropCategoriesGrid;
