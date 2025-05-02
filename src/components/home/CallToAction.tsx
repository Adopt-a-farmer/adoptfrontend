
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  return (
    <section className="py-16 bg-farmer-primary text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl opacity-90 mb-10">
            Whether you're a farmer looking for support or someone who wants to contribute to sustainable agriculture, 
            Adopt-A-Farmer provides the platform to connect and create impact.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/10 rounded-lg p-8 backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-4">For Farmers</h3>
              <p className="mb-6">
                Join our platform to connect with adopters who can provide financial support or land for your farming activities. 
                Get access to resources, markets, and a community that supports your growth.
              </p>
              <Link to="/farmer-signup">
                <Button size="lg" className="w-full bg-white text-farmer-primary hover:bg-gray-100">
                  Register as a Farmer
                </Button>
              </Link>
            </div>
            
            <div className="bg-white/10 rounded-lg p-8 backdrop-blur-sm">
              <h3 className="text-2xl font-bold mb-4">For Adopters</h3>
              <p className="mb-6">
                Support local farmers by providing financial backing or unused land. Track your impact, 
                receive updates, and be part of a sustainable food system in Kenya.
              </p>
              <Link to="/adopter-signup">
                <Button size="lg" className="w-full bg-white text-farmer-primary hover:bg-gray-100">
                  Become an Adopter
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="mt-12">
            <p className="italic">
              "The Adopt-A-Farmer platform has completely transformed my small farm. With the support I received, 
              I was able to implement an irrigation system that increased my yields by 40%." 
              <br />
              <span className="font-bold mt-2 block">— Mary Njeri, Vegetable Farmer, Kiambu County</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
