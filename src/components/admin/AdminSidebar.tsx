
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  Package, 
  BarChart, 
  Settings,
  UserCheck,
  Heart
} from 'lucide-react';

const AdminSidebar = () => {
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Farmers', href: '/admin/farmers', icon: Users },
    { name: 'Adopters', href: '/admin/adopters', icon: UserCheck },
    { name: 'Adoptions', href: '/admin/adoptions', icon: Heart },
    { name: 'Payments', href: '/admin/payments', icon: DollarSign },
    { name: 'Suppliers', href: '/admin/suppliers', icon: Package },
    { name: 'Reports', href: '/admin/reports', icon: BarChart },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200">
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-farmer-primary">Admin Panel</h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive(item.href)
                  ? 'bg-farmer-primary text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminSidebar;
