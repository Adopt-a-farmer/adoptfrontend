import React from 'react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';

const FAQPage = () => {
  const faqs = [
    {
      question: "What is Adopt-A-Farmer?",
      answer: "Adopt-A-Farmer is a digital platform connecting smallholder farmers with supporters who provide financing, resources, and expertise to help them grow their agricultural operations sustainably."
    },
    {
      question: "How does the adoption process work?",
      answer: "Browse verified farmer profiles, select a farmer you'd like to support, choose an adoption package, make a secure payment, and start receiving regular updates about your adopted farm's progress."
    },
    {
      question: "What happens to my contribution?",
      answer: "Your contribution goes directly to the farmer after platform and payment processing fees. Farmers use these funds for seeds, equipment, training, and other farm improvements."
    },
    {
      question: "How are farmers verified?",
      answer: "All farmers undergo a rigorous verification process including identity checks, farm visits, documentation review, and assessment of their agricultural practices."
    },
    {
      question: "Can I visit my adopted farmer?",
      answer: "Yes! We encourage adopters to visit their farmers. Coordinate with your farmer through the platform messaging system to arrange a visit."
    },
    {
      question: "What kind of updates will I receive?",
      answer: "You'll receive monthly updates via SMS, WhatsApp, email, and your dashboard, including photos, progress reports, harvest information, and financial updates."
    },
    {
      question: "Is my payment secure?",
      answer: "Yes, all payments are processed through secure, PCI-compliant payment gateways. We use industry-standard encryption to protect your financial information."
    },
    {
      question: "Can I support multiple farmers?",
      answer: "Absolutely! You can adopt as many farmers as you wish. Each adoption is managed separately in your dashboard."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero */}
      <section className="bg-gradient-to-r from-fresh-green to-farmer-primary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Frequently Asked Questions</h1>
            <p className="text-xl text-white/90">
              Find answers to common questions about our platform
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQPage;
