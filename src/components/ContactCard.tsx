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
      {/* Business Card Layout - Exact Match */}
      <Card className="bg-white overflow-hidden shadow-lg rounded-xl max-w-md mx-auto relative" data-testid="business-card-layout">
        {/* Networq Logo - Top Left */}
        <div className="absolute top-3 left-3 z-10">
          <NetworkqLogo className="w-6 h-6 text-blue-600" />
        </div>

        <div className="flex h-64">
          {/* Blue Sidebar */}
          <div className="w-20 bg-blue-500 flex flex-col items-center py-4 space-y-4">
            {/* Phone */}
            {contact.phone && (
              <a 
                href={formatPhoneLink(contact.phone)}
                className="text-white hover:text-white/80 transition-colors"
                aria-label={`Call ${contact.name}`}
              >
                <Phone className="w-5 h-5" />
              </a>
            )}
            
            {/* Email */}
            <a 
              href={formatEmailLink(contact.email)}
              className="text-white hover:text-white/80 transition-colors"
              aria-label={`Email ${contact.name}`}
            >
              <Mail className="w-5 h-5" />
            </a>
            
            {/* Industry */}
            {contact.industry && (
              <div className="text-white">
                <Building2 className="w-5 h-5" />
              </div>
            )}
            
            {/* Website */}
            {contact.websites && contact.websites.length > 0 && (
              <a
                href={formatWebsiteLink(contact.websites[0])}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-white/80 transition-colors"
              >
                <Globe className="w-5 h-5" />
              </a>
            )}
            
            {/* Message */}
            <button
              onClick={handleStartConversation}
              className="text-white hover:text-white/80 transition-colors"
              aria-label={`Message ${contact.name}`}
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            
            {/* More Details */}
            <Accordion type="single" collapsible className="w-full flex justify-center">
              <AccordionItem value={contact.id} className="border-none w-full">
                <AccordionTrigger className="p-0 hover:no-underline text-white justify-center">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-0.5 bg-white mb-1"></div>
                    <div className="w-4 h-0.5 bg-white mb-1"></div>
                    <div className="w-4 h-0.5 bg-white"></div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="absolute top-0 left-20 right-0 bg-white p-4 shadow-lg z-10 rounded-r-xl space-y-4">
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
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-900">Services</p>
                        <div className="flex flex-wrap gap-2">
                          {contact.services.map((service, index) => (
                            <Badge key={index} variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                              {service}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Social Media & Other Websites */}
                    {(contact.linkedin || contact.facebook || contact.whatsapp || (contact.websites && contact.websites.length > 1)) && (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-900">Social & Web</p>
                        <div className="grid grid-cols-2 gap-2">
                          {contact.linkedin && (
                            <a
                              href={formatSocialLink('linkedin', contact.linkedin)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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
                              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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
                              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <MessageCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm">WhatsApp</span>
                            </a>
                          )}
                          {contact.websites && contact.websites.slice(1).map((website, index) => (
                            <a
                              key={index}
                              href={formatWebsiteLink(website)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <Globe className="w-4 h-4 text-gray-600" />
                              <span className="text-sm truncate">Website</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {contact.notes && (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-900">Notes</p>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{contact.notes}</p>
                        </div>
                      </div>
                    )}

                    {/* Additional Actions */}
                    <div className="flex gap-2 pt-4 border-t">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-1"
                        onClick={() => setIsAddingNote(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Note
                      </Button>
                      {contact.added_via === 'manual' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="px-3"
                          onClick={() => setIsEditingContact(true)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" className="px-3 text-red-600 hover:text-red-700">
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
                              className="bg-red-600 hover:bg-red-700 text-white"
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
          
          {/* White Main Section */}
          <div className="flex-1 p-4 relative">
            {/* Top Right Actions */}
            <div className="absolute top-3 right-3 flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-blue-100 text-blue-600"
                onClick={() => setIsShareDialogOpen(true)}
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-blue-100 text-blue-600"
                onClick={handleExportVCF}
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>

            {/* Profile Photo */}
            <div className="absolute top-4 right-4 mt-8">
              <Avatar className="h-20 w-20 border-4 border-blue-500">
                <AvatarImage src={contact.profile_picture_url || undefined} />
                <AvatarFallback className="text-lg font-semibold bg-gray-100 text-gray-800">
                  {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Contact Name and Company */}
            <div className="mt-16 pr-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {contact.name}
              </h2>
              {contact.company && (
                <p className="text-lg text-gray-600">
                  {contact.company}
                </p>
              )}
            </div>

            {/* Company Logo */}
            <div className="absolute bottom-4 right-4">
              <div className="w-12 h-12 bg-gray-100 border border-gray-300 rounded flex items-center justify-center">
                <span className="text-xs text-gray-600 font-semibold">
                  {getCompanyLogo(contact.company)}
                </span>
              </div>
            </div>

            {/* Networq Logo - Bottom Right */}
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