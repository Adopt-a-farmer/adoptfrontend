
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMediaQuery } from '@/hooks/use-mobile';

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
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return (
    <div className={`flex flex-col bg-gray-800 text-white transition-all duration-300 ${isMobile ? 'w-16' : 'w-64'}`}>
      <div className="flex h-16 items-center justify-center border-b border-gray-700">
        {!isMobile ? (
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        ) : (
          <h1 className="text-xl font-bold">AD</h1>
        )}
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-1.5">
          <TooltipProvider delayDuration={0}>
            {sidebarItems.map((item) => (
              <li key={item.href}>
                {isMobile ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.href}
                        className={cn(
                          "flex items-center justify-center rounded-lg p-2.5 text-sm font-medium transition-all hover:bg-gray-700",
                          location.pathname === item.href ? "bg-gray-700" : "text-gray-300"
                        )}
                      >
                        {item.icon}
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.title}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
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
                )}
              </li>
            ))}
          </TooltipProvider>
        </ul>
      </nav>
    </div>
  );
};

export default AdminSidebar;
