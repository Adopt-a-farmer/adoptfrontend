
import React from 'react';
import { Card } from '@/components/ui/card';
import { BadgeCheck, LineChart, MessageCircle, Calendar, Users, Globe } from 'lucide-react';

const FeatureSection = () => {
  const features = [
    {
      icon: <BadgeCheck className="h-10 w-10 text-farmer-primary" />,
      title: "Verified Farmers",
      description: "All farmers on our platform are verified through a rigorous process to ensure transparency and accountability."
    },
    {
      icon: <LineChart className="h-10 w-10 text-farmer-primary" />,
      title: "Real-time Tracking",
      description: "Monitor your investment and track farm progress through regular updates and transparent financial reporting."
    },
    {
      icon: <MessageCircle className="h-10 w-10 text-farmer-primary" />,
      title: "Direct Communication",
      description: "Connect directly with your adopted farmer through our messaging system for updates and relationship building."
    },
    {
      icon: <Calendar className="h-10 w-10 text-farmer-primary" />,
      title: "Farming Calendar",
      description: "Access expert-led farming calendars tailored to different regions and crop types for optimal results."
    },
    {
      icon: <Users className="h-10 w-10 text-farmer-primary" />,
      title: "Community Support",
      description: "Join a community of farmers and adopters sharing knowledge, resources, and success stories."
    },
    {
      icon: <Globe className="h-10 w-10 text-farmer-primary" />,
      title: "Multilingual Support",
      description: "Our AI-powered platform provides content in multiple local languages to support all users."
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Platform Features</h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the tools and resources we provide to support sustainable farming and impactful adoption
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-md transition-shadow border border-gray-100">
              <div className="mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
