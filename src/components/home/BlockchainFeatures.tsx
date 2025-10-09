import React from 'react';
import { Link2, Coins, Award, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const BlockchainFeatures = () => {
  const features = [
    {
      icon: <Link2 className="h-12 w-12 text-white" />,
      emoji: "🌾",
      title: "Farm-to-Fork Traceability with Blockchain",
      description: "Innovation meets transparency. Our Blockchain-powered traceability system transforms the agricultural value chain by securely tracking every product from the farm to your fork. Each transaction is verified on an immutable ledger, ensuring authenticity, quality, and trust. With real-time data and digital transparency, we're redefining how the world connects to its food.",
      bgImage: "/farmers1.jpg",
      gradient: "from-green-600/95 via-emerald-600/95 to-teal-600/95"
    },
    {
      icon: <Coins className="h-12 w-12 text-white" />,
      emoji: "🌍",
      title: "Tokenized Carbon Credit Rewards for Sustainable Farming",
      description: "We're revolutionizing climate-smart agriculture through tokenized carbon credit rewards that empower farmers to earn while protecting the planet. Every sustainable action — from carbon reduction to regenerative practices — is recorded and rewarded on the Blockchain. Small-scale and large-scale farmers alike gain new revenue streams through verifiable, tradeable carbon assets. Sustainability has never been this innovative — or this rewarding.",
      bgImage: "/farmers2.jpg",
      gradient: "from-blue-600/95 via-cyan-600/95 to-sky-600/95"
    },
    {
      icon: <Award className="h-12 w-12 text-white" />,
      emoji: "💎",
      title: "Smart Tokenized Incentives and Rewards",
      description: "Our next-generation rewards system uses Blockchain tokenization to drive performance, transparency, and innovation across agriculture. Farmers and stakeholders earn digital tokens for verified milestones, from production quality to environmental impact. These tokens hold real-world value, creating a borderless ecosystem where excellence and sustainability are always recognized. The future of agricultural motivation is decentralized.",
      bgImage: "/lovable-uploads/a76a1500-f6bb-4afb-a610-80f8ea83f1fe.png",
      gradient: "from-purple-600/95 via-violet-600/95 to-indigo-600/95"
    },
    {
      icon: <Zap className="h-12 w-12 text-white" />,
      emoji: "⚡",
      title: "Seamless Blockchain-Powered Payments",
      description: "We're making payments faster, smarter, and more secure. Blockchain-powered payments enable instant, transparent transactions between farmers, suppliers, and buyers — eliminating intermediaries and reducing costs. Every transfer is traceable and tamper-proof, promoting financial inclusion and trust across the agricultural economy. Powering the future of digital agriculture, one block at a time.",
      bgImage: "/farmers1.jpg",
      gradient: "from-orange-600/95 via-amber-600/95 to-yellow-600/95"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Blockchain-Powered Innovation
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-fresh-green to-farmer-primary mx-auto mb-8"></div>
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
            Revolutionizing agriculture through cutting-edge blockchain technology, 
            tokenized rewards, and transparent traceability systems.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img 
                  src={feature.bgImage} 
                  alt={feature.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient}`}></div>
              </div>

              {/* Content */}
              <div className="relative z-10 p-8 md:p-10 text-white min-h-[450px] flex flex-col">
                {/* Icon and Emoji */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 group-hover:bg-white/30 transition-all duration-300">
                    {feature.icon}
                  </div>
                  <span className="text-5xl">{feature.emoji}</span>
                </div>

                {/* Title */}
                <h3 className="text-2xl md:text-3xl font-bold mb-4 leading-tight">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-base md:text-lg leading-relaxed text-white/95 flex-grow">
                  {feature.description}
                </p>

                {/* Decorative Line */}
                <div className="mt-6 w-16 h-1 bg-white/50 group-hover:w-24 transition-all duration-300"></div>
              </div>

              {/* Hover Effect Border */}
              <div className="absolute inset-0 border-4 border-white/0 group-hover:border-white/20 rounded-2xl transition-all duration-500"></div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="inline-flex flex-col sm:flex-row gap-4 items-center">
            <Link to="/browse-farmers">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-fresh-green to-farmer-primary hover:from-farmer-primary hover:to-fresh-green text-white px-8 py-6 text-lg font-semibold rounded-full shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Explore the Platform
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-farmer-primary text-farmer-primary hover:bg-farmer-primary hover:text-white px-8 py-6 text-lg font-semibold rounded-full transition-all duration-300"
              >
                Learn More About Blockchain
              </Button>
            </Link>
          </div>
        </div>

        {/* Bottom Stats Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            { label: "Blockchain Transactions", value: "10,000+", icon: "🔗" },
            { label: "Carbon Credits Issued", value: "5,000+", icon: "🌱" },
            { label: "Tokenized Rewards", value: "$50K+", icon: "💰" },
            { label: "Secure Payments", value: "99.9%", icon: "🔒" }
          ].map((stat, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300"
            >
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className="text-3xl font-bold text-farmer-primary mb-2">{stat.value}</div>
              <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlockchainFeatures;
