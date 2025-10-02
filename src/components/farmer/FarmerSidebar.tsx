import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Sprout, 
  Users, 
  FileText, 
  MessageCircle, 
  Wallet, 
  Calendar, 
  BookOpen, 
  BarChart3, 
  Settings 
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

const farmerMenuItems = [
  { title: 'Dashboard', url: '/farmer', icon: Home },
  { title: 'Farm Profile', url: '/farmer/farm-profile', icon: Sprout },
  { title: 'My Adopters', url: '/farmer/adopters', icon: Users },
  { title: 'Updates & Media', url: '/farmer/updates', icon: FileText },
  { title: 'Messages', url: '/farmer/messages', icon: MessageCircle },
  { title: 'Wallet', url: '/farmer/wallet', icon: Wallet },
  { title: 'Farm Visits', url: '/farmer/visits', icon: Calendar },
  { title: 'Knowledge Hub', url: '/farmer/knowledge', icon: BookOpen },
  { title: 'Reports', url: '/farmer/reports', icon: BarChart3 },
  { title: 'Settings', url: '/farmer/settings', icon: Settings },
];

const FarmerSidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => {
    if (path === '/farmer') {
      return currentPath === '/farmer';
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = (path: string) =>
    isActive(path) ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted/50';

  return (
    <Sidebar className={collapsed ? 'w-14' : 'w-60'}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-semibold">
            {!collapsed && 'Farmer Dashboard'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {farmerMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default FarmerSidebar;