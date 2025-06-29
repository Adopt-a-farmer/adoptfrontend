
import React from 'react';

const FarmerLoadingState = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Featured Farmers</h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Meet some of our farmers who are looking for support to grow their agricultural businesses
          </p>
        </div>
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-farmer-primary border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading featured farmers...</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FarmerLoadingState;
