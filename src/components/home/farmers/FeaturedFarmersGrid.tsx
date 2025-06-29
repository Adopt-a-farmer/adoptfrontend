
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Farmer } from '@/types';
import FarmerCard from './FarmerCard';

interface FeaturedFarmersGridProps {
  farmers: Farmer[];
}

const FeaturedFarmersGrid = ({ farmers }: FeaturedFarmersGridProps) => {
  return (
    <>
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">All Featured Farmers</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {farmers.slice(0, 12).map((farmer) => (
            <FarmerCard key={farmer.id} farmer={farmer} showFeaturedBadge />
          ))}
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <Link to="/browse-farmers">
          <Button variant="outline" className="border-farmer-primary text-farmer-primary hover:bg-farmer-primary hover:text-white">
            View All Farmers
          </Button>
        </Link>
      </div>
    </>
  );
};

export default FeaturedFarmersGrid;
