import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CallToAction = () => {
  return (
    <section className="py-20 text-white relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="/farmers2.jpg" 
          alt="Call to action background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-fresh-green/90 via-farmer-primary/85 to-farmer-secondary/90"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 leading-tight">
            Start Making an Impact Today
          </h2>
          <p className="text-base md:text-lg opacity-95 mb-12 max-w-2xl mx-auto">
            Join thousands transforming agriculture through technology, transparency, and sustainable partnerships.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/browse-farmers">
              <Button 
                size="lg" 
                className="bg-white text-fresh-green hover:bg-yellow-300 hover:text-fresh-green px-8 py-3 text-base font-semibold rounded-full shadow-2xl transform hover:scale-105 transition-all duration-300 min-w-[180px]"
              >
                Adopt a Farmer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth/register">
              <Button 
                size="lg" 
                variant="outline" 
                className="text-white border-2 border-white hover:bg-white hover:text-fresh-green px-8 py-3 text-base font-semibold rounded-full transition-all duration-300 min-w-[180px]"
              >
                Register Now
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            <div>
              <p className="text-2xl md:text-3xl font-bold mb-2">100+</p>
              <p className="text-sm md:text-base opacity-90">Target Farmers</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold mb-2">30-60%</p>
              <p className="text-sm md:text-base opacity-90">Income Uplift</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold mb-2">100%</p>
              <p className="text-sm md:text-base opacity-90">Traceable</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold mb-2">3 Mo.</p>
              <p className="text-sm md:text-base opacity-90">Crop Cycles</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
