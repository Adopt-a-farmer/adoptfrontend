import React, { useState } from 'react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-fresh-green to-farmer-primary text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="/farmers1.jpg" alt="Background" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Get In Touch</h1>
            <p className="text-xl text-white/90">
              We're here to help and answer any questions you might have
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-8">
                  <div className="w-16 h-16 bg-fresh-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-fresh-green" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Location</h3>
                  <p className="text-gray-600">Nairobi, Kenya</p>
                  <p className="text-gray-600">East Africa</p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-8">
                  <div className="w-16 h-16 bg-fresh-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-fresh-green" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
                  <a href="mailto:info@adoptafarmer.co.ke" className="text-fresh-green hover:underline">
                    info@adoptafarmer.co.ke
                  </a>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-8">
                  <div className="w-16 h-16 bg-fresh-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-8 w-8 text-fresh-green" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Phone</h3>
                  <a href="tel:+254700000000" className="text-fresh-green hover:underline">
                    +254 700 000 000
                  </a>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
                <p className="text-gray-600 mb-8">
                  Have a question or need assistance? Fill out the form and we'll get back to you as soon as possible.
                </p>
                
                <Card>
                  <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fresh-green focus:border-transparent"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fresh-green focus:border-transparent"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fresh-green focus:border-transparent"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                        <textarea
                          required
                          rows={5}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fresh-green focus:border-transparent"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        />
                      </div>
                      
                      <Button type="submit" className="w-full bg-fresh-green hover:bg-farmer-secondary">
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">About Our Location</h2>
                <div className="bg-white rounded-lg p-6 shadow-lg mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">We Are Found in Kenya</h3>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Adopt-A-Farmer is proudly based in Nairobi, Kenya, the heart of East Africa's agricultural innovation. 
                    From here, we connect with farmers across all 47 counties of Kenya, supporting sustainable agriculture 
                    and rural development throughout the country.
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Our strategic location allows us to work closely with farming communities, understand their unique 
                    challenges, and provide tailored support that makes a real difference.
                  </p>
                  <div className="bg-fresh-green/10 rounded-lg p-4 mt-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Coverage Area</h4>
                    <p className="text-gray-600">🇰🇪 All 47 Counties in Kenya</p>
                    <p className="text-gray-600">🌍 East Africa Region</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-fresh-green to-farmer-primary text-white rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Business Hours</h3>
                  <div className="space-y-2">
                    <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                    <p>Saturday: 9:00 AM - 4:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                  <p className="mt-4 text-sm text-white/90">
                    * Emergency support available 24/7 for farmers
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
