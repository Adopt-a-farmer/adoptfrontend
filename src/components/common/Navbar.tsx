
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut, isAdmin } = useAuth();

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/a76a1500-f6bb-4afb-a610-80f8ea83f1fe.png" 
                alt="Adopt-a-Farmer Logo" 
                className="h-12 w-auto object-contain"
              />
            </Link>
          </div>
          
          <div className="hidden md:block">
            <nav className="ml-10 flex items-center space-x-8">
              <Link to="/" className="px-3 py-2 text-sm font-semibold text-gray-700 hover:text-fresh-green transition-colors duration-300">
                Home
              </Link>
              <Link to="/browse-farmers" className="px-3 py-2 text-sm font-semibold text-gray-700 hover:text-fresh-green transition-colors duration-300">
                Browse Farmers
              </Link>
              <Link to="/how-it-works" className="px-3 py-2 text-sm font-semibold text-gray-700 hover:text-fresh-green transition-colors duration-300">
                How It Works
              </Link>
            </nav>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar>
                        <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} />
                        <AvatarFallback>
                          {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      <div>{profile?.full_name || 'User'}</div>
                      <div className="text-xs font-normal text-gray-500">{user?.email}</div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin/dashboard">Admin Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    {user?.role === 'farmer' && (
                      <DropdownMenuItem asChild>
                        <Link to="/farmer/dashboard">Farmer Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    {user?.role === 'adopter' && (
                      <DropdownMenuItem asChild>
                        <Link to="/adopter/dashboard">Adopter Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    {user?.role === 'expert' && (
                      <DropdownMenuItem asChild>
                        <Link to="/expert/dashboard">Expert Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link to="/auth/login">
                    <Button variant="ghost" className="text-gray-700 hover:text-fresh-green hover:bg-fresh-green/10">Log in</Button>
                  </Link>
                  <Link to="/auth/register">
                    <Button className="bg-fresh-green hover:bg-farmer-secondary text-white shadow-md">Sign up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-fresh-green/10 hover:text-fresh-green transition-colors duration-300"
              onClick={() => setIsOpen(!isOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md">
          <div className="space-y-1 px-4 pb-6 pt-4">
            <Link
              to="/"
              className="block rounded-lg px-3 py-3 text-base font-semibold text-gray-700 hover:bg-fresh-green/10 hover:text-fresh-green transition-colors duration-300"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/browse-farmers"
              className="block rounded-lg px-3 py-3 text-base font-semibold text-gray-700 hover:bg-fresh-green/10 hover:text-fresh-green transition-colors duration-300"
              onClick={() => setIsOpen(false)}
            >
              Browse Farmers
            </Link>
            <Link
              to="/how-it-works"
              className="block rounded-lg px-3 py-3 text-base font-semibold text-gray-700 hover:bg-fresh-green/10 hover:text-fresh-green transition-colors duration-300"
              onClick={() => setIsOpen(false)}
            >
              How It Works
            </Link>
            
            {user ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                )}
                {user?.role === 'farmer' && (
                  <Link
                    to="/farmer/dashboard"
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    Farmer Dashboard
                  </Link>
                )}
                {user?.role === 'adopter' && (
                  <Link
                    to="/adopter/dashboard"
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    Adopter Dashboard
                  </Link>
                )}
                {user?.role === 'expert' && (
                  <Link
                    to="/expert/dashboard"
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                    onClick={() => setIsOpen(false)}
                  >
                    Expert Dashboard
                  </Link>
                )}
                <button
                  className="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-gray-900 hover:bg-gray-50"
                  onClick={() => {
                    signOut();
                    setIsOpen(false);
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/auth/register"
                  className="block rounded-md px-3 py-2 text-base font-medium text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
