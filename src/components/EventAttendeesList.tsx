import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, UserPlus, Eye, EyeOff, Settings, Users } from 'lucide-react';
import { useEventAttendees } from '@/hooks/useEventAttendees';
import { useEventConnections } from '@/hooks/useEventConnections';
import { useAuth } from '@/contexts/AuthContext';
import { AttendeePrivacySettings } from '@/components/AttendeePrivacySettings';
import { ConnectWithAttendeeDialog } from '@/components/ConnectWithAttendeeDialog';

interface EventAttendeesListProps {
  eventId: string;
}

export const EventAttendeesList: React.FC<EventAttendeesListProps> = ({ eventId }) => {
  const { user } = useAuth();
  const { attendees, isLoading } = useEventAttendees(eventId);
  const { getConnectionStatus, sendConnectionRequest } = useEventConnections(eventId);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);
  const [selectedAttendee, setSelectedAttendee] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Who's Going</h3>
          <Button variant="outline" size="sm" disabled>
            <Settings className="h-4 w-4 mr-2" />
            Privacy Settings
          </Button>
        </div>
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const visibleAttendees = attendees.filter(
    attendee => attendee.privacy?.show_profile || attendee.user_id === user?.id
  );

  const currentUserAttendee = attendees.find(a => a.user_id === user?.id);

  const getConnectionStatusDisplay = (attendeeUserId: string) => {
    if (attendeeUserId === user?.id) return null;
    
    const status = getConnectionStatus(attendeeUserId);
    switch (status) {
      case 'accepted':
        return <Badge variant="secondary">Connected</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'declined':
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return null;
    }
  };

  const handleConnect = (attendee: any) => {
    setSelectedAttendee(attendee);
  };

  const handleMessage = (attendee: any) => {
    // TODO: Integrate with existing messaging system
    console.log('Message attendee:', attendee);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Who's Going</h3>
          <p className="text-sm text-muted-foreground">
            {visibleAttendees.length} of {attendees.length} attendees visible
          </p>
        </div>
        {currentUserAttendee && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowPrivacySettings(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Privacy Settings
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {visibleAttendees.map((attendee) => (
          <Card key={attendee.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={attendee.profiles?.avatar_url} />
                  <AvatarFallback className="bg-primary/10">
                    {attendee.profiles?.full_name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">
                      {attendee.profiles?.full_name || 'Anonymous User'}
                    </h4>
                    {attendee.user_id === user?.id && (
                      <Badge variant="outline" className="text-xs">You</Badge>
                    )}
                    {getConnectionStatusDisplay(attendee.user_id)}
                  </div>
                  
                  {attendee.profiles?.job_title && attendee.profiles?.company && (
                    <p className="text-sm text-muted-foreground">
                      {attendee.profiles.job_title} at {attendee.profiles.company}
                    </p>
                  )}
                  
                  {attendee.profiles?.bio && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {attendee.profiles.bio}
                    </p>
                  )}
                </div>

                {attendee.user_id !== user?.id && (
                  <div className="flex flex-col space-y-2">
                    {attendee.privacy?.allow_messages && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleMessage(attendee)}
                        className="text-xs px-3"
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        Message
                      </Button>
                    )}
                    
                    {!getConnectionStatus(attendee.user_id) && (
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handleConnect(attendee)}
                        className="text-xs px-3"
                      >
                        <UserPlus className="h-3 w-3 mr-1" />
                        Connect
                      </Button>
                    )}
                  </div>
                )}
              </div>
              
              {!attendee.privacy?.show_profile && attendee.user_id !== user?.id && (
                <div className="mt-3 p-2 bg-muted rounded-md flex items-center text-xs text-muted-foreground">
                  <EyeOff className="h-3 w-3 mr-2" />
                  This attendee has limited their profile visibility
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {attendees.length === 0 && (
        <div className="text-center py-8">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No attendees yet</p>
        </div>
      )}

      <AttendeePrivacySettings
        eventId={eventId}
        isOpen={showPrivacySettings}
        onClose={() => setShowPrivacySettings(false)}
      />

      <ConnectWithAttendeeDialog
        attendee={selectedAttendee}
        eventId={eventId}
        isOpen={!!selectedAttendee}
        onClose={() => setSelectedAttendee(null)}
        onConnect={sendConnectionRequest}
      />
    </div>
  );
};