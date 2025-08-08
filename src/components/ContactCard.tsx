import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Users, Mail, Phone, Edit, Plus, Trash2, Linkedin, Facebook, MessageCircle, Globe, MessageSquare, Download, UserCheck, QrCode, CreditCard, Share2, Building2, Briefcase } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import EditContactForm from "./EditContactForm";
import AddNoteForm from "./AddNoteForm";
import { ShareContactDialog } from "./ShareContactDialog";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { downloadVCF } from '@/lib/vcf';
import { formatEmailLink, formatPhoneLink } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';

type Contact = Database['public']['Tables']['contacts']['Row'];

interface ContactCardProps {
  contact: Contact;
  onUpdateContact: (id: string, updates: Partial<Contact>) => Promise<any>;
  onDeleteContact: (id: string) => Promise<any>;
}

const ContactCard = ({ contact, onUpdateContact, onDeleteContact }: ContactCardProps) => {
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDelete = async () => {
    await onDeleteContact(contact.id);
  };

  const handleExportVCF = () => {
    const contactData = {
      name: contact.name,
      email: contact.email,
      phone: contact.phone || undefined,
      company: contact.company || undefined,
      industry: contact.industry || undefined,
      linkedin: contact.linkedin || undefined,
      facebook: contact.facebook || undefined,
      whatsapp: contact.whatsapp || undefined,
      websites: contact.websites || undefined,
      notes: contact.notes || undefined
    };
    
    downloadVCF(contactData);
    toast({
      title: "Contact exported",
      description: `${contact.name}'s contact info saved to your device.`
    });
  };

  const handleStartConversation = async () => {
    // Check if contact was added through allowed methods
    if (!contact.added_via || !['share_code', 'qr_code', 'mutual_contact', 'business_card'].includes(contact.added_via)) {
      toast({
        title: "Messaging Not Available",
        description: "You can only message contacts added through share codes, QR codes, business cards, or mutual contacts.",
        variant: "destructive"
      });
      return;
    }

    try {
      // First, get the profile associated with this contact
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', contact.email)
        .single();

      if (profileError || !profileData) {
        toast({
          title: "Contact not on platform",
          description: `${contact.name} hasn't joined Networq yet, so you can't message them directly.`,
          variant: "destructive"
        });
        return;
      }

      // Create or get existing conversation
      const { data: conversationId, error: convError } = await supabase.rpc('get_or_create_direct_conversation', {
        other_user_id: profileData.id
      });

      if (convError) {
        console.error('Error creating conversation:', convError);
        toast({
          title: "Error",
          description: "Failed to start conversation",
          variant: "destructive"
        });
        return;
      }

      // Navigate to messages page
      navigate('/messages');
      
      toast({
        title: "Conversation started",
        description: `You can now message ${contact.name}`,
      });
    } catch (error: any) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive"
      });
    }
  };

  const formatSocialLink = (platform: string, value: string) => {
    if (!value) return '';
    
    // If it's already a full URL, return as is
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }
    
    // Handle different platform formats
    switch (platform) {
      case 'linkedin':
        if (value.includes('linkedin.com')) return `https://${value}`;
        return `https://linkedin.com/in/${value.replace('@', '')}`;
      case 'facebook':
        if (value.includes('facebook.com')) return `https://${value}`;
        return `https://facebook.com/${value.replace('@', '')}`;
      case 'whatsapp':
        if (value.includes('wa.me')) return `https://${value}`;
        const cleanNumber = value.replace(/[^\d+]/g, '');
        return `https://wa.me/${cleanNumber}`;
      default:
        return value;
    }
  };

  const formatWebsiteLink = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  const getAddedViaBadge = (addedVia: string | null) => {
    switch (addedVia) {
      case 'mutual_contact':
        return {
          icon: <UserCheck className="w-3 h-3" />,
          text: 'Mutual Contact',
          className: 'bg-emerald-100 text-emerald-800 border-emerald-300'
        };
      case 'share_code':
        return {
          icon: <Users className="w-3 h-3" />,
          text: 'Share Code',
          className: 'bg-blue-100 text-blue-800 border-blue-300'
        };
      case 'qr_code':
        return {
          icon: <QrCode className="w-3 h-3" />,
          text: 'QR Code',
          className: 'bg-purple-100 text-purple-800 border-purple-300'
        };
      case 'business_card':
        return {
          icon: <CreditCard className="w-3 h-3" />,
          text: 'Business Card',
          className: 'bg-orange-100 text-orange-800 border-orange-300'
        };
      default:
        return {
          icon: <Edit className="w-3 h-3" />,
          text: 'Manual',
          className: 'bg-muted text-muted-foreground border-border'
        };
    }
  };

  return (
    <>
      {/* Business Card Layout */}
      <Card className="bg-card border border-border hover:shadow-lg transition-all duration-300 group overflow-hidden">
        <div className="relative">
          {/* Logo Placeholder */}
          <div className="absolute top-4 left-4 w-8 h-8 bg-muted/40 border border-border rounded flex items-center justify-center">
            <div className="text-xs text-muted-foreground font-mono">LOGO</div>
          </div>

          {/* Share Button */}
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-4 right-4 h-8 w-8 p-0 hover:bg-muted/50"
            onClick={() => setIsShareDialogOpen(true)}
          >
            <Share2 className="w-4 h-4" />
          </Button>

          {/* Main Content */}
          <div className="pt-16 p-6">
            {/* Header Section */}
            <div className="flex items-start gap-4 mb-6">
              <Avatar className="h-16 w-16 border-2 border-border shadow-sm">
                <AvatarImage src={contact.profile_picture_url || undefined} />
                <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                  {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-foreground truncate">
                  {contact.name}
                </h3>
                {contact.company && (
                  <div className="flex items-center gap-2 mt-1">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground truncate">{contact.company}</span>
                  </div>
                )}
                {contact.industry && (
                  <div className="flex items-center gap-2 mt-1">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground truncate">{contact.industry}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                <a 
                  href={formatEmailLink(contact.email)}
                  className="text-sm text-primary hover:text-primary/80 hover:underline truncate"
                  aria-label={`Email ${contact.name}`}
                >
                  {contact.email}
                </a>
              </div>
              {contact.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                  <a 
                    href={formatPhoneLink(contact.phone)}
                    className="text-sm text-primary hover:text-primary/80 hover:underline"
                    aria-label={`Call ${contact.name}`}
                  >
                    {contact.phone}
                  </a>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleStartConversation}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="px-3"
                onClick={() => setIsEditingContact(true)}
                disabled={contact.added_via !== 'manual'}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>

            {/* More Details Trigger */}
            <Accordion type="single" collapsible className="mt-4">
              <AccordionItem value={contact.id} className="border-none">
                <AccordionTrigger className="py-2 hover:no-underline text-sm text-muted-foreground">
                  More details
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-4 space-y-6">
                    {/* Added Via Badge */}
                    <div className="flex items-center justify-between">
                      <Badge 
                        className={`${getAddedViaBadge(contact.added_via).className} flex items-center gap-1 text-xs font-medium shadow-sm`}
                      >
                        {getAddedViaBadge(contact.added_via).icon}
                        <span>{getAddedViaBadge(contact.added_via).text}</span>
                      </Badge>
                    </div>

                    {/* Services */}
                    {contact.services && contact.services.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-foreground">Services</p>
                        <div className="flex flex-wrap gap-2">
                          {contact.services.map((service, index) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Social Media & Websites */}
                    {(contact.linkedin || contact.facebook || contact.whatsapp || (contact.websites && contact.websites.length > 0)) && (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-foreground">Social & Web</p>
                        <div className="grid grid-cols-2 gap-2">
                          {contact.linkedin && (
                            <a
                              href={formatSocialLink('linkedin', contact.linkedin)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 bg-muted/30 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                            >
                              <Linkedin className="w-4 h-4 text-blue-600" />
                              <span className="text-sm">LinkedIn</span>
                            </a>
                          )}
                          {contact.facebook && (
                            <a
                              href={formatSocialLink('facebook', contact.facebook)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 bg-muted/30 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                            >
                              <Facebook className="w-4 h-4 text-blue-600" />
                              <span className="text-sm">Facebook</span>
                            </a>
                          )}
                          {contact.whatsapp && (
                            <a
                              href={formatSocialLink('whatsapp', contact.whatsapp)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 bg-muted/30 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                            >
                              <MessageCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm">WhatsApp</span>
                            </a>
                          )}
                          {contact.websites && contact.websites.map((website, index) => (
                            <a
                              key={index}
                              href={formatWebsiteLink(website)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 bg-muted/30 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                            >
                              <Globe className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm truncate">Website</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {contact.notes && (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-foreground">Notes</p>
                        <div className="p-3 bg-muted/30 border border-border rounded-lg">
                          <p className="text-sm text-foreground">{contact.notes}</p>
                        </div>
                      </div>
                    )}

                    {/* Additional Actions */}
                    <div className="flex gap-2 pt-4 border-t border-border">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1"
                        onClick={() => setIsAddingNote(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Note
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1"
                        onClick={handleExportVCF}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" className="px-3 text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Contact</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {contact.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDelete}
                              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </Card>

      <EditContactForm
        contact={contact}
        isOpen={isEditingContact}
        onOpenChange={setIsEditingContact}
        onUpdateContact={onUpdateContact}
      />

      <AddNoteForm
        contact={contact}
        isOpen={isAddingNote}
        onOpenChange={setIsAddingNote}
        onUpdateContact={onUpdateContact}
      />

      <ShareContactDialog
        contact={contact}
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
      />
    </>
  );
};

export default ContactCard;