
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Leaf, 
  CreditCard, 
  PackageOpen, 
  Settings, 
  LayoutDashboard,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
  {
    title: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    href: '/admin/dashboard',
  },
  {
    title: 'Farmers',
    icon: <Leaf className="h-5 w-5" />,
    href: '/admin/farmers',
  },
  {
    title: 'Adopters',
    icon: <Users className="h-5 w-5" />,
    href: '/admin/adopters',
  },
  {
    title: 'Payments',
    icon: <CreditCard className="h-5 w-5" />,
    href: '/admin/payments',
  },
  {
    title: 'Suppliers',
    icon: <PackageOpen className="h-5 w-5" />,
    href: '/admin/suppliers',
  },
  {
    title: 'Reports',
    icon: <FileText className="h-5 w-5" />,
    href: '/admin/reports',
  },
  {
    title: 'Analytics',
    icon: <BarChart3 className="h-5 w-5" />,
    href: '/admin/analytics',
  },
  {
    title: 'Settings',
    icon: <Settings className="h-5 w-5" />,
    href: '/admin/settings',
  },
];

const AdminSidebar = () => {
  const location = useLocation();
  
  return (
    <div className="flex w-64 flex-col bg-gray-800 text-white">
      <div className="flex h-16 items-center justify-center border-b border-gray-700">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-1.5">
          {sidebarItems.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className={cn(
                  "flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all hover:bg-gray-700",
                  location.pathname === item.href ? "bg-gray-700" : "text-gray-300"
                )}
              >
                {item.icon}
                <span className="ml-3">{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;
