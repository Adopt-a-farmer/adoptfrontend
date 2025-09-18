import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Search, Heart, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HowItWorksSection = () => {
  const steps = [
    {
      icon: <UserPlus className="h-12 w-12 text-fresh-green" />,
      title: "Sign Up",
      description: "Create your account as an adopter looking to support farmers or as a farmer seeking partnership.",
      color: "from-green-100 to-emerald-100"
    },
    {
      icon: <Search className="h-12 w-12 text-fresh-green" />,
      title: "Browse & Connect",
      description: "Explore verified farmer profiles, read their stories, and choose who you'd like to support.",
      color: "from-blue-100 to-cyan-100"
    },
    {
      icon: <Heart className="h-12 w-12 text-fresh-green" />,
      title: "Start Supporting",
      description: "Begin your partnership with financial support, resources, or expertise sharing.",
      color: "from-orange-100 to-yellow-100"
    },
    {
      icon: <TrendingUp className="h-12 w-12 text-fresh-green" />,
      title: "Track Impact",
      description: "Monitor farm progress, receive updates, and witness the transformation you're enabling.",
      color: "from-purple-100 to-pink-100"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-20">
          <span className="text-fresh-green font-semibold text-lg">Simple Process</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-6">
            How Adopt-A-Farmer Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our platform makes it easy to support local farmers and create lasting partnerships 
            that transform communities across Kenya.
          </p>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                {/* Connecting Arrow - Only show between steps on larger screens */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 -right-4 z-10">
                    <ArrowRight className="w-8 h-8 text-fresh-green/40" />
                  </div>
                )}
                
                <div className={`bg-gradient-to-br ${step.color} rounded-3xl p-8 h-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-white/50`}>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md group-hover:scale-110 transition-transform duration-300">
                      {step.icon}
                    </div>
                    <div className="w-8 h-8 bg-fresh-green text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Success Story Highlight */}
          <div className="bg-fresh-green rounded-3xl p-12 text-white text-center">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold mb-6">Success in Numbers</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div>
                  <div className="text-4xl font-bold mb-2">72hrs</div>
                  <p className="text-lg opacity-90">Average connection time</p>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">250+</div>
                  <p className="text-lg opacity-90">Active partnerships</p>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">40%</div>
                  <p className="text-lg opacity-90">Average yield increase</p>
                </div>
              </div>
              <p className="text-xl mb-8 opacity-90">
                Our streamlined process ensures quick, meaningful connections that drive real agricultural transformation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/browse-farmers">
                  <Button size="lg" className="bg-white text-fresh-green hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full shadow-lg">
                    Start Supporting Today
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-fresh-green px-8 py-4 text-lg font-semibold rounded-full transition-colors duration-300">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
