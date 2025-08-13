import React, { useState, useEffect } from 'react';
import { 
  User, Settings, Share2, QrCode, LogOut, Edit, Bell, Shield, Crown, 
  Zap, MapPin, Eye, Globe, CreditCard, Star, Trash2, ChevronRight,
  Camera, Copy, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useUserContactCard } from '@/hooks/useUserContactCard';
import { MobileLayout, PageHeader } from '@/components/MobileLayout';
import { QRCodeShare, DeleteAccountDialog } from '@/components/LazyComponents';
import { MyCard } from '@/components/MyCard';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { contactCard, regenerateShareCode } = useUserContactCard();
  const [profile, setProfile] = useState<any>(null);
  const [discoveryVisible, setDiscoveryVisible] = useState(true);
  const [showQRCode, setShowQRCode] = useState(false);
  const [discoveryStats, setDiscoveryStats] = useState<any>(null);

  // Fetch user profile and settings
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
          setDiscoveryVisible(profileData.discovery_visible);
        }

        // Fetch discovery stats
        const { data: statsData } = await supabase
          .rpc('get_user_discovery_stats', { user_uuid: user.id });
        
        if (statsData && statsData.length > 0) {
          setDiscoveryStats(statsData[0]);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [user]);

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

  const updateDiscoveryVisibility = async (visible: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ discovery_visible: visible })
        .eq('id', user.id);

      if (error) throw error;

      setDiscoveryVisible(visible);
      toast({
        title: "Settings updated",
        description: `Discovery visibility ${visible ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    }
  };

  const copyShareCode = () => {
    if (contactCard?.share_code) {
      navigator.clipboard.writeText(contactCard.share_code);
      toast({
        title: "Copied!",
        description: "Share code copied to clipboard."
      });
    }
  };

  const copyShareLink = () => {
    if (contactCard?.share_code) {
      const shareUrl = `${window.location.origin}/?add=${contactCard.share_code}`;
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Copied!",
        description: "Share link copied to clipboard."
      });
    }
  };

  const isPremium = profile?.is_premium || false;
  const hasActiveBoost = discoveryStats?.active_boost_expires_at && new Date(discoveryStats.active_boost_expires_at) > new Date();

  return (
    <MobileLayout
      header={
        <PageHeader
          title="Profile"
          subtitle="Manage your account and settings"
        />
      }
    >
      <Tabs defaultValue="card" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="card" className="text-xs">My Card</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
          <TabsTrigger value="account" className="text-xs">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="card" className="space-y-6 mt-6">
          <MyCard />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6 mt-6">

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">New Messages</div>
                  <div className="text-sm text-muted-foreground">Get notified when you receive new messages</div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Discovery Interactions</div>
                  <div className="text-sm text-muted-foreground">Coming soon - Get notified when someone views or likes your profile</div>
                </div>
                <Switch disabled />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Event Updates</div>
                  <div className="text-sm text-muted-foreground">Get notified about events you're attending</div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-between">
                <span>Change Password</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <span>Two-Factor Authentication</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <span>Privacy Settings</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6 mt-6">
          {/* Subscription Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-medium">
                    {isPremium ? 'Premium Plan' : 'Free Plan'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isPremium 
                      ? profile?.subscription_expires_at 
                        ? `Expires ${new Date(profile.subscription_expires_at).toLocaleDateString()}`
                        : 'Active subscription'
                      : 'Limited features available'
                    }
                  </div>
                </div>
                {isPremium && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
              {!isPremium && (
                <Button className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900 hover:from-yellow-500 hover:to-yellow-700">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to Premium
                </Button>
              )}
              {isPremium && (
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    Manage Subscription
                  </Button>
                  <Button variant="outline" className="w-full">
                    Billing History
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-between">
                <span>Export Data</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <span>Support & Help</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                <span>Terms & Privacy</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Sign Out */}
          <Card>
            <CardContent className="p-4">
              <Button 
                variant="destructive" 
                className="w-full touch-target"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Permanently delete your account and all data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeleteAccountDialog />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* QR Code Dialog */}
      {contactCard && showQRCode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Share Your Contact</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowQRCode(false)}>
                ✕
              </Button>
            </div>
            <QRCodeShare />
          </div>
        </div>
      )}
    </MobileLayout>
  );
};

export default Profile;