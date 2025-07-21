import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Shield, ExternalLink, Save, Check } from 'lucide-react';
import { useUserContactCard } from '@/hooks/useUserContactCard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const privacyFields = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email Address' },
  { key: 'phone', label: 'Phone Number' },
  { key: 'company', label: 'Company' },
  { key: 'industry', label: 'Industry/Title' },
  { key: 'services', label: 'Services' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'websites', label: 'Websites' },
  { key: 'notes', label: 'Notes/Bio' }
];

export const PrivacySettings = () => {
  const { contactCard, refetch } = useUserContactCard();
  const [privacySettings, setPrivacySettings] = useState<Record<string, boolean>>(
    contactCard?.public_visibility as Record<string, boolean> || {}
  );
  const [username, setUsername] = useState(contactCard?.username || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  const handlePrivacyChange = (field: string, enabled: boolean) => {
    setPrivacySettings(prev => ({
      ...prev,
      [field]: enabled
    }));
  };

  const generateUsername = async () => {
    if (!contactCard) return;
    
    try {
      const { data, error } = await supabase.rpc('generate_username_from_name', {
        _name: contactCard.name
      });
      
      if (error) throw error;
      setUsername(data);
    } catch (error) {
      console.error('Error generating username:', error);
      toast({
        title: "Error",
        description: "Failed to generate username",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    if (!contactCard) return;

    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('user_contact_cards')
        .update({
          public_visibility: privacySettings,
          username: username || null
        })
        .eq('id', contactCard.id);

      if (error) throw error;

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      
      await refetch();
      
      toast({
        title: "Settings Saved! ✅",
        description: "Your privacy settings have been updated"
      });
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast({
        title: "Error",
        description: "Failed to save privacy settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getPublicUrl = () => {
    if (!contactCard) return '';
    
    if (username) {
      return `${window.location.origin}/public/${username}`;
    }
    return `${window.location.origin}/public/${contactCard.share_code}`;
  };

  if (!contactCard) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy Settings
          </CardTitle>
          <CardDescription>
            Create your contact card to manage privacy settings
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Public Profile Privacy
          </CardTitle>
          <CardDescription>
            Control what information is visible when someone scans your QR code or visits your public profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {privacyFields.map((field) => (
              <div key={field.key} className="flex items-center justify-between">
                <Label htmlFor={field.key} className="text-sm font-medium">
                  {field.label}
                </Label>
                <Switch
                  id={field.key}
                  checked={privacySettings[field.key] || false}
                  onCheckedChange={(checked) => handlePrivacyChange(field.key, checked)}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom Username</CardTitle>
          <CardDescription>
            Create a custom username for a prettier public URL (optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="your-username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className="flex-1"
            />
            <Button variant="outline" onClick={generateUsername}>
              Auto-Generate
            </Button>
          </div>
          
          {(username || contactCard.share_code) && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-sm font-medium">Public URL:</Label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <code className="text-sm flex-1">{getPublicUrl()}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(getPublicUrl(), '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="min-w-32"
        >
          {saved ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Saved!
            </>
          ) : saving ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
};