
import React from 'react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import HeroSection from '@/components/home/HeroSection';
import HowItWorksSection from '@/components/home/HowItWorks';
import FeaturedFarmers from '@/components/home/FeaturedFarmers';
import ImpactSection from '@/components/home/ImpactSection';
import FeatureSection from '@/components/home/FeatureSection';
import CallToAction from '@/components/home/CallToAction';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <HowItWorksSection />
        <FeaturedFarmers />
        <ImpactSection />
        <FeatureSection />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
