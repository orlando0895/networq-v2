import React from 'react';
import { User, Settings, Share2, QrCode, LogOut, Edit, Bell, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Error",
          description: `Failed to sign out: ${error.message}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signed out",
          description: "You have been successfully signed out.",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during sign out.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Profile</h1>
              <p className="text-muted-foreground">Manage your account</p>
            </div>
            <Button size="sm" variant="outline" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Profile Overview */}
        <section>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{user?.email || 'User'}</h2>
                  <p className="text-muted-foreground">Premium Member</p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" className="flex items-center gap-2">
                      <Share2 className="h-4 w-4" />
                      Share Profile
                    </Button>
                    <Button size="sm" variant="outline" className="flex items-center gap-2">
                      <QrCode className="h-4 w-4" />
                      QR Code
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-4 text-center">
                <Edit className="h-6 w-6 mx-auto text-primary mb-2" />
                <div className="text-sm font-medium">Edit Profile</div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-4 text-center">
                <QrCode className="h-6 w-6 mx-auto text-primary mb-2" />
                <div className="text-sm font-medium">My QR Code</div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-4 text-center">
                <Bell className="h-6 w-6 mx-auto text-primary mb-2" />
                <div className="text-sm font-medium">Notifications</div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-4 text-center">
                <Settings className="h-6 w-6 mx-auto text-primary mb-2" />
                <div className="text-sm font-medium">Settings</div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Account Settings */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Account</h2>
          <div className="space-y-3">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">Notifications</div>
                    <div className="text-sm text-muted-foreground">Manage your notification preferences</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">Privacy & Security</div>
                    <div className="text-sm text-muted-foreground">Control your privacy settings</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium">App Settings</div>
                    <div className="text-sm text-muted-foreground">Customize your app experience</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Sign Out */}
        <section>
          <Card>
            <CardContent className="p-4">
              <Button 
                variant="destructive" 
                className="w-full flex items-center gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Profile;