
import React from 'react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const HowItWorksPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-farmer-primary py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">How Adopt-A-Farmer Works</h1>
              <p className="text-xl opacity-90 mb-8">
                Our platform connects smallholder farmers with adopters to support sustainable agriculture in Kenya
              </p>
              <div className="flex justify-center">
                <Link to="/browse-farmers">
                  <Button size="lg" className="bg-white text-farmer-primary hover:bg-gray-100">
                    Browse Farmers
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">The Four-Step Process</h2>
              
              {/* Step 1 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-center">
                <div className="md:col-span-1">
                  <div className="bg-farmer-primary/10 p-8 rounded-full w-40 h-40 flex items-center justify-center mx-auto">
                    <span className="text-5xl font-bold text-farmer-primary">1</span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-2xl font-bold mb-4">Join as an Adopter or Farmer</h3>
                  <p className="text-gray-700 mb-4">
                    Create your account on our platform as someone looking to support local agriculture or as a farmer seeking support for your agricultural activities.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-farmer-primary mr-2 mt-1" />
                      <span>Simple sign-up process with verification for trust and security</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-farmer-primary mr-2 mt-1" />
                      <span>Create detailed profiles to showcase your farm or your interest areas</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-farmer-primary mr-2 mt-1" />
                      <span>Access to a community of like-minded individuals dedicated to sustainable farming</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Step 2 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-center">
                <div className="md:col-span-1 md:order-2">
                  <div className="bg-farmer-primary/10 p-8 rounded-full w-40 h-40 flex items-center justify-center mx-auto">
                    <span className="text-5xl font-bold text-farmer-primary">2</span>
                  </div>
                </div>
                <div className="md:col-span-2 md:order-1">
                  <h3 className="text-2xl font-bold mb-4">Contribute Money or Land</h3>
                  <p className="text-gray-700 mb-4">
                    Support farmers directly with financial contributions or offer your unused land for farming activities, enabling food production and economic growth.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-farmer-primary mr-2 mt-1" />
                      <span>Flexible contribution options starting from as little as KES 1,000</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-farmer-primary mr-2 mt-1" />
                      <span>Register unused land parcels of any size for productive use</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-farmer-primary mr-2 mt-1" />
                      <span>Secure payment processing and legal frameworks for land-sharing</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Step 3 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-center">
                <div className="md:col-span-1">
                  <div className="bg-farmer-primary/10 p-8 rounded-full w-40 h-40 flex items-center justify-center mx-auto">
                    <span className="text-5xl font-bold text-farmer-primary">3</span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-2xl font-bold mb-4">Track Progress & Impact</h3>
                  <p className="text-gray-700 mb-4">
                    Follow the growth and development of your investment through our transparent platform that provides regular updates and insights.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-farmer-primary mr-2 mt-1" />
                      <span>Real-time updates with photos and videos from the farm</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-farmer-primary mr-2 mt-1" />
                      <span>Detailed financial reporting and transparent fund usage</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-farmer-primary mr-2 mt-1" />
                      <span>AI-powered insights and recommendations for optimal farming</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Step 4 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-center">
                <div className="md:col-span-1 md:order-2">
                  <div className="bg-farmer-primary/10 p-8 rounded-full w-40 h-40 flex items-center justify-center mx-auto">
                    <span className="text-5xl font-bold text-farmer-primary">4</span>
                  </div>
                </div>
                <div className="md:col-span-2 md:order-1">
                  <h3 className="text-2xl font-bold mb-4">Share in the Harvest</h3>
                  <p className="text-gray-700 mb-4">
                    Enjoy the benefits of your support through profit sharing, produce, and the tangible impact you've made on food security in Kenya.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-farmer-primary mr-2 mt-1" />
                      <span>Receive a portion of the harvest or profits based on your contribution</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-farmer-primary mr-2 mt-1" />
                      <span>Track your social impact through detailed metrics and stories</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-farmer-primary mr-2 mt-1" />
                      <span>Option to reinvest returns for compounding benefits</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-bold mb-2">How much can I contribute as an adopter?</h3>
                  <p className="text-gray-700">
                    Contributions start from as little as KES 1,000, with no upper limit. You can make one-time or recurring contributions depending on your preferences and budget.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-bold mb-2">What types of farmers can join the platform?</h3>
                  <p className="text-gray-700">
                    We welcome smallholder farmers across Kenya who are committed to sustainable agricultural practices. Farmers need to go through a verification process that includes site visits and documentation checks.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-bold mb-2">How is my land protected if I offer it for farming?</h3>
                  <p className="text-gray-700">
                    We establish clear legal agreements between land owners and farmers, with terms that protect ownership rights while enabling agricultural use. All agreements are documented and can be terminated with appropriate notice.
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-bold mb-2">What kind of returns can I expect as an adopter?</h3>
                  <p className="text-gray-700">
                    Returns vary depending on the farm type, crops grown, and market conditions. Typically, adopters can expect returns ranging from 8-15% annually, in addition to the social impact of supporting local food security.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-farmer-primary text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
              <p className="text-xl opacity-90 mb-8">
                Join our community of adopters and farmers working together to transform agriculture in Kenya
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/adopter-signup">
                  <Button size="lg" className="bg-white text-farmer-primary hover:bg-gray-100 w-full sm:w-auto">
                    Become an Adopter
                  </Button>
                </Link>
                <Link to="/farmer-signup">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20 w-full sm:w-auto">
                    Register as a Farmer <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorksPage;
