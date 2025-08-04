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
          action={
            <Button size="sm" variant="outline" className="touch-target" onClick={() => navigate('/profile/manage')}>
              <Edit className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Edit</span>
            </Button>
          }
        />
      }
    >
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="card" className="text-xs">My Card</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs">Settings</TabsTrigger>
          <TabsTrigger value="account" className="text-xs">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Profile Overview */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile?.avatar_url || contactCard?.avatar_url} />
                  <AvatarFallback className="text-xl">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold">{profile?.full_name || contactCard?.name || user?.email}</h2>
                    {isPremium && (
                      <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                    {hasActiveBoost && (
                      <Badge className="bg-gradient-to-r from-purple-400 to-purple-600 text-white">
                        <Zap className="h-3 w-3 mr-1" />
                        Boosted
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">{profile?.bio || 'No bio added'}</p>
                  <p className="text-muted-foreground text-xs">{user?.email}</p>
                  {profile?.location_name && (
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{profile.location_name}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Status & Upgrade */}
          {!isPremium && (
            <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                      <Crown className="h-5 w-5 text-yellow-900" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-yellow-900">Upgrade to Premium</h3>
                      <p className="text-sm text-yellow-700">Unlock advanced features and unlimited access</p>
                    </div>
                  </div>
                  <Button size="sm" className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900 hover:from-yellow-500 hover:to-yellow-700">
                    <Crown className="h-4 w-4 mr-1" />
                    Upgrade
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Discovery Stats */}
          {discoveryStats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Discovery Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{discoveryStats.profile_views || 0}</div>
                    <div className="text-sm text-muted-foreground">Profile Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{discoveryStats.profile_likes || 0}</div>
                    <div className="text-sm text-muted-foreground">Likes</div>
                  </div>
                </div>
                {hasActiveBoost && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 text-purple-700">
                      <Zap className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Boost active until {new Date(discoveryStats.active_boost_expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-16 flex-col gap-1"
                  onClick={() => setShowQRCode(true)}
                >
                  <QrCode className="h-5 w-5" />
                  <span className="text-xs">View QR Code</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 flex-col gap-1"
                  onClick={copyShareLink}
                >
                  <Share2 className="h-5 w-5" />
                  <span className="text-xs">Share Profile</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 flex-col gap-1"
                  onClick={() => navigate('/discovery')}
                >
                  <Globe className="h-5 w-5" />
                  <span className="text-xs">Discovery</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 flex-col gap-1"
                  disabled={!isPremium}
                >
                  <Zap className="h-5 w-5" />
                  <span className="text-xs">Boost Profile</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="card" className="space-y-6 mt-6">
          {/* Contact Card Overview */}
          {contactCard && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Your Digital Business Card
                </CardTitle>
                <CardDescription>
                  Share your professional information with others
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={contactCard.avatar_url} />
                      <AvatarFallback>
                        {contactCard.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{contactCard.name}</div>
                      <div className="text-sm text-muted-foreground">{contactCard.company || contactCard.email}</div>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => navigate('/profile/manage')}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Share Code:</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono">
                        {contactCard.share_code}
                      </Badge>
                      <Button size="sm" variant="ghost" onClick={copyShareCode}>
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={regenerateShareCode}>
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Button onClick={copyShareLink} className="w-full">
                    <Share2 className="h-4 w-4 mr-2" />
                    Copy Share Link
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowQRCode(true)}
                    className="w-full"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    View QR Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!contactCard && (
            <Card>
              <CardContent className="p-6 text-center">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No Contact Card Yet</h3>
                <p className="text-muted-foreground mb-4">Create your digital business card to start sharing your professional information.</p>
                <Button onClick={() => navigate('/profile/manage')}>
                  <Edit className="h-4 w-4 mr-2" />
                  Create Contact Card
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6 mt-6">
          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Discovery Settings
              </CardTitle>
              <CardDescription>
                Control how others can find and interact with your profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Visible in Discovery</div>
                  <div className="text-sm text-muted-foreground">Allow others to find your profile in discovery</div>
                </div>
                <Switch
                  checked={discoveryVisible}
                  onCheckedChange={updateDiscoveryVisibility}
                />
              </div>
            </CardContent>
          </Card>

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
                  <div className="text-sm text-muted-foreground">Get notified when someone views or likes your profile</div>
                </div>
                <Switch defaultChecked />
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