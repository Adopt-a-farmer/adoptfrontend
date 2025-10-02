import React from 'react';
import { Target, Eye, Leaf, Users, Globe, Shield } from 'lucide-react';

const AboutSection = () => {
  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Who We Are Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Who We Are
          </h2>
          <div className="w-24 h-1 bg-fresh-green mx-auto mb-8"></div>
          <p className="text-base md:text-lg text-gray-700 leading-relaxed">
            Adopt-A-Farmer is a digital agritech platform connecting farmers, adopters, corporates, and exporters 
            into a transparent ecosystem. We empower smallholder farmers with financing, training, certification, 
            and guaranteed markets while offering adopters a chance to support agriculture sustainably.
          </p>
        </div>

        {/* Mission & Vision Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-20 max-w-6xl mx-auto">
          {/* Mission */}
          <div className="bg-gradient-to-br from-fresh-green/5 to-fresh-green/10 rounded-2xl p-8 border border-fresh-green/20 hover:shadow-xl transition-all duration-300">
            <div className="w-14 h-14 bg-fresh-green rounded-xl flex items-center justify-center mb-6">
              <Target className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Our Mission</h3>
            <p className="text-gray-700 leading-relaxed">
              Bridge the gap between smallholder farmers and markets through traceable financing, 
              technology, and partnerships.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-8 border border-yellow-200 hover:shadow-xl transition-all duration-300">
            <div className="w-14 h-14 bg-yellow-400 rounded-xl flex items-center justify-center mb-6">
              <Eye className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Our Vision</h3>
            <p className="text-gray-700 leading-relaxed">
              An Africa where farmers are financially empowered, every harvest is traceable, 
              and global adopters confidently connect to the food they consume.
            </p>
          </div>
        </div>

        {/* What We Do - Image + Text */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20 max-w-6xl mx-auto">
          {/* Images */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <img 
                src="/farmers1.jpg" 
                alt="Farmers working in the field" 
                className="w-full h-64 object-cover rounded-2xl shadow-lg"
              />
            </div>
            <img 
              src="/crop1.jpg" 
              alt="Fresh produce" 
              className="w-full h-40 object-cover rounded-2xl shadow-lg"
            />
            <img 
              src="/farmers2.jpg" 
              alt="Harvesting crops" 
              className="w-full h-40 object-cover rounded-2xl shadow-lg"
            />
          </div>

          {/* Text Content */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">What We Do</h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-fresh-green/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-fresh-green" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-1">For Farmers</h4>
                  <p className="text-gray-600">Access to financing, training, certifications, and export-ready markets.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-1">For Adopters</h4>
                  <p className="text-gray-600">Easy digital adoption with monthly updates, transparency, and impact reports.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-1">For Corporates</h4>
                  <p className="text-gray-600">CSR and ESG adoption blocks with measurable impact and visibility.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Globe className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-1">For Exporters</h4>
                  <p className="text-gray-600">Supply of traceable, certified, and reliable produce.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Impact Stats */}
        <div className="relative bg-gradient-to-r from-fresh-green to-farmer-primary rounded-3xl p-12 text-white max-w-6xl mx-auto overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 opacity-20">
            <img 
              src="/farmers4.jpg" 
              alt="Farmers background" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10">
          <h3 className="text-2xl font-bold text-center mb-12">Our Impact</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold mb-2">30-60%</p>
              <p className="text-white/90">Income Uplift</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold mb-2">5,000+</p>
              <p className="text-white/90">Farmers by 2026</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold mb-2">$4B</p>
              <p className="text-white/90">Market Potential</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold mb-2">100%</p>
              <p className="text-white/90">Traceability</p>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
