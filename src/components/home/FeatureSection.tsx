import React from 'react';
import { Card } from '@/components/ui/card';
import { Truck, Shield, Leaf, Users, MessageCircle, TrendingUp } from 'lucide-react';

const FeatureSection = () => {
  const features = [
    {
      icon: <Truck className="h-12 w-12 text-fresh-green" />,
      title: "Direct Farm Delivery",
      description: "Fresh produce delivered straight from partner farms to your doorstep. Supporting local farmers while enjoying the freshest ingredients.",
      bgColor: "bg-green-50",
      iconBg: "bg-green-100"
    },
    {
      icon: <Shield className="h-12 w-12 text-fresh-green" />,
      title: "Quality Guaranteed",
      description: "Every farmer and farm is verified through our rigorous quality standards. Your investment is protected with full transparency.",
      bgColor: "bg-blue-50", 
      iconBg: "bg-blue-100"
    },
    {
      icon: <Leaf className="h-12 w-12 text-fresh-green" />,
      title: "Sustainable Farming",
      description: "Supporting eco-friendly farming practices that protect the environment while ensuring long-term agricultural sustainability.",
      bgColor: "bg-emerald-50",
      iconBg: "bg-emerald-100"
    },
    {
      icon: <Users className="h-12 w-12 text-fresh-green" />,
      title: "Community Impact",
      description: "Build lasting relationships with farming communities. Your support directly improves livelihoods and strengthens local economies.",
      bgColor: "bg-orange-50",
      iconBg: "bg-orange-100"
    },
    {
      icon: <MessageCircle className="h-12 w-12 text-fresh-green" />,
      title: "Direct Communication",
      description: "Stay connected with your adopted farmers through our integrated messaging system. Get regular updates and build meaningful relationships.",
      bgColor: "bg-purple-50",
      iconBg: "bg-purple-100"
    },
    {
      icon: <TrendingUp className="h-12 w-12 text-fresh-green" />,
      title: "Track Your Impact",
      description: "Monitor farm progress, harvest yields, and community impact through detailed analytics and regular progress reports.",
      bgColor: "bg-yellow-50",
      iconBg: "bg-yellow-100"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-fresh-green font-semibold text-lg">Why Choose Us</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-6">
            Fresh Solutions for Modern Agriculture
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We connect communities through sustainable farming partnerships, delivering fresh produce 
            while supporting local farmers and transforming agricultural practices across Kenya.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className={`p-8 ${feature.bgColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group`}>
              <div className={`w-16 h-16 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-fresh-green text-white rounded-3xl p-12 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h3>
            <p className="text-xl mb-8 opacity-90">Join thousands of supporters helping Kenyan farmers build sustainable futures.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-fresh-green px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-300 shadow-lg">
                Browse Farmers
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-fresh-green transition-colors duration-300">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
