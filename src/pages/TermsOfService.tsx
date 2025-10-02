import React from 'react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last Updated:</strong> October 2, 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600 mb-4">
                By accessing and using Adopt-A-Farmer's platform, you accept and agree to be bound by these Terms of Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use of Service</h2>
              <p className="text-gray-600 mb-4">You agree to:</p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account</li>
                <li>Not misuse the platform or its services</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Respect other users and their rights</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Responsibilities</h2>
              <p className="text-gray-600 mb-4">
                <strong>For Farmers:</strong> You must provide accurate information about your farm, crops, and operations. 
                You agree to maintain transparent communication with adopters and provide regular updates.
              </p>
              <p className="text-gray-600 mb-4">
                <strong>For Adopters:</strong> You agree to honor your adoption commitments and payments as agreed. 
                You must respect farmers' privacy and operational constraints.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Payments and Fees</h2>
              <p className="text-gray-600 mb-4">
                All payments are processed securely through our platform. Platform fees and payment gateway charges 
                apply as disclosed during the transaction process.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Intellectual Property</h2>
              <p className="text-gray-600 mb-4">
                All content on the platform, including logos, text, images, and software, is the property of 
                Adopt-A-Farmer and protected by intellectual property laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Limitation of Liability</h2>
              <p className="text-gray-600 mb-4">
                Adopt-A-Farmer acts as a facilitator between farmers and adopters. While we verify users and monitor 
                activities, we are not liable for disputes between parties or agricultural outcomes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Termination</h2>
              <p className="text-gray-600 mb-4">
                We reserve the right to suspend or terminate accounts that violate these terms or engage in 
                fraudulent activities.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact Information</h2>
              <p className="text-gray-600">
                For questions about these terms, contact us at:<br />
                Email: <a href="mailto:legal@adoptafarmer.co.ke" className="text-fresh-green hover:underline">legal@adoptafarmer.co.ke</a>
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsOfService;
