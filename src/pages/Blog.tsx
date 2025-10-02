import React from 'react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Blog = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <section className="bg-gradient-to-r from-fresh-green to-farmer-primary text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Blog</h1>
            <p className="text-xl text-white/90">
              Agricultural insights, tips, and stories from the field
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Blog Coming Soon</h2>
            <p className="text-lg text-gray-600 mb-8">
              We're preparing valuable content about agriculture, farming tips, and industry insights. Stay tuned!
            </p>
            <Link to="/knowledge">
              <Button className="bg-fresh-green hover:bg-farmer-secondary">
                Visit Knowledge Hub
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
