
import React from 'react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import HeroSection from '@/components/home/HeroSection';
import AboutSection from '@/components/home/AboutSection';
import HowItWorksSection from '@/components/home/HowItWorks';
import ImpactSection from '@/components/home/ImpactSection';
import FeatureSection from '@/components/home/FeatureSection';
import BlockchainFeatures from '@/components/home/BlockchainFeatures';
import PartnersSection from '@/components/home/PartnersSection';
import CallToAction from '@/components/home/CallToAction';
import ChatFloatingButton from '@/components/chatbot/ChatFloatingButton';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <AboutSection />
        <BlockchainFeatures />
        <FeatureSection />
        <ImpactSection />
        <HowItWorksSection />
        <PartnersSection />
        <CallToAction />
      </main>
      <Footer />
      <ChatFloatingButton />
    </div>
  );
};

export default Index;
