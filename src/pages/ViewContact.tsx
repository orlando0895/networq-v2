import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserContactCard } from '@/hooks/useUserContactCard';
import { useContacts } from '@/hooks/useContacts';
import { ArrowLeft, UserPlus, Mail, Phone, Building, Globe, Linkedin, Facebook, MessageCircle, Check, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
// @ts-ignore
import vCard from 'vcards-js';

export default function ViewContact() {
  const { shareCode } = useParams<{ shareCode: string }>();
  const navigate = useNavigate();
  const { fetchContactCardByShareCode } = useUserContactCard();
  const { addContact } = useContacts();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [contactCard, setContactCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const loadContactCard = async () => {
      if (!shareCode) return;
      
      setLoading(true);
      try {
        const result = await fetchContactCardByShareCode(shareCode, false);
        if (result.success && result.data) {
          setContactCard(result.data);
        } else {
          // Only show toast for logged-in users to avoid issues on public pages
          if (user) {
            toast({
              title: "Contact Not Found",
              description: "The contact card you're looking for doesn't exist or has been deactivated.",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error('Error fetching contact card:', error);
        toast({
          title: "Error",
          description: "Failed to load contact card.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadContactCard();
  }, [shareCode, fetchContactCardByShareCode, toast]);

  const handleAddContact = async () => {
    if (!contactCard || adding) return;

    setAdding(true);
    try {
      await addContact({
        name: contactCard.name,
        email: contactCard.email,
        phone: contactCard.phone || '',
        company: contactCard.company || '',
        industry: contactCard.industry || '',
        services: contactCard.services || [],
        tier: 'Acquaintance',
        notes: `Added via QR code scan`,
        linkedin: contactCard.linkedin || '',
        facebook: contactCard.facebook || '',
        whatsapp: contactCard.whatsapp || '',
        websites: contactCard.websites || []
      });

      setAdded(true);
      toast({
        title: "Contact Added! 🎉",
        description: `${contactCard.name} has been added to your network.`
      });
    } catch (error) {
      console.error('Error adding contact:', error);
      toast({
        title: "Error",
        description: "Failed to add contact. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAdding(false);
    }
  };

  const handleDownloadVCard = () => {
    if (!contactCard) return;

    // Create vCard
    const vcard = vCard();
    vcard.firstName = contactCard.name.split(' ')[0] || '';
    vcard.lastName = contactCard.name.split(' ').slice(1).join(' ') || '';
    vcard.organization = contactCard.company || '';
    vcard.title = contactCard.industry || '';
    vcard.email = contactCard.email;
    if (contactCard.phone) vcard.cellPhone = contactCard.phone;
    if (contactCard.linkedin) vcard.socialUrls.linkedin = contactCard.linkedin;
    if (contactCard.facebook) vcard.socialUrls.facebook = contactCard.facebook;
    if (contactCard.websites && contactCard.websites.length > 0) {
      vcard.url = contactCard.websites[0];
    }
    if (contactCard.notes) vcard.note = contactCard.notes;

    // Generate vCard file and download
    const vcardContent = vcard.getFormattedString();
    const blob = new Blob([vcardContent], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${contactCard.name.replace(/\s+/g, '-')}.vcf`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Contact Downloaded! 📱",
      description: "Contact card saved to your device. You can now add it to your address book.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center">Loading contact...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!contactCard) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Contact Not Found</CardTitle>
            <CardDescription>
              The contact card you're looking for doesn't exist or has been deactivated.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/auth')} 
              className="w-full"
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to App
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-3 pb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-primary to-primary/80 rounded-full mx-auto flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-foreground">
              {contactCard.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <CardTitle className="text-2xl font-bold">{contactCard.name}</CardTitle>
          {contactCard.company && (
            <CardDescription className="text-lg font-medium text-foreground/80">
              {contactCard.company}
            </CardDescription>
          )}
          {contactCard.industry && (
            <Badge variant="secondary" className="mx-auto">
              {contactCard.industry}
            </Badge>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {contactCard.email && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Mail className="w-5 h-5 text-primary" />
                <a 
                  href={`mailto:${contactCard.email}`}
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  {contactCard.email}
                </a>
              </div>
            )}
            
            {contactCard.phone && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Phone className="w-5 h-5 text-primary" />
                <a 
                  href={`tel:${contactCard.phone}`}
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  {contactCard.phone}
                </a>
              </div>
            )}
            
            {contactCard.websites && contactCard.websites.length > 0 && (
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">Websites</span>
                </div>
                <div className="flex flex-col gap-2 ml-8">
                  {contactCard.websites.map((website: string, index: number) => (
                    <a 
                      key={index}
                      href={website.startsWith('http') ? website : `https://${website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {website}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Social Links */}
          {(contactCard.linkedin || contactCard.facebook || contactCard.whatsapp) && (
            <div className="flex justify-center gap-3">
              {contactCard.linkedin && (
                <a 
                  href={contactCard.linkedin.startsWith('http') ? contactCard.linkedin : `https://linkedin.com/in/${contactCard.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {contactCard.facebook && (
                <a 
                  href={contactCard.facebook.startsWith('http') ? contactCard.facebook : `https://facebook.com/${contactCard.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {contactCard.whatsapp && (
                <a 
                  href={`https://wa.me/${contactCard.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              )}
            </div>
          )}

          {/* Services */}
          {contactCard.services && contactCard.services.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Services</div>
              <div className="flex flex-wrap gap-2">
                {contactCard.services.map((service: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {contactCard.notes && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">About</div>
              <p className="text-sm text-muted-foreground">{contactCard.notes}</p>
            </div>
          )}

          {/* Download vCard Button - Always visible */}
          <div className="pt-6">
            <Button
              onClick={handleDownloadVCard}
              className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
              size="lg"
            >
              <Download className="w-5 h-5 mr-2" />
              Save to Address Book
            </Button>
          </div>

          {/* Actions for logged-in users */}
          {user && (
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => navigate('/')}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to App
              </Button>
              
              <Button
                onClick={handleAddContact}
                disabled={adding || added}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Added
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    {adding ? 'Adding...' : 'Add to Networq'}
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Actions for non-logged-in users */}
          {!user && (
            <div className="pt-2">
              <Button
                onClick={() => navigate('/auth')}
                variant="outline"
                className="w-full"
                size="sm"
              >
                Get Networq App
              </Button>
            </div>
          )}

          <div className="text-xs text-center text-muted-foreground pt-2">
            {user ? 
              "Scan QR codes to quickly add contacts to your network" :
              "Download Networq to build your professional network"
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
}