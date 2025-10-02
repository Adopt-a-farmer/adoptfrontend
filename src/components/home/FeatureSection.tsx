import React from 'react';
import { Card } from '@/components/ui/card';
import { Shield, Leaf, TrendingUp, Globe, Users, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeatureSection = () => {
  const features = [
    {
      icon: <Shield className="h-10 w-10 text-fresh-green" />,
      title: "Tech + Traceability",
      description: "Blockchain, AI, and GPS tracking for complete transparency from farm to market.",
    },
    {
      icon: <Globe className="h-10 w-10 text-fresh-green" />,
      title: "Export Focus",
      description: "Stable markets with guaranteed export opportunities and certified produce.",
    },
    {
      icon: <Leaf className="h-10 w-10 text-fresh-green" />,
      title: "Sustainable Practices",
      description: "Climate-smart agriculture with organic certifications and eco-friendly methods.",
    },
    {
      icon: <Users className="h-10 w-10 text-fresh-green" />,
      title: "One-to-One Support",
      description: "Direct connection between one adopter and one farmer for maximum impact.",
    },
    {
      icon: <MessageCircle className="h-10 w-10 text-fresh-green" />,
      title: "Regular Updates",
      description: "Monthly progress reports via SMS, WhatsApp, email, and dashboard access.",
    },
    {
      icon: <TrendingUp className="h-10 w-10 text-fresh-green" />,
      title: "Measurable Impact",
      description: "Track farmer income growth, harvest yields, and community development.",
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src="/crop1.jpg" alt="Feature background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white/95"></div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Why Adopt-A-Farmer?
          </h2>
          <div className="w-24 h-1 bg-fresh-green mx-auto mb-6"></div>
          <p className="text-base md:text-lg text-gray-700">
            Transforming agriculture through technology, transparency, and sustainable partnerships.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="p-8 bg-white border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-fresh-green/10 rounded-xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-fresh-green to-farmer-primary text-white rounded-3xl p-10 md:p-12 max-w-4xl mx-auto shadow-2xl">
            <h3 className="text-xl md:text-2xl font-bold mb-4">Ready to Make a Difference?</h3>
            <p className="text-base md:text-lg mb-8 opacity-95">
              Join us in empowering smallholder farmers and building sustainable agricultural futures.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/browse-farmers">
                <button className="bg-white text-fresh-green px-8 py-3 rounded-full font-semibold hover:bg-yellow-300 hover:text-fresh-green transition-all duration-300 shadow-lg min-w-[180px]">
                  Browse Farmers
                </button>
              </Link>
              <Link to="/how-it-works">
                <button className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-fresh-green transition-all duration-300 min-w-[180px]">
                  Learn More
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
