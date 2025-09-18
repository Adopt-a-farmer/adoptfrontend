
import React from 'react';
import { Bell, Search, User, LayoutDashboard, Leaf, Users, CreditCard, PackageOpen, FileText, BarChart3, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

const AdminHeader = () => {
  const { user, profile, signOut } = useAuth();
  const isMobile = useIsMobile();
  
  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/'; // Redirect to home after logout
  };
  
  return (
    <header className="border-b bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        {!isMobile && (
          <div className="relative w-96 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search..."
              className="pl-8"
            />
          </div>
        )}
        
        <div className={`flex items-center ${isMobile ? 'w-full justify-between' : 'space-x-4'}`}>
          {isMobile && (
            <h2 className="text-xl font-semibold">Admin Panel</h2>
          )}
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-red-500 p-0 text-[10px]">
                3
              </Badge>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || 'User'} />
                    <AvatarFallback>
                      {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="font-medium">{profile?.full_name || 'User'}</div>
                  <div className="text-xs font-normal text-gray-500">{user?.email}</div>
                  {profile?.role === 'admin' && (
                    <div className="text-xs font-medium text-green-600 mt-1">Admin</div>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Admin Navigation Items */}
                <DropdownMenuItem asChild>
                  <Link to="/admin/dashboard" className="flex items-center cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link to="/admin/farmers" className="flex items-center cursor-pointer">
                    <Leaf className="mr-2 h-4 w-4" />
                    Farmers
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link to="/admin/adopters" className="flex items-center cursor-pointer">
                    <Users className="mr-2 h-4 w-4" />
                    Adopters
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link to="/admin/payments" className="flex items-center cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Payments
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link to="/admin/suppliers" className="flex items-center cursor-pointer">
                    <PackageOpen className="mr-2 h-4 w-4" />
                    Suppliers
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link to="/admin/analytics" className="flex items-center cursor-pointer">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Analytics
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <Link to="/admin/settings" className="flex items-center cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
