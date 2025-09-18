import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Leaf } from 'lucide-react';

const CallToAction = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-fresh-green via-farmer-primary to-farmer-secondary text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] bg-repeat opacity-10" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Main CTA Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Join the Agricultural <br />
              <span className="text-orange-200">Revolution</span>
            </h2>
            <p className="text-xl md:text-2xl opacity-90 mb-8 max-w-3xl mx-auto leading-relaxed">
              Whether you're a farmer seeking support or someone passionate about sustainable agriculture, 
              our platform connects communities for lasting impact.
            </p>
          </div>
          
          {/* Two-Column CTA Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {/* Farmer Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                  <Leaf className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold">For Farmers</h3>
              </div>
              <p className="text-lg opacity-90 mb-8 leading-relaxed">
                Transform your farming dreams into reality. Connect with adopters who provide financial support, 
                access markets, and join a thriving agricultural community.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-orange-200 rounded-full mr-3"></div>
                  <span>Financial support and resources</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-orange-200 rounded-full mr-3"></div>
                  <span>Access to modern farming techniques</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-orange-200 rounded-full mr-3"></div>
                  <span>Direct market connections</span>
                </div>
              </div>
              <Link to="/farmer-signup" className="block">
                <Button size="lg" className="w-full bg-white text-fresh-green hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg py-6 text-lg font-semibold">
                  Register as a Farmer
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            
            {/* Adopter Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-10 border border-white/20 hover:bg-white/15 transition-all duration-300 group">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold">For Adopters</h3>
              </div>
              <p className="text-lg opacity-90 mb-8 leading-relaxed">
                Make a meaningful impact on Kenyan agriculture. Support farmers with financial backing, 
                track your contributions, and be part of sustainable food systems.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-orange-200 rounded-full mr-3"></div>
                  <span>Track your impact in real-time</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-orange-200 rounded-full mr-3"></div>
                  <span>Direct farmer communication</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-orange-200 rounded-full mr-3"></div>
                  <span>Fresh produce benefits</span>
                </div>
              </div>
              <Link to="/adopter-signup" className="block">
                <Button size="lg" className="w-full bg-white text-fresh-green hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg py-6 text-lg font-semibold">
                  Become an Adopter
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Testimonial Section */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="text-6xl mb-6">🌾</div>
              <blockquote className="text-xl md:text-2xl italic mb-8 leading-relaxed">
                "The Adopt-A-Farmer platform has completely transformed my small farm. With the support I received, 
                I was able to implement modern irrigation systems that increased my yields by 40% and improved my family's livelihood."
              </blockquote>
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mr-4">
                  <span className="text-2xl font-bold">MN</span>
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg">Mary Njeri</p>
                  <p className="opacity-80">Vegetable Farmer, Kiambu County</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
