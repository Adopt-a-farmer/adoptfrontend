
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ErrorBoundary from '@/components/ui/error-boundary';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useAdopterDashboard } from '@/hooks/useAdopterDashboard';
import { 
  Users, 
  Calendar, 
  Wallet, 
  Book,
  Menu,
  X,
  Settings,
  LogOut,
  MessageCircle,
  Search,
  TrendingUp,
  Home,
  Eye,
  HandHeart
} from 'lucide-react';

interface AdopterLayoutProps {
  children: React.ReactNode;
}

const AdopterLayout = ({ children }: AdopterLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { stats } = useAdopterDashboard();

  const navigation = [
    { name: 'Dashboard', href: '/adopter', icon: Home, badge: null },
    { name: 'My Farmers', href: '/adopter/my-farmers', icon: Users, badge: stats?.adoptedFarmers || 0 },
    { name: 'Discover', href: '/adopter/discover', icon: Search, badge: null },
    { name: 'Mentoring', href: '/adopter/mentoring', icon: HandHeart, badge: null },
    { name: 'Messages', href: '/adopter/messages', icon: MessageCircle, badge: stats?.unreadMessages || 0 },
    { name: 'Wallet', href: '/adopter/wallet', icon: Wallet, badge: null },
    { name: 'Knowledge Hub', href: '/adopter/knowledge', icon: Book, badge: null },
    { name: 'Farm Visits', href: '/adopter/visits', icon: Calendar, badge: stats?.upcomingVisits || 0 },
    { name: 'Crowdfunding', href: '/adopter/crowdfunding', icon: TrendingUp, badge: null },
  ];

  const isActive = (path: string) => {
    if (path === '/adopter') {
      return location.pathname === '/adopter';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          <div className="flex items-center justify-between px-4 py-6">
            <img className="h-8 w-auto" src="/placeholder.svg" alt="Adopt-a-Farmer" />
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 px-4 pb-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md mb-1 ${
                    isActive(item.href)
                      ? 'bg-farmer-primary text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="flex items-center">
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </div>
                  {item.badge && item.badge > 0 && (
                    <Badge variant="secondary" className="bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                      {item.badge > 99 ? '99+' : item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex items-center flex-shrink-0 px-4 py-6">
            <img className="h-8 w-auto" src="/placeholder.svg" alt="Adopt-a-Farmer" />
            <span className="ml-2 text-xl font-bold text-farmer-primary">Adopt-a-Farmer</span>
          </div>
          <nav className="flex-1 px-4 pb-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md mb-1 ${
                    isActive(item.href)
                      ? 'bg-farmer-primary text-white'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </div>
                  {item.badge && item.badge > 0 && (
                    <Badge variant="secondary" className="bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center">
                      {item.badge > 99 ? '99+' : item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={(user?.user_metadata as { avatar_url?: string })?.avatar_url} />
                    <AvatarFallback>
                      {user?.email?.charAt(0).toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user?.email || 'Adopter'}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to="/adopter/profile" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6 bg-gray-50 min-h-screen">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
      {/* <ChatFloatingButton /> */} {/* Disabled due to Supabase integration issues */}
    </div>
  );
};

export default AdopterLayout;
