import React, { useState, useEffect } from 'react';
import { Calendar, Plus, MapPin, Clock, Users, Filter, Search, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MobileLayout, PageHeader } from '@/components/MobileLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import CreateEventForm from '@/components/CreateEventForm';
import PremiumUpgradeDialog from '@/components/PremiumUpgradeDialog';

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  end_date?: string;
  location_name: string;
  address?: string;
  latitude: number;
  longitude: number;
  max_attendees?: number;
  current_attendees: number;
  tags?: string[];
  image_url?: string;
  created_by: string;
  distance_km?: number;
}

const Events = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [radiusFilter, setRadiusFilter] = useState('25');
  const [tagFilter, setTagFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPremiumUpgradeOpen, setIsPremiumUpgradeOpen] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  // Check premium status
  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase.rpc('current_user_is_premium');
        if (error) throw error;
        setIsPremium(data || false);
      } catch (error) {
        console.error('Error checking premium status:', error);
      }
    };
    
    checkPremiumStatus();
  }, [user]);

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
          // Default to a central location if permission denied
          setUserLocation({ lat: 40.7128, lng: -74.0060 }); // NYC
        }
      );
    }
  }, []);

  // Fetch events based on location and filters
  const fetchEvents = async () => {
    if (!userLocation) return;

    try {
      setLoading(true);
      const radius = parseInt(radiusFilter);
      
      const { data, error } = await supabase.rpc('get_events_within_radius', {
        user_lat: userLocation.lat,
        user_lon: userLocation.lng,
        radius_km: radius,
        limit_count: 50
      });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [userLocation, radiusFilter]);

  // Filter events based on search and tags
  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchTerm || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = tagFilter === 'all' || 
      event.tags?.includes(tagFilter);
    
    return matchesSearch && matchesTag;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return '';
    return distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`;
  };

  const EventCard = ({ event }: { event: Event }) => (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
      setSelectedEvent(event);
      setIsDetailModalOpen(true);
    }}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {event.description}
            </CardDescription>
          </div>
          {event.distance_km && (
            <Badge variant="outline" className="ml-2">
              {formatDistance(event.distance_km)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {formatDate(event.event_date)}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {event.location_name}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {event.current_attendees} attending
            {event.max_attendees && ` / ${event.max_attendees} max`}
          </div>
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {event.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <MobileLayout
      header={
        <PageHeader
          title="Events"
          subtitle="Discover networking opportunities"
        />
      }
    >
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex gap-3 items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={radiusFilter} onValueChange={setRadiusFilter}>
            <SelectTrigger className="w-24">
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
        </div>

        {/* Create Event Button */}
        {user && (
          <div className="fixed bottom-24 right-4 z-30 md:absolute md:top-4 md:right-4 md:bottom-auto">
            <Button
              onClick={() => isPremium ? setIsCreateEventOpen(true) : setIsPremiumUpgradeOpen(true)}
              className={`rounded-full h-14 w-14 shadow-lg md:h-auto md:w-auto md:rounded-md md:px-4 md:py-2 ${
                !isPremium ? 'bg-gradient-to-r from-primary to-primary/80' : ''
              }`}
            >
              {!isPremium && <Crown className="h-3 w-3 absolute -top-1 -right-1 text-white" />}
              <Plus className="h-6 w-6 md:h-4 md:w-4 md:mr-2" />
              <span className="hidden md:inline">
                {isPremium ? 'Create Event' : 'Create Event'}
              </span>
            </Button>
          </div>
        )}

        {/* Events List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="space-y-4">
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Events Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || tagFilter !== 'all' 
                ? "Try adjusting your filters to find events" 
                : "No events found in your area. Be the first to create one!"}
            </p>
            {user && (
              <Button 
                onClick={() => isPremium ? setIsCreateEventOpen(true) : setIsPremiumUpgradeOpen(true)}
                className={!isPremium ? 'bg-gradient-to-r from-primary to-primary/80' : ''}
              >
                {!isPremium && <Crown className="h-4 w-4 mr-2" />}
                Create First Event
              </Button>
            )}
          </div>
        )}

        {/* Create Event Form - Only show if premium */}
        {isPremium && (
          <CreateEventForm
            open={isCreateEventOpen}
            onOpenChange={setIsCreateEventOpen}
            onEventCreated={fetchEvents}
            userLocation={userLocation}
          />
        )}

        {/* Premium Upgrade Dialog */}
        <PremiumUpgradeDialog
          open={isPremiumUpgradeOpen}
          onOpenChange={setIsPremiumUpgradeOpen}
          feature="event creation"
        />

        {/* Event Details Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-md">
            {selectedEvent && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedEvent.title}</DialogTitle>
                  <DialogDescription>
                    Event details and information
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm">{selectedEvent.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {formatDate(selectedEvent.event_date)}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {selectedEvent.location_name}
                      {selectedEvent.address && (
                        <span className="text-muted-foreground">• {selectedEvent.address}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {selectedEvent.current_attendees} attending
                      {selectedEvent.max_attendees && ` of ${selectedEvent.max_attendees}`}
                    </div>
                  </div>
                  {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedEvent.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <Button className="w-full touch-target">
                    Join Event
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MobileLayout>
  );
};

export default Events;