
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-farmer-primary flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <span className="font-heading font-bold text-xl text-farmer-primary">Adopt-A-Farmer</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/how-it-works" className="text-gray-700 hover:text-farmer-primary transition-colors">
              How It Works
            </Link>
            <Link to="/browse-farmers" className="text-gray-700 hover:text-farmer-primary transition-colors">
              Browse Farmers
            </Link>
            <div className="relative group">
              <button className="flex items-center text-gray-700 hover:text-farmer-primary transition-colors">
                Resources <ChevronDown className="ml-1 h-4 w-4" />
              </button>
              <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <div className="py-1">
                  <Link to="/success-stories" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Success Stories</Link>
                  <Link to="/knowledge-hub" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Knowledge Hub</Link>
                  <Link to="/faq" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">FAQ</Link>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline" className="border-farmer-primary text-farmer-primary hover:bg-farmer-primary hover:text-white">
                  Log In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-farmer-primary text-white hover:bg-farmer-primary/90">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 focus:outline-none"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-2 border-t border-gray-200 animate-fade-in">
            <Link to="/how-it-works" className="block py-2 text-gray-700 hover:text-farmer-primary">
              How It Works
            </Link>
            <Link to="/browse-farmers" className="block py-2 text-gray-700 hover:text-farmer-primary">
              Browse Farmers
            </Link>
            <Link to="/success-stories" className="block py-2 text-gray-700 hover:text-farmer-primary">
              Success Stories
            </Link>
            <Link to="/knowledge-hub" className="block py-2 text-gray-700 hover:text-farmer-primary">
              Knowledge Hub
            </Link>
            <Link to="/faq" className="block py-2 text-gray-700 hover:text-farmer-primary">
              FAQ
            </Link>
            <div className="mt-4 space-y-2">
              <Link to="/login" className="block">
                <Button variant="outline" className="w-full border-farmer-primary text-farmer-primary hover:bg-farmer-primary hover:text-white">
                  Log In
                </Button>
              </Link>
              <Link to="/signup" className="block">
                <Button className="w-full bg-farmer-primary text-white hover:bg-farmer-primary/90">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
