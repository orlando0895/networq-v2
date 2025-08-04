import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Calendar, Users, Radar, MessageSquare, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const navItems: NavItem[] = [
  {
    id: 'events',
    label: 'Events',
    icon: Calendar,
    path: '/events'
  },
  {
    id: 'connections',
    label: 'Connections',
    icon: Users,
    path: '/'
  },
  {
    id: 'discovery',
    label: 'Discovery',
    icon: Radar,
    path: '/discovery'
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: MessageSquare,
    path: '/messages'
  },
  {
    id: 'profile',
    label: 'Me',
    icon: User,
    path: '/profile'
  }
];

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 px-2 py-1 rounded-lg transition-colors",
                active 
                  ? "text-primary bg-primary/10" 
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Icon className={cn("h-5 w-5 mb-1", active && "text-primary")} />
              <span className={cn(
                "text-xs font-medium truncate",
                active && "text-primary"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;