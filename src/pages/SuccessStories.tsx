import React from 'react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const SuccessStories = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero */}
      <section className="relative bg-gradient-to-r from-fresh-green to-farmer-primary text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="/farmers2.jpg" alt="Success" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Success Stories</h1>
            <p className="text-xl text-white/90">
              Real stories of transformation from our farming community
            </p>
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">More Stories Coming Soon</h2>
            <p className="text-lg text-gray-600 mb-8">
              We're gathering inspiring success stories from our farming community. Check back soon to read about 
              the amazing transformations happening across Kenya.
            </p>
            <Link to="/browse-farmers">
              <Button className="bg-fresh-green hover:bg-farmer-secondary">
                Start Your Own Success Story
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SuccessStories;
