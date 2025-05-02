
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ImpactSection = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-farmer-primary/10 to-farmer-secondary/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Our Impact</h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Through our platform, we're creating real change for farmers and communities across Kenya
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center p-6 border-none shadow-md bg-white">
            <CardContent className="pt-6">
              <div className="impact-counter">1,280</div>
              <h3 className="text-xl font-semibold">Farmers Supported</h3>
              <p className="text-gray-600 mt-2">Smallholder farmers connected with adopters through our platform</p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 border-none shadow-md bg-white">
            <CardContent className="pt-6">
              <div className="impact-counter">$850K</div>
              <h3 className="text-xl font-semibold">Funds Raised</h3>
              <p className="text-gray-600 mt-2">Financial support provided directly to farmers for their growth</p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 border-none shadow-md bg-white">
            <CardContent className="pt-6">
              <div className="impact-counter">3,500</div>
              <h3 className="text-xl font-semibold">Acres Cultivated</h3>
              <p className="text-gray-600 mt-2">Previously unused land now producing food and supporting families</p>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="environmental">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="environmental">Environmental</TabsTrigger>
              <TabsTrigger value="economic">Economic</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
            </TabsList>
            
            <TabsContent value="environmental" className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-4 text-farmer-primary">Environmental Impact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-lg mb-2">Sustainable Practices</h4>
                  <p className="text-gray-700">
                    Our farmers implement sustainable agricultural practices that preserve soil health, 
                    reduce water usage, and minimize chemical inputs. We've helped reduce agricultural 
                    carbon footprint by 15% across our network.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Biodiversity Protection</h4>
                  <p className="text-gray-700">
                    Through crop diversification and integrated pest management, our farmers have 
                    established over 500 acres of biodiverse farming systems that support local 
                    ecosystems and wildlife corridors.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="economic" className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-4 text-farmer-primary">Economic Impact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-lg mb-2">Income Growth</h4>
                  <p className="text-gray-700">
                    Farmers on our platform have seen an average income increase of 60% within their 
                    first year, allowing families to invest in education, healthcare, and farm improvements.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Market Access</h4>
                  <p className="text-gray-700">
                    Our network has facilitated over $1.2 million in direct-to-consumer and wholesale 
                    market transactions, eliminating middlemen and increasing farmer profit margins.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="social" className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-4 text-farmer-primary">Social Impact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-lg mb-2">Community Development</h4>
                  <p className="text-gray-700">
                    Through improved livelihoods, our farmers have invested back into their communities, 
                    supporting 28 local schools and healthcare initiatives across rural Kenya.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Women Empowerment</h4>
                  <p className="text-gray-700">
                    47% of our farmers are women, many of whom have become community leaders and trainers, 
                    sharing sustainable farming practices and financial literacy with others.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default ImpactSection;
