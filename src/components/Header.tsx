
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LogOut, User, MessageSquare } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      console.log('🔄 Attempting to sign out...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error);
        toast({
          title: "Error",
          description: `Failed to sign out: ${error.message}`,
          variant: "destructive",
        });
      } else {
        console.log('✅ Successfully signed out');
        toast({
          title: "Signed out",
          description: "You have been successfully signed out.",
        });
      }
    } catch (err: any) {
      console.error('💥 Unexpected sign out error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred during sign out.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-6">
            <Link to={user ? "/app" : "/"} className="text-xl font-bold text-gray-900">
              Networq
            </Link>
            {user && (
              <nav className="flex items-center space-x-4">
                <Link
                  to="/app"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === '/app' ? 'text-primary' : 'text-gray-600'
                  }`}
                >
                  Contacts
                </Link>
                <Link
                  to="/messages"
                  className={`flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === '/messages' ? 'text-primary' : 'text-gray-600'
                  }`}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Messages</span>
                </Link>
              </nav>
            )}
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
