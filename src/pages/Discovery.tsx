import React, { useState, useEffect } from 'react';
import { Radar, Users, Star, MapPin, Zap, Filter, Settings, Heart, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MobileLayout, PageHeader } from '@/components/MobileLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DiscoveryUser {
  id: string;
  full_name: string;
  bio?: string;
  job_title?: string;
  company?: string;
  avatar_url?: string;
  interests?: string[];
  location_name?: string;
  distance_km?: number;
  has_boost: boolean;
  last_active_at?: string;
  is_premium: boolean;
}

interface DiscoveryStats {
  profile_views: number;
  profile_likes: number;
  active_boost_expires_at?: string;
  discovery_visible: boolean;
}

const Discovery = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [discoveryUsers, setDiscoveryUsers] = useState<DiscoveryUser[]>([]);
  const [discoveryStats, setDiscoveryStats] = useState<DiscoveryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [radiusFilter, setRadiusFilter] = useState('50');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [discoveryVisible, setDiscoveryVisible] = useState(true);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
          // Default to a central location
          setUserLocation({ lat: 40.7128, lng: -74.0060 });
        }
      );
    }
  }, []);

  // Fetch discovery stats
  const fetchDiscoveryStats = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('get_user_discovery_stats', {
        user_uuid: user.id
      });

      if (error) throw error;
      const statsData = Array.isArray(data) ? data[0] : data;
      setDiscoveryStats(statsData);
      setDiscoveryVisible(statsData?.discovery_visible || false);
    } catch (error: any) {
      console.error('Error fetching discovery stats:', error);
    }
  };

  // Fetch users for discovery
  const fetchDiscoveryUsers = async () => {
    if (!userLocation || !user) return;

    try {
      setLoading(true);
      const radius = parseInt(radiusFilter);
      
      const { data, error } = await supabase.rpc('get_users_for_discovery', {
        current_user_lat: userLocation.lat,
        current_user_lon: userLocation.lng,
        radius_km: radius,
        limit_count: 20,
        exclude_viewed: true
      });

      if (error) throw error;
      setDiscoveryUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching discovery users:', error);
      toast({
        title: "Error",
        description: "Failed to load discovery users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Record interaction (view/like)
  const recordInteraction = async (viewedUserId: string, interactionType: 'view' | 'like') => {
    try {
      await supabase.rpc('record_discovery_interaction', {
        viewed_user_uuid: viewedUserId,
        interaction_type_param: interactionType
      });
    } catch (error: any) {
      console.error('Error recording interaction:', error);
    }
  };

  // Update discovery visibility
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
        description: `Discovery visibility ${visible ? 'enabled' : 'disabled'}`
      });
    } catch (error: any) {
      console.error('Error updating discovery settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive"
      });
    }
  };

  // Handle user card actions
  const handleViewProfile = async (discoveryUser: DiscoveryUser) => {
    await recordInteraction(discoveryUser.id, 'view');
    // Remove user from list after viewing
    setDiscoveryUsers(prev => prev.filter(u => u.id !== discoveryUser.id));
  };

  const handleLikeProfile = async (discoveryUser: DiscoveryUser) => {
    await recordInteraction(discoveryUser.id, 'like');
    // Remove user from list after liking
    setDiscoveryUsers(prev => prev.filter(u => u.id !== discoveryUser.id));
    toast({
      title: "Profile liked",
      description: `You liked ${discoveryUser.full_name}'s profile`
    });
  };

  const handlePassProfile = async (discoveryUser: DiscoveryUser) => {
    await recordInteraction(discoveryUser.id, 'view');
    // Remove user from list after passing
    setDiscoveryUsers(prev => prev.filter(u => u.id !== discoveryUser.id));
  };

  useEffect(() => {
    fetchDiscoveryStats();
  }, [user]);

  useEffect(() => {
    fetchDiscoveryUsers();
  }, [userLocation, radiusFilter]);

  const formatDistance = (distance?: number) => {
    if (!distance) return '';
    return distance < 1 ? `${(distance * 1000).toFixed(0)}m away` : `${distance.toFixed(1)}km away`;
  };

  const UserCard = ({ user: discoveryUser }: { user: DiscoveryUser }) => (
    <Card className="relative overflow-hidden">
      {/* Boost indicator */}
      {discoveryUser.has_boost && (
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
            <Zap className="h-3 w-3 mr-1" />
            Boosted
          </Badge>
        </div>
      )}

      {/* Premium indicator */}
      {discoveryUser.is_premium && !discoveryUser.has_boost && (
        <div className="absolute top-4 right-4 z-10">
          <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-200">
            <Star className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        </div>
      )}

      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Avatar */}
          <Avatar className="w-20 h-20">
            <AvatarImage src={discoveryUser.avatar_url} alt={discoveryUser.full_name} />
            <AvatarFallback className="text-lg font-semibold">
              {discoveryUser.full_name?.split(' ').map(n => n[0]).join('') || '?'}
            </AvatarFallback>
          </Avatar>

          {/* User Info */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">{discoveryUser.full_name}</h3>
            {discoveryUser.job_title && (
              <p className="text-sm text-muted-foreground">{discoveryUser.job_title}</p>
            )}
            {discoveryUser.company && (
              <p className="text-sm font-medium">{discoveryUser.company}</p>
            )}
            {discoveryUser.bio && (
              <p className="text-sm text-muted-foreground line-clamp-2">{discoveryUser.bio}</p>
            )}
          </div>

          {/* Location */}
          {discoveryUser.distance_km && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {formatDistance(discoveryUser.distance_km)}
            </div>
          )}

          {/* Interests */}
          {discoveryUser.interests && discoveryUser.interests.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center">
              {discoveryUser.interests.slice(0, 3).map((interest, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {interest}
                </Badge>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 touch-target"
              onClick={() => handlePassProfile(discoveryUser)}
            >
              <X className="h-4 w-4 mr-2" />
              Pass
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 touch-target"
              onClick={() => handleViewProfile(discoveryUser)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </Button>
            <Button
              size="sm"
              className="flex-1 touch-target"
              onClick={() => handleLikeProfile(discoveryUser)}
            >
              <Heart className="h-4 w-4 mr-2" />
              Like
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <MobileLayout
      header={
        <PageHeader
          title="Discovery"
          subtitle="Find people in your area"
          action={
            <div className="flex items-center gap-2">
              <Select value={radiusFilter} onValueChange={setRadiusFilter}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5km</SelectItem>
                  <SelectItem value="10">10km</SelectItem>
                  <SelectItem value="25">25km</SelectItem>
                  <SelectItem value="50">50km</SelectItem>
                  <SelectItem value="100">100km</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="touch-target">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Discovery Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="discovery-visible">Visible in Discovery</Label>
                      <Switch
                        id="discovery-visible"
                        checked={discoveryVisible}
                        onCheckedChange={updateDiscoveryVisibility}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      When enabled, other users can discover and connect with you based on location.
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          }
        />
      }
    >
      <div className="space-y-6">
        {/* Discovery Stats */}
        {discoveryStats && (
          <section className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Eye className="h-6 w-6 mx-auto text-primary mb-2" />
                <div className="text-2xl font-bold">{discoveryStats.profile_views}</div>
                <div className="text-sm text-muted-foreground">Profile Views</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Heart className="h-6 w-6 mx-auto text-primary mb-2" />
                <div className="text-2xl font-bold">{discoveryStats.profile_likes}</div>
                <div className="text-sm text-muted-foreground">Profile Likes</div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Active Boost Status */}
        {discoveryStats?.active_boost_expires_at && (
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-yellow-600" />
                <div>
                  <div className="font-medium text-yellow-800">Boost Active</div>
                  <div className="text-sm text-yellow-600">
                    Expires {new Date(discoveryStats.active_boost_expires_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Discovery Feed */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">People Near You</h2>
            <span className="text-sm text-muted-foreground">
              {discoveryUsers.length} profiles
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : discoveryUsers.length > 0 ? (
            <div className="space-y-4">
              {discoveryUsers.map(discoveryUser => (
                <UserCard key={discoveryUser.id} user={discoveryUser} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Radar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No More Profiles</h3>
              <p className="text-muted-foreground mb-4">
                You've seen everyone in your area. Try expanding your radius or check back later.
              </p>
              <Button onClick={fetchDiscoveryUsers} className="touch-target">
                Refresh Discovery
              </Button>
            </div>
          )}
        </section>

        {/* Boost Promotion */}
        {!discoveryStats?.active_boost_expires_at && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <Zap className="h-8 w-8 mx-auto text-blue-600 mb-3" />
              <h3 className="font-semibold text-blue-800 mb-2">Boost Your Profile</h3>
              <p className="text-sm text-blue-600 mb-4">
                Get featured at the top of discovery and increase your connections
              </p>
              <Button className="touch-target" variant="outline">
                Learn More
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayout>
  );
};

export default Discovery;