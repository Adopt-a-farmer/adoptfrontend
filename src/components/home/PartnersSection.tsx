import React from 'react';

const PartnersSection = () => {
  const partners = [
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Our Partners
          </h2>
          <div className="w-24 h-1 bg-fresh-green mx-auto mb-6"></div>
          <p className="text-base md:text-lg text-gray-700">
            Collaborating with leading organizations to bring sustainable agricultural solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {partners.map((partner, index) => (
            <div key={index} className="group">
              <div className="bg-gray-50 p-8 rounded-2xl hover:shadow-lg transition-all duration-300 border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 flex items-center justify-center mb-4 bg-white rounded-xl group-hover:scale-105 transition-transform duration-300">
                    <img 
                      src={partner.logo} 
                      alt={partner.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{partner.name}</h3>
                  <p className="text-sm text-gray-600">{partner.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
