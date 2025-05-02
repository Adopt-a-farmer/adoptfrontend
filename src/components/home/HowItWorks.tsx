
import React from 'react';
import { Link } from 'react-router-dom';
import { UserIcon, SeedlingIcon, LineChart, Handshake } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Define a custom icon component
const SeedlingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 10c0-6 8-6 8-6s0 6-8 6z"/>
    <path d="M8 16c0-6-8-6-8-6s0 6 8 6z"/>
    <path d="M12 10v13"/>
    <path d="M12 23c5 0 8-3 8-3"/>
  </svg>
);

const HandshakeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/>
    <path d="M12 5.36V3"/>
    <path d="M7 10H5"/>
    <path d="M19 10h-2"/>
  </svg>
);

const HowItWorksSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">How Adopt-A-Farmer Works</h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Our platform makes it easy to support local farmers and improve food security in Kenya
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-farmer-primary/10 p-4 rounded-full mb-6">
              <UserIcon className="h-10 w-10 text-farmer-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Join as Adopter or Farmer</h3>
            <p className="text-gray-600">
              Create your account as someone looking to support farmers or as a farmer seeking support.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-farmer-primary/10 p-4 rounded-full mb-6">
              <SeedlingIcon className="h-10 w-10 text-farmer-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Contribute Money or Land</h3>
            <p className="text-gray-600">
              Support a farmer with financial contributions or offer your unused land for farming activities.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-farmer-primary/10 p-4 rounded-full mb-6">
              <LineChart className="h-10 w-10 text-farmer-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Track Progress & Impact</h3>
            <p className="text-gray-600">
              Receive regular updates and track the growth of your investment through our transparent platform.
            </p>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center text-center">
            <div className="bg-farmer-primary/10 p-4 rounded-full mb-6">
              <HandshakeIcon className="h-10 w-10 text-farmer-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Share in the Harvest</h3>
            <p className="text-gray-600">
              Enjoy the benefits of your support through profit sharing, produce, and the impact you've made.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Link to="/how-it-works">
            <Button className="bg-farmer-primary text-white hover:bg-farmer-primary/90">
              Learn More About the Process
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
