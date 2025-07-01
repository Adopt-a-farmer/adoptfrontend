
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
  
  // Split crops into chunks for grid display (7-8 columns)
  const chunkSize = 7;
  const cropChunks = [];
  for (let i = 0; i < cropEntries.length; i += chunkSize) {
    cropChunks.push(cropEntries.slice(i, i + chunkSize));
  }

  return (
    <div className="mb-12">
      <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Browse by Crop Category</h3>
      <div className="max-w-6xl mx-auto">
        {cropChunks.map((chunk, chunkIndex) => (
          <div key={chunkIndex} className="mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
              {chunk.map(([crop, cropFarmers]) => {
                const CropIcon = getCropIcon(crop);
                return (
                  <Button
                    key={crop}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-farmer-primary/10 hover:border-farmer-primary transition-all"
                    onClick={() => onCropSelect(crop)}
                  >
                    <CropIcon className="h-6 w-6 text-farmer-primary" />
                    <span className="text-sm font-medium text-center leading-tight">{crop}</span>
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
