
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="/homevideo.mp4" type="video/mp4" />
      </video>
      
      {/* Subtle Dark Overlay for Text Readability */}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-screen">
        <div className="text-center text-white max-w-4xl mx-auto py-20">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <img 
              src="/lovable-uploads/adopt-a-farmer-logo.png" 
              alt="Adopt-A-Farmer Logo" 
              className="h-16 sm:h-20 w-auto drop-shadow-2xl"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          
          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5 drop-shadow-lg">
            Empowering Farmers.<br />
            Connecting Adopters.<br />
            <span className="text-yellow-300">Feeding the Future.</span>
          </h1>
          
          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl font-light mb-10 max-w-2xl mx-auto drop-shadow-md">
            Bridge the gap between smallholder farmers and markets through traceable financing, technology, and partnerships.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/browse-farmers">
              <Button 
                size="lg" 
                className="bg-white text-fresh-green hover:bg-yellow-300 hover:text-fresh-green px-8 py-3 text-base font-semibold rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 min-w-[180px]"
              >
                Start Adopting
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-fresh-green px-8 py-3 text-base font-semibold rounded-full transition-all duration-300 min-w-[180px]"
              >
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
