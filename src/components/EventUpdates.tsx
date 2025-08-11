import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, Plus, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface EventUpdatesProps {
  eventId: string;
  isOrganizer: boolean;
}

interface EventUpdate {
  id: string;
  title: string;
  content: string;
  created_at: string;
  created_by: string;
}

export const EventUpdates: React.FC<EventUpdatesProps> = ({ eventId, isOrganizer }) => {
  const { user } = useAuth();
  const [updates, setUpdates] = useState<EventUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUpdate, setNewUpdate] = useState({ title: '', content: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This would normally fetch from the database
  React.useEffect(() => {
    // Mock data for now
    setUpdates([
      {
        id: '1',
        title: 'Event Location Update',
        content: 'The venue has been changed to a larger space to accommodate more attendees. Looking forward to seeing everyone there!',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        created_by: 'organizer-id'
      },
      {
        id: '2', 
        title: 'Welcome Message',
        content: 'Welcome to our networking event! We have an exciting program lined up with great speakers and plenty of networking opportunities.',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        created_by: 'organizer-id'
      }
    ]);
    setIsLoading(false);
  }, [eventId]);

  const handleSubmitUpdate = async () => {
    if (!newUpdate.title.trim() || !newUpdate.content.trim()) return;

    setIsSubmitting(true);
    try {
      // This would normally save to the database
      const update: EventUpdate = {
        id: Date.now().toString(),
        title: newUpdate.title.trim(),
        content: newUpdate.content.trim(),
        created_at: new Date().toISOString(),
        created_by: user?.id || '',
      };

      setUpdates(prev => [update, ...prev]);
      setNewUpdate({ title: '', content: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating update:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Event Updates
          </h3>
        </div>
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Event Updates</h3>
          <Badge variant="outline" className="text-xs">
            {updates.length}
          </Badge>
        </div>
        
        {isOrganizer && (
          <Button 
            size="sm" 
            onClick={() => setShowCreateForm(!showCreateForm)}
            variant={showCreateForm ? "outline" : "default"}
          >
            <Plus className="h-4 w-4 mr-2" />
            {showCreateForm ? 'Cancel' : 'Post Update'}
          </Button>
        )}
      </div>

      {/* Create Update Form */}
      {showCreateForm && isOrganizer && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Create New Update</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="update-title">Title</Label>
              <Input
                id="update-title"
                placeholder="Update title..."
                value={newUpdate.title}
                onChange={(e) => setNewUpdate(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="update-content">Message</Label>
              <Textarea
                id="update-content"
                placeholder="Share important information with attendees..."
                rows={4}
                value={newUpdate.content}
                onChange={(e) => setNewUpdate(prev => ({ ...prev, content: e.target.value }))}
              />
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <p className="text-xs text-muted-foreground">
                This will be sent to all attendees via email
              </p>
              <Button 
                onClick={handleSubmitUpdate}
                disabled={!newUpdate.title.trim() || !newUpdate.content.trim() || isSubmitting}
              >
                {isSubmitting ? 'Posting...' : 'Post Update'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Updates List */}
      <div className="space-y-3">
        {updates.map((update) => (
          <Card key={update.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{update.title}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(update.created_at)}
                    <span className="ml-2">• by Event Organizer</span>
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Update
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{update.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {updates.length === 0 && (
        <div className="text-center py-8">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">No updates yet</p>
          <p className="text-sm text-muted-foreground">
            {isOrganizer 
              ? "Post updates to keep attendees informed about event details."
              : "The organizer will post important updates and announcements here."
            }
          </p>
        </div>
      )}
    </div>
  );
};