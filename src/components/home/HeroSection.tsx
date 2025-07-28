
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="hero-section">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 space-y-6 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Support Local Farmers, <br />
              <span className="text-yellow-200">Grow Kenya's Future</span>
            </h1>
            <p className="text-lg md:text-xl opacity-90 max-w-lg">
              Connect with smallholder farmers, provide financial support or land, 
              and become part of Kenya's sustainable agricultural revolution.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
              <Link to="/browse-farmers">
                <Button size="lg" className="bg-white text-farmer-primary hover:bg-gray-100 px-6 py-6">
                  Browse Farmers
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/20 px-6 py-6">
                  Learn More <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 mt-10 md:mt-0">
            <div className="relative">
              <div className="bg-white p-3 rounded-lg shadow-xl transform rotate-3 animate-pulse-slow">
                <img 
                  src="https://images.unsplash.com/photo-1595416035415-ef1769eb4cd9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Kenyan farmer" 
                  className="w-full h-auto rounded"
                />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-lg shadow-lg text-farmer-primary">
                <p className="font-bold">253 Farmers</p>
                <p className="text-sm text-gray-600">waiting for adoption</p>
              </div>
              <div className="absolute -top-4 -right-4 bg-white p-4 rounded-lg shadow-lg text-farmer-primary">
                <p className="font-bold">$128,450</p>
                <p className="text-sm text-gray-600">raised so far</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
