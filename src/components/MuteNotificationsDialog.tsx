import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BellOff, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MuteNotificationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  isGroupChat: boolean;
  isMuted: boolean;
}

const MUTE_OPTIONS = [
  { value: '1', label: '1 hour', hours: 1 },
  { value: '8', label: '8 hours', hours: 8 },
  { value: '24', label: '24 hours', hours: 24 },
  { value: '168', label: '1 week', hours: 168 },
  { value: 'forever', label: 'Until I turn it back on', hours: null }
];

export function MuteNotificationsDialog({ 
  open, 
  onOpenChange, 
  conversationId,
  isGroupChat,
  isMuted
}: MuteNotificationsDialogProps) {
  const { toast } = useToast();
  const [selectedDuration, setSelectedDuration] = useState('8');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleMuteToggle = async () => {
    setIsSubmitting(true);
    
    try {
      if (isMuted) {
        // Unmute - call function with no duration to unmute
        const { error } = await supabase.rpc('toggle_conversation_mute', {
          conversation_id_param: conversationId
        });

        if (error) throw error;

        toast({
          title: `${isGroupChat ? 'Group' : 'Conversation'} unmuted`,
          description: "You'll receive notifications again."
        });
      } else {
        // Mute - call function with selected duration
        const selectedOption = MUTE_OPTIONS.find(opt => opt.value === selectedDuration);
        const { error } = await supabase.rpc('toggle_conversation_mute', {
          conversation_id_param: conversationId,
          mute_duration_hours: selectedOption?.hours
        });

        if (error) throw error;

        const durationText = selectedOption?.hours 
          ? `for ${selectedOption.label}`
          : 'until you turn it back on';

        toast({
          title: `${isGroupChat ? 'Group' : 'Conversation'} muted`,
          description: `You won't receive notifications ${durationText}.`
        });
      }

      onOpenChange(false);
    } catch (error: any) {
      console.error('Error toggling mute:', error);
      toast({
        title: "Error",
        description: "Failed to update notification settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {isMuted ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
            <span>
              {isMuted ? 'Unmute' : 'Mute'} {isGroupChat ? 'Group' : 'Notifications'}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {isMuted ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  This {isGroupChat ? 'group' : 'conversation'} is currently muted. 
                  You're not receiving notifications.
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Click unmute to start receiving notifications again.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                How long would you like to mute this {isGroupChat ? 'group' : 'conversation'}?
              </p>
              
              <RadioGroup value={selectedDuration} onValueChange={setSelectedDuration}>
                {MUTE_OPTIONS.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="text-sm cursor-pointer flex-1">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleMuteToggle} 
              disabled={isSubmitting}
              variant={isMuted ? "default" : "secondary"}
            >
              {isSubmitting 
                ? 'Processing...' 
                : isMuted 
                  ? 'Unmute' 
                  : 'Mute'
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}