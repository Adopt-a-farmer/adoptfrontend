import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  FileText, 
  User, 
  BookOpen, 
  TrendingUp,
  Edit3,
  Users,
  MessageCircle,
  Calendar,
  Settings,
  HandHeart,
  MapPin
} from 'lucide-react';

const expertMenuItems = [
  { title: 'Dashboard', url: '/expert', icon: Home },
  { title: 'My Articles', url: '/expert/articles', icon: FileText },
  { title: 'Create Article', url: '/expert/articles/create', icon: Edit3 },
  { title: 'Mentorships', url: '/expert/mentorships', icon: HandHeart },
  { title: 'Discover Farmers', url: '/expert/farmers', icon: Users },
  { title: 'Investor Relations', url: '/expert/investors', icon: TrendingUp },
  { title: 'Messages', url: '/expert/messages', icon: MessageCircle },
  { title: 'Farm Visits', url: '/expert/visits', icon: MapPin },
  { title: 'Knowledge Hub', url: '/knowledge', icon: BookOpen },
  { title: 'Profile', url: '/expert/profile', icon: User },
  { title: 'Settings', url: '/expert/settings', icon: Settings },
];

const ExpertSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/expert') {
      return currentPath === '/expert';
    }
    return currentPath.startsWith(path);
  };

  return (
    <div className="w-64 bg-white h-full border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold text-gray-900">📚 Expert Dashboard</h2>
      </div>
      
      <nav className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {expertMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.title}
                to={item.url}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.url)
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="mr-3 h-4 w-4" />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default ExpertSidebar;