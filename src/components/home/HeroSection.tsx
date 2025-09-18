
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Leaf, TrendingUp } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-fresh-green via-farmer-primary to-farmer-secondary overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 166, 81, 0.85), rgba(124, 179, 66, 0.85)), url('/hero.jpg')`
        }}
      />
      
      {/* Decorative Pattern */}
      <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] bg-repeat opacity-10" />
      
      <div className="relative z-10 container mx-auto px-4 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
          {/* Left Content */}
          <div className="text-white space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Fresh Partnerships,
                <span className="block text-orange-300">Sustainable Futures</span>
              </h1>
              <p className="text-xl md:text-2xl font-light opacity-90 max-w-2xl">
                Connect directly with Kenyan farmers. Support sustainable agriculture. 
                Build lasting partnerships that transform communities.
              </p>
            </div>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">250+</p>
                  <p className="text-sm opacity-80">Active Farmers</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">1,500+</p>
                  <p className="text-sm opacity-80">Acres Supported</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold">$180K+</p>
                  <p className="text-sm opacity-80">Funds Raised</p>
                </div>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/browse-farmers">
                <Button 
                  size="lg" 
                  className="bg-white text-fresh-green hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  Start Supporting Farmers
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-white border-2 border-white hover:bg-white hover:text-fresh-green px-8 py-6 text-lg font-semibold rounded-full transition-all duration-300"
                >
                  Learn How It Works 
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Right Content - Farmer Images Grid */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              {/* Main large image */}
              <div className="col-span-2 relative group">
                <div className="bg-white p-2 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-500">
                  <img 
                    src="/farmers1.jpg" 
                    alt="Kenyan farmer with fresh produce" 
                    className="w-full h-64 object-cover rounded-xl"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-xl shadow-lg">
                  <div className="text-fresh-green">
                    <p className="font-bold text-lg">Fresh Produce</p>
                    <p className="text-sm text-gray-600">Directly from farms</p>
                  </div>
                </div>
              </div>
              
              {/* Smaller images */}
              <div className="relative group">
                <div className="bg-white p-2 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-500">
                  <img 
                    src="/farmers2.jpg" 
                    alt="Sustainable farming practices" 
                    className="w-full h-32 object-cover rounded-xl"
                  />
                </div>
              </div>
              
              <div className="relative group">
                <div className="bg-white p-2 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-500">
                  <img 
                    src="/farmers3.jpg" 
                    alt="Community farming" 
                    className="w-full h-32 object-cover rounded-xl"
                  />
                </div>
              </div>
            </div>
            
            {/* Floating Success Card */}
            <div className="absolute -top-8 -left-8 bg-white p-6 rounded-xl shadow-2xl max-w-48 transform rotate-6 hover:rotate-0 transition-all duration-500">
              <div className="text-center">
                <p className="text-3xl font-bold text-fresh-green">98%</p>
                <p className="text-sm text-gray-600 font-medium">Farmer Success Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Wave Bottom */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 fill-white">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"/>
        </svg>
      </div>
    </div>
  );
};

export default HeroSection;
