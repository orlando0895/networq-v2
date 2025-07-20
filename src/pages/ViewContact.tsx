import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserContactCard } from '@/hooks/useUserContactCard';
import { useContacts } from '@/hooks/useContacts';
import { ArrowLeft, UserPlus, Mail, Phone, Building, Globe, Linkedin, Facebook, MessageCircle, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ViewContact() {
  const { shareCode } = useParams<{ shareCode: string }>();
  const navigate = useNavigate();
  const { fetchContactCardByShareCode } = useUserContactCard();
  const { addContact } = useContacts();
  const { toast } = useToast();
  
  const [contactCard, setContactCard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const loadContactCard = async () => {
      if (!shareCode) return;
      
      setLoading(true);
      try {
        const result = await fetchContactCardByShareCode(shareCode);
        if (result.success && result.data) {
          setContactCard(result.data);
        } else {
          toast({
            title: "Contact Not Found",
            description: "The contact card you're looking for doesn't exist or has been deactivated.",
            variant: "destructive"
          });
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
        websites: contactCard.websites || [],
        shareCode: shareCode // Pass the share code for mutual connection
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl">{contactCard.name}</CardTitle>
          {contactCard.company && (
            <CardDescription className="text-lg font-medium">
              {contactCard.company}
            </CardDescription>
          )}
          {contactCard.industry && (
            <Badge variant="secondary" className="mx-auto">
              {contactCard.industry}
            </Badge>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {contactCard.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{contactCard.email}</span>
              </div>
            )}
            
            {contactCard.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{contactCard.phone}</span>
              </div>
            )}
            
            {contactCard.websites && contactCard.websites.length > 0 && (
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <div className="flex flex-col gap-1">
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
            <div className="flex justify-center gap-4 pt-2">
              {contactCard.linkedin && (
                <a 
                  href={contactCard.linkedin.startsWith('http') ? contactCard.linkedin : `https://linkedin.com/in/${contactCard.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {contactCard.facebook && (
                <a 
                  href={contactCard.facebook.startsWith('http') ? contactCard.facebook : `https://facebook.com/${contactCard.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {contactCard.whatsapp && (
                <a 
                  href={`https://wa.me/${contactCard.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary"
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

          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => navigate('/auth')}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <Button
              onClick={handleAddContact}
              disabled={adding || added}
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
                  {adding ? 'Adding...' : 'Add Contact'}
                </>
              )}
            </Button>
          </div>

          <div className="text-xs text-center text-muted-foreground pt-2">
            Scan QR codes to quickly add contacts to your network
          </div>
        </CardContent>
      </Card>
    </div>
  );
}