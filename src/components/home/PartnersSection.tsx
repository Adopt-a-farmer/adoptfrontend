import React from 'react';

const PartnersSection = () => {
  const partners = [
    {
      name: "Kenchic",
      logo: "/partners/Kenchic_idk4A_g_4A_0.png",
      description: "Leading poultry producer"
    },
    {
      name: "Mkulima Young",
      logo: "/partners/mkulimayoung.png", 
      description: "Youth in agriculture"
    },
    {
      name: "Paystack",
      logo: "/partners/paystack.svg",
      description: "Secure payments"
    },
    {
      name: "Agricultural Partners",
      logo: "/partners/idulfDyjPw_logos.svg",
      description: "Technology solutions"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-fresh-green font-semibold text-lg">Trusted By</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-6">
            Our Strategic Partners
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We collaborate with leading organizations to bring you the best in agricultural innovation, 
            secure payments, and sustainable farming solutions.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
          {partners.map((partner, index) => (
            <div key={index} className="group">
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 flex items-center justify-center mb-4 bg-gray-50 rounded-xl group-hover:bg-fresh-green/10 transition-colors duration-300">
                    <img 
                      src={partner.logo} 
                      alt={partner.name}
                      className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{partner.name}</h3>
                  <p className="text-sm text-gray-600">{partner.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Partnership Stats */}
        <div className="mt-20 bg-gradient-to-r from-fresh-green to-farmer-secondary rounded-3xl p-12 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-4xl font-bold mb-2">15+</h3>
              <p className="text-xl opacity-90">Strategic Partners</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-2">98%</h3>
              <p className="text-xl opacity-90">Partnership Success Rate</p>
            </div>
            <div>
              <h3 className="text-4xl font-bold mb-2">5000+</h3>
              <p className="text-xl opacity-90">Farmers Connected</p>
            </div>
          </div>
        </div>

        {/* Become a Partner CTA */}
        <div className="text-center mt-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Interested in Partnering with Us?
          </h3>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our network of partners and help us transform agricultural practices across Kenya.
          </p>
          <button className="bg-fresh-green text-white px-8 py-4 rounded-full font-semibold hover:bg-farmer-secondary transition-colors duration-300 shadow-lg">
            Become a Partner
          </button>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
