
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sprout, Users, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <div className="hero-section relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-accent rounded-full blur-2xl animate-pulse-slow delay-500"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium">
                <Sprout className="w-4 h-4" />
                <span>Empowering Farmers, Nourishing Communities</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="block">Adopt</span>
                <span className="block gradient-text">A Farmer</span>
                <span className="block text-4xl lg:text-5xl font-semibold text-white/90">
                  Transform Lives
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-white/90 max-w-2xl">
                Connect directly with farmers, support sustainable agriculture, 
                and make a real impact on rural communities across Africa.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/browse-farmers">
                <Button size="lg" className="btn-primary group">
                  <span>Start Adopting</span>
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              
              <Link to="/how-it-works">
                <Button size="lg" variant="outline" className="glass-card text-white border-white/30 hover:bg-white/10">
                  Learn How It Works
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-8 pt-8">
              <div className="text-center">
                <div className="impact-counter text-white">2,500+</div>
                <p className="text-white/80 font-medium">Farmers Supported</p>
              </div>
              <div className="text-center">
                <div className="impact-counter text-white">$450K+</div>
                <p className="text-white/80 font-medium">Funds Raised</p>
              </div>
              <div className="text-center">
                <div className="impact-counter text-white">150+</div>
                <p className="text-white/80 font-medium">Communities</p>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative">
            <div className="glass-card p-8 rounded-3xl">
              <img
                src="/lovable-uploads/a76a1500-f6bb-4afb-a610-80f8ea83f1fe.png"
                alt="African farmer in traditional clothing with farming tools"
                className="w-full h-[500px] object-cover rounded-2xl"
              />
              
              {/* Floating Stats Cards */}
              <div className="absolute -top-4 -left-4 glass-card p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Adopters</p>
                    <p className="text-2xl font-bold text-primary">1,200+</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -right-4 glass-card p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Impact Score</p>
                    <p className="text-2xl font-bold text-accent">95%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
