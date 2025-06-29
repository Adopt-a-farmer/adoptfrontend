
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const FarmerEmptyState = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Featured Farmers</h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Meet some of our farmers who are looking for support to grow their agricultural businesses
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-600 mb-8">No featured farmers available at the moment. Check back soon!</p>
          <Link to="/browse-farmers">
            <Button variant="outline" className="border-farmer-primary text-farmer-primary hover:bg-farmer-primary hover:text-white">
              Browse All Farmers
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FarmerEmptyState;
