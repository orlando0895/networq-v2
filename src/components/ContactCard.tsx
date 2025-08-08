import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Users, Mail, Phone, Edit, Plus, Trash2, Linkedin, Facebook, MessageCircle, Globe, MessageSquare, Download, UserCheck, QrCode, CreditCard, Share2, Building2, Briefcase, ChevronDown } from "lucide-react";
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

  // Generate company logo initials or placeholder
  const getCompanyLogo = (company?: string) => {
    if (!company) return 'LOGO';
    const words = company.split(' ').filter(word => word.length > 0);
    const initials = words.slice(0, 2).map(word => word[0].toUpperCase()).join('');
    return initials || 'LOGO';
  };

  // Networq logo as SVG (simple connected dots design)
  const NetworkqLogo = ({ className }: { className?: string }) => (
    <svg 
      viewBox="0 0 24 24" 
      className={className}
      fill="currentColor"
    >
      <circle cx="6" cy="6" r="2"/>
      <circle cx="18" cy="6" r="2"/>
      <circle cx="6" cy="18" r="2"/>
      <circle cx="18" cy="18" r="2"/>
      <line x1="8" y1="6" x2="16" y2="6" stroke="currentColor" strokeWidth="1"/>
      <line x1="6" y1="8" x2="6" y2="16" stroke="currentColor" strokeWidth="1"/>
      <line x1="18" y1="8" x2="18" y2="16" stroke="currentColor" strokeWidth="1"/>
      <line x1="8" y1="18" x2="16" y2="18" stroke="currentColor" strokeWidth="1"/>
    </svg>
  );

  // Debug: Log component rendering
  console.log('🎯 ContactCard rendering with business card layout for:', contact.name);
  console.log('🔧 Contact data:', { 
    id: contact.id, 
    name: contact.name, 
    company: contact.company,
    added_via: contact.added_via 
  });

  return (
    <>
      {/* Business Card Layout - Exact Match from Images */}
      <Card className="bg-white overflow-hidden shadow-lg rounded-xl max-w-md mx-auto relative h-64" data-testid="business-card-layout">
        {/* Networq Logo - Top Left */}
        <div className="absolute top-3 left-3 z-10">
          <NetworkqLogo className="w-6 h-6 text-blue-600" />
        </div>

        {/* Top Right Action Icons */}
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
            onClick={() => setIsShareDialogOpen(true)}
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
            onClick={handleExportVCF}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex h-full">
          {/* Blue Sidebar with Contact Info */}
          <div className="w-20 bg-blue-500 flex flex-col items-center py-6 space-y-6">
            {/* Phone */}
            {contact.phone && (
              <button
                onClick={() => window.open(`tel:${contact.phone}`, '_self')}
                className="text-white hover:text-blue-100 transition-colors p-1 rounded"
                title={`Call ${contact.phone}`}
              >
                <Phone className="h-5 w-5" />
              </button>
            )}

            {/* Email */}
            {contact.email && (
              <button
                onClick={() => window.open(`mailto:${contact.email}`, '_self')}
                className="text-white hover:text-blue-100 transition-colors p-1 rounded"
                title={`Email ${contact.email}`}
              >
                <Mail className="h-5 w-5" />
              </button>
            )}

            {/* Industry */}
            {contact.industry && (
              <div className="text-white p-1 rounded" title={contact.industry}>
                <Building2 className="h-5 w-5" />
              </div>
            )}

            {/* Website */}
            {contact.websites && contact.websites.length > 0 && (
              <button
                onClick={() => window.open(formatWebsiteLink(contact.websites[0]), '_blank')}
                className="text-white hover:text-blue-100 transition-colors p-1 rounded"
                title={`Visit ${contact.websites[0]}`}
              >
                <Globe className="h-5 w-5" />
              </button>
            )}

            {/* Message */}
            <button
              onClick={handleStartConversation}
              className="text-white hover:text-blue-100 transition-colors p-1 rounded"
              title="Send message"
            >
              <MessageCircle className="h-5 w-5" />
            </button>

            {/* More Details Accordion Trigger */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="details" className="border-none">
                <AccordionTrigger className="text-white hover:text-blue-100 p-1 [&>svg]:text-white">
                  <ChevronDown className="h-5 w-5" />
                </AccordionTrigger>
                <AccordionContent className="absolute left-20 top-0 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-20">
                  <div className="space-y-4">
                    {/* Services */}
                    {contact.services && contact.services.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Services</h4>
                        <div className="flex flex-wrap gap-1">
                          {contact.services.map((service, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Social Links */}
                    {(contact.linkedin || contact.facebook || contact.whatsapp) && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Social Media</h4>
                        <div className="flex gap-2">
                          {contact.linkedin && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(formatSocialLink(contact.linkedin!, 'linkedin'), '_blank')}
                            >
                              LinkedIn
                            </Button>
                          )}
                          {contact.facebook && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(formatSocialLink(contact.facebook!, 'facebook'), '_blank')}
                            >
                              Facebook
                            </Button>
                          )}
                          {contact.whatsapp && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(formatSocialLink(contact.whatsapp!, 'whatsapp'), '_blank')}
                            >
                              WhatsApp
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {contact.notes && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                        <p className="text-sm text-gray-600">{contact.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAddingNote(true)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Note
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingContact(true)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDelete}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-6 relative flex flex-col justify-center items-center">
            {/* Profile Photo - Centered */}
            <div className="mb-4">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={undefined} alt={contact.name} />
                <AvatarFallback className="bg-gray-100 text-gray-600 text-xl font-semibold">
                  {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Contact Details - Centered */}
            <div className="text-center space-y-1">
              {/* Contact Name */}
              <h3 className="text-xl font-bold text-gray-900 leading-tight">
                {contact.name}
              </h3>

              {/* Company Name */}
              {contact.company && (
                <p className="text-base text-gray-600 font-medium">
                  {contact.company}
                </p>
              )}

              {/* Added Via Badge */}
              {contact.added_via && (
                <div className="mt-3">
                  <Badge 
                    className={`inline-flex items-center gap-1 border text-xs ${getAddedViaBadge(contact.added_via).className}`}
                    variant="outline"
                  >
                    {getAddedViaBadge(contact.added_via).icon}
                    {getAddedViaBadge(contact.added_via).text}
                  </Badge>
                </div>
              )}
            </div>

            {/* Company Logo - Bottom Right */}
            <div className="absolute bottom-4 right-4">
              <div className="w-12 h-12 bg-gray-100 border border-gray-300 rounded flex items-center justify-center">
                <span className="text-xs text-gray-600 font-semibold">
                  {getCompanyLogo(contact.company)}
                </span>
              </div>
            </div>

            {/* Networq Logo - Bottom Right Corner */}
            <div className="absolute bottom-2 right-16">
              <NetworkqLogo className="w-4 h-4 text-gray-400 opacity-60" />
            </div>
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