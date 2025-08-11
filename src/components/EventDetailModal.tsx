import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, MessageCircle, Bell, X } from 'lucide-react';
import { EventRSVPButton } from '@/components/EventRSVPButton';
import { EventAttendeesList } from '@/components/EventAttendeesList';
import { EventCommentThread } from '@/components/EventCommentThread';
import { EventUpdates } from '@/components/EventUpdates';
import { cn } from '@/lib/utils';

interface Event {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  end_date?: string;
  location_name: string;
  address?: string;
  current_attendees: number;
  max_attendees?: number;
  tags?: string[];
  image_url?: string;
  created_by: string;
  distance_km?: number;
}

interface EventDetailModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  isOpen,
  onClose,
  className,
}) => {
  const [activeTab, setActiveTab] = useState('details');

  if (!event) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return '';
    return distance < 1 ? '< 1 km away' : `${distance.toFixed(1)} km away`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn('max-w-4xl max-h-[90vh] overflow-hidden flex flex-col', className)}>
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-foreground mb-2">
                {event.title}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    {formatDate(event.event_date)} at {formatTime(event.event_date)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">
                    {event.location_name}
                    {event.distance_km && (
                      <span className="ml-1 text-muted-foreground">
                        • {formatDistance(event.distance_km)}
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">
                    {event.current_attendees} attending
                    {event.max_attendees && ` • ${event.max_attendees} max`}
                  </span>
                </div>
              </div>
              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
            <TabsTrigger value="details" className="text-xs sm:text-sm">
              Details
            </TabsTrigger>
            <TabsTrigger value="attendees" className="text-xs sm:text-sm">
              <Users className="h-4 w-4 mr-1" />
              Attendees
            </TabsTrigger>
            <TabsTrigger value="discussion" className="text-xs sm:text-sm">
              <MessageCircle className="h-4 w-4 mr-1" />
              Discussion
            </TabsTrigger>
            <TabsTrigger value="updates" className="text-xs sm:text-sm">
              <Bell className="h-4 w-4 mr-1" />
              Updates
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="details" className="space-y-6 p-1">
              {event.image_url && (
                <div className="w-full h-48 rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={event.image_url} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-semibold mb-2">About this event</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {event.description || 'No description provided.'}
                </p>
              </div>

              {event.address && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Location</h3>
                  <p className="text-muted-foreground">
                    {event.location_name}
                    <br />
                    {event.address}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <EventRSVPButton 
                  eventId={event.id}
                  initialAttendees={event.current_attendees}
                />
              </div>
            </TabsContent>

            <TabsContent value="attendees" className="p-1">
              <EventAttendeesList eventId={event.id} />
            </TabsContent>

            <TabsContent value="discussion" className="p-1">
              <EventCommentThread eventId={event.id} />
            </TabsContent>

            <TabsContent value="updates" className="p-1">
              <EventUpdates eventId={event.id} isOrganizer={false} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};