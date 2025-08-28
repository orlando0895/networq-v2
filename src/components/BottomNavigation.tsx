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
    id: 'connections',
    label: 'Connections',
    icon: Users,
    path: '/app'
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
    if (path === '/app') {
      return location.pathname === '/app';
    }
    return location.pathname.startsWith(path);
  };

  // Hide bottom navigation while inside a specific message thread
  const searchParams = new URLSearchParams(location.search);
  const state = (location.state as any) || {};
  const isInMessageThread =
    location.pathname.startsWith('/messages') &&
    (searchParams.has('conversationId') || Boolean(state.conversationId));

  if (isInMessageThread) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden pb-safe-bottom px-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 px-3 py-2 rounded-lg transition-colors touch-target",
                active 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground"
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