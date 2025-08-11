import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, MessageCircle } from 'lucide-react';

interface ConnectWithAttendeeDialogProps {
  attendee: any;
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
  onConnect: (recipientId: string, message?: string) => Promise<void>;
}

export const ConnectWithAttendeeDialog: React.FC<ConnectWithAttendeeDialogProps> = ({
  attendee,
  eventId,
  isOpen,
  onClose,
  onConnect,
}) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConnect = async () => {
    if (!attendee) return;

    setIsSubmitting(true);
    try {
      await onConnect(attendee.user_id, message.trim() || undefined);
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Error connecting with attendee:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setMessage('');
    onClose();
  };

  if (!attendee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Connect with Attendee
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Attendee Profile */}
          <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={attendee.profiles?.avatar_url} />
              <AvatarFallback className="bg-primary/10">
                {attendee.profiles?.full_name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-medium">
                {attendee.profiles?.full_name || 'Anonymous User'}
              </h4>
              {attendee.profiles?.job_title && attendee.profiles?.company && (
                <p className="text-sm text-muted-foreground">
                  {attendee.profiles.job_title} at {attendee.profiles.company}
                </p>
              )}
            </div>
          </div>

          {/* Connection Message */}
          <div className="space-y-2">
            <Label htmlFor="connection-message">
              Introduction message (optional)
            </Label>
            <Textarea
              id="connection-message"
              placeholder="Hi! I'd love to connect and learn more about your work..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/500 characters
            </p>
          </div>

          {/* Benefits Info */}
          <div className="bg-primary/5 p-3 rounded-lg">
            <h4 className="text-sm font-medium mb-2">What happens next?</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• They'll receive your connection request</li>
              <li>• If accepted, you can message each other</li>
              <li>• You can add each other to your contacts</li>
              <li>• Stay connected after the event</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={handleClose} 
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConnect} 
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};