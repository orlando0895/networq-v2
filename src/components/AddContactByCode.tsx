
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UserPlus, ExternalLink } from 'lucide-react';
import { useUserContactCard } from '@/hooks/useUserContactCard';
import { useContacts } from '@/hooks/useContacts';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type UserContactCard = Database['public']['Tables']['user_contact_cards']['Row'];

const AddContactByCode = () => {
  const [shareCode, setShareCode] = useState('');
  const [foundCard, setFoundCard] = useState<UserContactCard | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  const { fetchContactCardByShareCode } = useUserContactCard();
  const { addContact } = useContacts();
  const { toast } = useToast();

  const searchByCode = async () => {
    if (!shareCode.trim()) return;
    
    setIsSearching(true);
    const result = await fetchContactCardByShareCode(shareCode.trim());
    
    if (result.success && result.data) {
      setFoundCard(result.data);
    } else {
      setFoundCard(null);
    }
    setIsSearching(false);
  };

  const addFoundContact = async () => {
    if (!foundCard) return;
    
    setIsAdding(true);
    const result = await addContact({
      name: foundCard.name,
      email: foundCard.email,
      phone: foundCard.phone || undefined,
      company: foundCard.company || undefined,
      industry: foundCard.industry || undefined,
      services: foundCard.services || [],
      tier: 'Acquaintance', // Default tier for shared contacts
      notes: foundCard.notes || undefined,
      linkedin: foundCard.linkedin || undefined,
      facebook: foundCard.facebook || undefined,
      whatsapp: foundCard.whatsapp || undefined,
      websites: foundCard.websites || []
    });

    if (result.success) {
      setShareCode('');
      setFoundCard(null);
    }
    setIsAdding(false);
  };

  const formatUrl = (url: string) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  const formatSocialLink = (platform: string, value: string) => {
    if (value.startsWith('http')) return value;
    
    switch (platform) {
      case 'linkedin':
        return value.startsWith('@') || value.includes('linkedin.com') 
          ? value 
          : `https://linkedin.com/in/${value}`;
      case 'facebook':
        return value.startsWith('@') || value.includes('facebook.com') 
          ? value 
          : `https://facebook.com/${value}`;
      default:
        return value;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add Contact by Share Code
          </CardTitle>
          <CardDescription>
            Enter a share code to find and add someone's contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="shareCode">Share Code</Label>
              <Input
                id="shareCode"
                value={shareCode}
                onChange={(e) => setShareCode(e.target.value)}
                placeholder="Enter 8-character share code"
                maxLength={8}
                onKeyPress={(e) => e.key === 'Enter' && searchByCode()}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={searchByCode} disabled={isSearching || !shareCode.trim()}>
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>

          {foundCard && (
            <div className="mt-6">
              <Separator className="mb-4" />
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{foundCard.name}</h3>
                    <p className="text-slate-600">{foundCard.email}</p>
                  </div>
                  <Button onClick={addFoundContact} disabled={isAdding}>
                    {isAdding ? 'Adding...' : 'Add Contact'}
                  </Button>
                </div>

                {(foundCard.company || foundCard.industry) && (
                  <div className="flex flex-wrap gap-2">
                    {foundCard.company && (
                      <Badge variant="outline">{foundCard.company}</Badge>
                    )}
                    {foundCard.industry && (
                      <Badge variant="outline">{foundCard.industry}</Badge>
                    )}
                  </div>
                )}

                {foundCard.phone && (
                  <p className="text-sm text-slate-600">
                    <strong>Phone:</strong> {foundCard.phone}
                  </p>
                )}

                {foundCard.services && foundCard.services.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">Services:</p>
                    <div className="flex flex-wrap gap-1">
                      {foundCard.services.map((service, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {(foundCard.linkedin || foundCard.facebook || foundCard.whatsapp) && (
                  <div className="flex flex-wrap gap-2">
                    {foundCard.linkedin && (
                      <a
                        href={formatSocialLink('linkedin', foundCard.linkedin)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        LinkedIn <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {foundCard.facebook && (
                      <a
                        href={formatSocialLink('facebook', foundCard.facebook)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Facebook <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {foundCard.whatsapp && (
                      <span className="text-sm text-slate-600">
                        WhatsApp: {foundCard.whatsapp}
                      </span>
                    )}
                  </div>
                )}

                {foundCard.websites && foundCard.websites.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">Websites:</p>
                    <div className="flex flex-wrap gap-2">
                      {foundCard.websites.map((website, index) => (
                        <a
                          key={index}
                          href={formatUrl(website)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          {website} <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {foundCard.notes && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">Notes:</p>
                    <p className="text-sm text-slate-600">{foundCard.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AddContactByCode;
