import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, MessageCircle, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AttendeePrivacySettingsProps {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface PrivacySettings {
  show_profile: boolean;
  show_contact_info: boolean;
  allow_messages: boolean;
}

export const AttendeePrivacySettings: React.FC<AttendeePrivacySettingsProps> = ({
  eventId,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<PrivacySettings>({
    show_profile: true,
    show_contact_info: false,
    allow_messages: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = async () => {
    if (!user || !eventId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('event_attendee_privacy')
        .select('show_profile, show_contact_info, allow_messages')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!user || !eventId) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('event_attendee_privacy')
        .upsert({
          event_id: eventId,
          user_id: user.id,
          ...settings,
        });

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Your privacy preferences have been updated",
      });

      onClose();
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast({
        title: "Error",
        description: "Failed to save privacy settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
    }
  }, [isOpen, eventId, user]);

  const handleSettingChange = (key: keyof PrivacySettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Profile Visibility
              </CardTitle>
              <CardDescription>
                Control what information other attendees can see
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-profile">Show my profile</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow others to see your name and profile information
                  </p>
                </div>
                <Switch
                  id="show-profile"
                  checked={settings.show_profile}
                  onCheckedChange={(value) => handleSettingChange('show_profile', value)}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show-contact">Show contact info</Label>
                  <p className="text-sm text-muted-foreground">
                    Share your contact details with other attendees
                  </p>
                </div>
                <Switch
                  id="show-contact"
                  checked={settings.show_contact_info}
                  onCheckedChange={(value) => handleSettingChange('show_contact_info', value)}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Communication
              </CardTitle>
              <CardDescription>
                Control how other attendees can reach you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allow-messages">Allow messages</Label>
                  <p className="text-sm text-muted-foreground">
                    Let other attendees send you direct messages
                  </p>
                </div>
                <Switch
                  id="allow-messages"
                  checked={settings.allow_messages}
                  onCheckedChange={(value) => handleSettingChange('allow_messages', value)}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <Shield className="h-3 w-3 inline mr-1" />
              These settings only apply to this event. You can change them anytime.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={saveSettings} 
              disabled={isSaving || isLoading}
              className="flex-1"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};