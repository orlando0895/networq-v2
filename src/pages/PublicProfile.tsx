import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Mail, 
  Phone, 
  Building, 
  Briefcase, 
  Globe, 
  Linkedin, 
  Facebook, 
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { downloadVCF, type ContactData } from '@/lib/vcf';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type UserContactCard = Database['public']['Tables']['user_contact_cards']['Row'];

export const PublicProfile = () => {
  const { identifier } = useParams<{ identifier: string }>();
  const [contactCard, setContactCard] = useState<UserContactCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPublicProfile = async () => {
      if (!identifier) return;

      try {
        setLoading(true);
        
        // Try to find by username first, then by share_code
        let query = supabase
          .from('user_contact_cards')
          .select('*')
          .eq('is_active', true);

        // Check if identifier looks like a share code (8 chars) or username
        if (identifier.length === 8 && /^[a-f0-9]+$/.test(identifier)) {
          query = query.eq('share_code', identifier);
        } else {
          query = query.eq('username', identifier);
        }

        const { data, error } = await query.maybeSingle();

        if (error) {
          console.error('Error fetching public profile:', error);
          setNotFound(true);
          return;
        }

        if (!data) {
          setNotFound(true);
          return;
        }

        setContactCard(data);
      } catch (error) {
        console.error('Error:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [identifier]);

  const handleDownloadContact = () => {
    if (!contactCard) return;

    const visibility = contactCard.public_visibility as Record<string, boolean> || {};
    
    const contactData: ContactData = {
      name: visibility.name ? contactCard.name : 'Contact',
      email: visibility.email ? contactCard.email : '',
      phone: visibility.phone ? contactCard.phone || '' : '',
      company: visibility.company ? contactCard.company || '' : '',
      industry: visibility.industry ? contactCard.industry || '' : '',
      linkedin: visibility.linkedin ? contactCard.linkedin || '' : '',
      facebook: visibility.facebook ? contactCard.facebook || '' : '',
      whatsapp: visibility.whatsapp ? contactCard.whatsapp || '' : '',
      websites: visibility.websites ? contactCard.websites || [] : [],
      notes: visibility.notes ? contactCard.notes || '' : ''
    };

    downloadVCF(contactData);
    
    toast({
      title: "Contact Downloaded! 📱",
      description: "Contact has been saved as a .vcf file"
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading contact...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (notFound || !contactCard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <ExternalLink className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Contact Not Found</h2>
            <p className="text-muted-foreground mb-4">
              This contact card doesn't exist or is no longer available.
            </p>
            <Button variant="outline" onClick={() => window.close()}>
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const visibility = contactCard.public_visibility as Record<string, boolean> || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container max-w-2xl mx-auto p-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-primary-foreground">
              {visibility.name ? contactCard.name.charAt(0).toUpperCase() : 'N'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Digital Contact Card</p>
        </div>

        {/* Main Contact Card */}
        <Card className="mb-6 shadow-lg">
          <CardHeader className="text-center pb-4">
            {visibility.name && (
              <h1 className="text-2xl font-bold text-foreground">
                {contactCard.name}
              </h1>
            )}
            {visibility.industry && contactCard.industry && (
              <p className="text-muted-foreground">
                {contactCard.industry}
              </p>
            )}
            {visibility.company && contactCard.company && (
              <p className="text-sm text-muted-foreground">
                {contactCard.company}
              </p>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Contact Information */}
            <div className="space-y-3">
              {visibility.email && contactCard.email && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Mail className="w-5 h-5 text-primary" />
                  <a 
                    href={`mailto:${contactCard.email}`}
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    {contactCard.email}
                  </a>
                </div>
              )}

              {visibility.phone && contactCard.phone && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Phone className="w-5 h-5 text-primary" />
                  <a 
                    href={`tel:${contactCard.phone}`}
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    {contactCard.phone}
                  </a>
                </div>
              )}

              {visibility.company && contactCard.company && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Building className="w-5 h-5 text-primary" />
                  <span className="text-foreground">{contactCard.company}</span>
                </div>
              )}

              {visibility.industry && contactCard.industry && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <span className="text-foreground">{contactCard.industry}</span>
                </div>
              )}
            </div>

            {/* Services */}
            {visibility.services && contactCard.services && contactCard.services.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3 text-foreground">Services</h3>
                  <div className="flex flex-wrap gap-2">
                    {contactCard.services.map((service, index) => (
                      <Badge key={index} variant="secondary">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Social Links */}
            {(
              (visibility.linkedin && contactCard.linkedin) ||
              (visibility.facebook && contactCard.facebook) ||
              (visibility.whatsapp && contactCard.whatsapp) ||
              (visibility.websites && contactCard.websites && contactCard.websites.length > 0)
            ) && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3 text-foreground">Connect</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {visibility.linkedin && contactCard.linkedin && (
                      <a
                        href={contactCard.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <Linkedin className="w-5 h-5 text-primary" />
                        <span className="text-foreground">LinkedIn</span>
                        <ExternalLink className="w-4 h-4 text-muted-foreground ml-auto" />
                      </a>
                    )}

                    {visibility.facebook && contactCard.facebook && (
                      <a
                        href={contactCard.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <Facebook className="w-5 h-5 text-primary" />
                        <span className="text-foreground">Facebook</span>
                        <ExternalLink className="w-4 h-4 text-muted-foreground ml-auto" />
                      </a>
                    )}

                    {visibility.whatsapp && contactCard.whatsapp && (
                      <a
                        href={contactCard.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <MessageCircle className="w-5 h-5 text-primary" />
                        <span className="text-foreground">WhatsApp</span>
                        <ExternalLink className="w-4 h-4 text-muted-foreground ml-auto" />
                      </a>
                    )}

                    {visibility.websites && contactCard.websites && contactCard.websites.map((website, index) => (
                      <a
                        key={index}
                        href={website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <Globe className="w-5 h-5 text-primary" />
                        <span className="text-foreground">{website}</span>
                        <ExternalLink className="w-4 h-4 text-muted-foreground ml-auto" />
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Notes */}
            {visibility.notes && contactCard.notes && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3 text-foreground">About</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {contactCard.notes}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Download Button */}
        <div className="text-center">
          <Button
            onClick={handleDownloadContact}
            size="lg"
            className="w-full max-w-sm"
          >
            <Download className="w-5 h-5 mr-2" />
            Save to Contacts
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Downloads a .vcf file that you can import to your phone's address book
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-muted-foreground">
          <p>Powered by Networq</p>
        </div>
      </div>
    </div>
  );
};