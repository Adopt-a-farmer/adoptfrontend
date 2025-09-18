
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo and About */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-fresh-green to-farmer-secondary flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <span className="font-heading font-bold text-2xl text-white">Adopt-A-Farmer</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Connecting smallholder farmers with supporters to build sustainable agriculture 
              and improve food security across Kenya through meaningful partnerships.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-gray-400 hover:text-fresh-green transition-colors duration-300 p-2 rounded-lg hover:bg-fresh-green/10">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-fresh-green transition-colors duration-300 p-2 rounded-lg hover:bg-fresh-green/10">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="text-gray-400 hover:text-fresh-green transition-colors duration-300 p-2 rounded-lg hover:bg-fresh-green/10">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/how-it-works" className="text-gray-400 hover:text-fresh-green transition-colors duration-300 flex items-center group">
                <span className="w-2 h-2 bg-fresh-green rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                How It Works
              </Link></li>
              <li><Link to="/browse-farmers" className="text-gray-400 hover:text-fresh-green transition-colors duration-300 flex items-center group">
                <span className="w-2 h-2 bg-fresh-green rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                Browse Farmers
              </Link></li>
              <li><Link to="/success-stories" className="text-gray-400 hover:text-fresh-green transition-colors duration-300 flex items-center group">
                <span className="w-2 h-2 bg-fresh-green rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                Success Stories
              </Link></li>
              <li><Link to="/knowledge-hub" className="text-gray-400 hover:text-fresh-green transition-colors duration-300 flex items-center group">
                <span className="w-2 h-2 bg-fresh-green rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                Knowledge Hub
              </Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-fresh-green transition-colors duration-300 flex items-center group">
                <span className="w-2 h-2 bg-fresh-green rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                FAQ
              </Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Resources</h3>
            <ul className="space-y-3">
              <li><Link to="/for-farmers" className="text-gray-400 hover:text-fresh-green transition-colors duration-300 flex items-center group">
                <span className="w-2 h-2 bg-fresh-green rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                For Farmers
              </Link></li>
              <li><Link to="/for-adopters" className="text-gray-400 hover:text-fresh-green transition-colors duration-300 flex items-center group">
                <span className="w-2 h-2 bg-fresh-green rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                For Adopters
              </Link></li>
              <li><Link to="/farming-calendar" className="text-gray-400 hover:text-fresh-green transition-colors duration-300 flex items-center group">
                <span className="w-2 h-2 bg-fresh-green rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                Farming Calendar
              </Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-fresh-green transition-colors duration-300 flex items-center group">
                <span className="w-2 h-2 bg-fresh-green rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                Blog
              </Link></li>
              <li><Link to="/privacy-policy" className="text-gray-400 hover:text-fresh-green transition-colors duration-300 flex items-center group">
                <span className="w-2 h-2 bg-fresh-green rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                Privacy Policy
              </Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">Get In Touch</h3>
            <ul className="space-y-4">
              <li className="flex items-center text-gray-400">
                <MapPin className="h-5 w-5 text-fresh-green mr-3 flex-shrink-0" />
                <span>Nairobi, Kenya</span>
              </li>
              <li className="flex items-center text-gray-400">
                <Mail className="h-5 w-5 text-fresh-green mr-3 flex-shrink-0" />
                <a href="mailto:info@adoptafarmer.co.ke" className="hover:text-fresh-green transition-colors duration-300">
                  info@adoptafarmer.co.ke
                </a>
              </li>
              <li className="flex items-center text-gray-400">
                <Phone className="h-5 w-5 text-fresh-green mr-3 flex-shrink-0" />
                <a href="tel:+254700000000" className="hover:text-fresh-green transition-colors duration-300">
                  +254 700 000000
                </a>
              </li>
              <li className="pt-2">
                <Link to="/contact" className="bg-gradient-to-r from-fresh-green to-farmer-secondary text-white px-6 py-3 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 inline-block font-semibold">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-700 mt-16 pt-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Stay Updated</h3>
            <p className="text-gray-400 mb-8">
              Get the latest news about agricultural innovation and success stories from our farming community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-full bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-fresh-green focus:ring-2 focus:ring-fresh-green/20"
              />
              <button className="bg-fresh-green text-white px-8 py-3 rounded-full hover:bg-farmer-secondary transition-colors duration-300 font-semibold">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 text-sm">
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Adopt-A-Farmer. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/terms" className="hover:text-fresh-green transition-colors duration-300">Terms of Service</Link>
              <Link to="/privacy" className="hover:text-fresh-green transition-colors duration-300">Privacy Policy</Link>
              <Link to="/cookies" className="hover:text-fresh-green transition-colors duration-300">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
