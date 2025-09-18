import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const ImpactSection = () => {
  const impactStats = [
    {
      number: "250+",
      label: "Active Farmers",
      description: "Smallholder farmers supported across Kenya",
      icon: "👨‍🌾"
    },
    {
      number: "1,500+", 
      label: "Acres Cultivated",
      description: "Land transformed into productive farms",
      icon: "🌱"
    },
    {
      number: "$180K+",
      label: "Funds Raised",
      description: "Direct financial support to farmers",
      icon: "💰"
    },
    {
      number: "98%",
      label: "Success Rate",
      description: "Farmers achieving sustainable growth",
      icon: "📈"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-fresh-green/5 to-farmer-secondary/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-fresh-green font-semibold text-lg">Our Impact</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-6">
            Creating Real Change Together
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Through sustainable partnerships and community support, we're transforming lives and 
            building a stronger agricultural future for Kenya.
          </p>
        </div>

        {/* Impact Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {impactStats.map((stat, index) => (
            <Card key={index} className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white group">
              <CardContent className="pt-6">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold text-fresh-green mb-3">{stat.number}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{stat.label}</h3>
                <p className="text-gray-600 leading-relaxed">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Success Stories Section */}
        <div className="bg-white rounded-3xl p-12 shadow-xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Real Stories, Real Impact
              </h3>
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-fresh-green rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 mb-2">Community Transformation</h4>
                    <p className="text-gray-600 leading-relaxed">
                      Our partnerships have helped transform entire communities, creating jobs and improving food security across rural Kenya.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-farmer-secondary rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 mb-2">Sustainable Growth</h4>
                    <p className="text-gray-600 leading-relaxed">
                      Through education and support, farmers are adopting sustainable practices that protect the environment while increasing yields.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-fresh-orange rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg text-gray-900 mb-2">Economic Empowerment</h4>
                    <p className="text-gray-600 leading-relaxed">
                      Direct financial support and market access have enabled farmers to achieve financial independence and support their families.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <img 
                    src="/farmers2.jpg" 
                    alt="Farmer success story" 
                    className="w-full h-48 object-cover rounded-2xl shadow-lg"
                  />
                  <img 
                    src="/farmers4.jpg" 
                    alt="Community farming" 
                    className="w-full h-32 object-cover rounded-2xl shadow-lg"
                  />
                </div>
                <div className="space-y-4 pt-8">
                  <img 
                    src="/farmers3.jpg" 
                    alt="Sustainable agriculture" 
                    className="w-full h-32 object-cover rounded-2xl shadow-lg"
                  />
                  <img 
                    src="/farmers1.jpg" 
                    alt="Fresh produce" 
                    className="w-full h-48 object-cover rounded-2xl shadow-lg"
                  />
                </div>
              </div>
              
              {/* Floating testimonial */}
              <div className="absolute -top-4 -left-8 bg-white p-6 rounded-xl shadow-2xl max-w-64 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                <p className="text-sm text-gray-600 italic mb-3">
                  "This platform changed my life. I can now support my family and expand my farm."
                </p>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-fresh-green rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                    M
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Mary Wanjiku</p>
                    <p className="text-xs text-gray-500">Kiambu County</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
