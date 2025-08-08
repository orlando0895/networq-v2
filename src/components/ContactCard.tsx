
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Star, Users, Mail, Phone, UserPlus, Edit, Plus, ChevronDown, Trash2, MoreVertical, Linkedin, Facebook, MessageCircle, Globe, MessageSquare, Download, UserCheck, QrCode, Scan, CreditCard } from "lucide-react";
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
      <Card className="bg-card border border-border hover:shadow-lg transition-all duration-300 group overflow-hidden">
        <Accordion type="single" collapsible>
          <AccordionItem value={contact.id} className="border-none">
            {/* Business Card Layout */}
            <div className="w-full max-w-4xl mx-auto aspect-[7/4] min-h-[300px] sm:min-h-[340px] rounded-2xl bg-gradient-to-br from-background to-muted/10 relative overflow-hidden p-5 sm:p-6 md:p-8 ring-1 ring-border shadow-sm animate-enter">
              
              {/* Top-left brand mark */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4" aria-label="Brand Mark">
                <img
                  src="/lovable-uploads/35f0bcd5-8832-4a5a-9f44-4111a705f5e6.png"
                  alt="Networq logo"
                  className="h-8 w-8 sm:h-10 sm:w-10 object-contain drop-shadow"
                  loading="lazy"
                />
              </div>

              {/* Bottom-right brand mark */}
              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4" aria-label="Brand Mark">
                <img
                  src="/lovable-uploads/35f0bcd5-8832-4a5a-9f44-4111a705f5e6.png"
                  alt="Networq logo"
                  className="h-8 w-8 sm:h-10 sm:w-10 object-contain drop-shadow"
                  loading="lazy"
                />
              </div>

              {/* Right blue section with profile */}
              <div className="absolute right-0 top-0 w-[45%] h-[60%] bg-primary rounded-bl-[40px] sm:rounded-bl-[80px] z-0" />

              {/* Profile picture area */}
              <div className="absolute right-[2%] top-[5%] w-[38%] h-[50%] flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-muted flex items-center justify-center relative">
                  {contact.profile_picture_url ? (
                    <img 
                      src={contact.profile_picture_url} 
                      alt={`${contact.name} profile`}
                      className="w-full h-full rounded-full object-cover"
                    />
) : (
                    <img 
                      src="/placeholder.svg" 
                      alt="Placeholder profile"
                      className="w-full h-full rounded-full object-cover opacity-90"
                    />
                  )}
                </div>
              </div>

              {/* Top-right action icons */}
              <div className="absolute top-3 right-12 sm:top-4 sm:right-16 flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 sm:h-8 sm:w-8 hover:bg-background/20"
                  onClick={() => setIsShareDialogOpen(true)}
                >
                  <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 sm:h-8 sm:w-8 hover:bg-background/20"
                  onClick={handleExportVCF}
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                </Button>
              </div>

              {/* Contact name, company, and logo section */}
              <div className="absolute left-[52%] right-0 top-[55%] text-center px-2">
                <div className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-foreground leading-none">
                  {contact.name}
                </div>
                {contact.company && (
                  <div className="mt-2 sm:mt-4 text-sm sm:text-lg lg:text-xl font-normal text-muted-foreground tracking-wide">
                    {contact.company}
                  </div>
                )}
              </div>

              {/* Left column with contact info */}
              <div className="absolute left-4 top-12 sm:top-16 w-[45%] space-y-3 sm:space-y-4">
                {/* Phone */}
                {contact.phone && (
                  <ContactRow
                    icon={<Phone className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
                    label={contact.phone}
                    onClick={() => window.open(formatPhoneLink(contact.phone))}
                    clickable
                  />
                )}
                
                {/* Email */}
                <ContactRow
                  icon={<Mail className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
                  label={contact.email}
                  onClick={() => window.open(formatEmailLink(contact.email))}
                  clickable
                />
                
                {/* Industry */}
                {contact.industry && (
                  <ContactRow
                    icon={
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3L2 9l10 6 10-6-10-6zM2 17l10 6 10-6M2 13l10 6 10-6"/>
                      </svg>
                    }
                    label={contact.industry}
                  />
                )}
                
                {/* Website */}
                {contact.websites && contact.websites.length > 0 && (
                  <ContactRow
                    icon={<Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
                    label={contact.websites[0].replace(/^https?:\/\//, '')}
                    onClick={() => window.open(formatWebsiteLink(contact.websites[0]))}
                    clickable
                  />
                )}
                
                {/* Message action */}
                <ContactRow
                  icon={<MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
                  label="[MESSAGE]"
                  onClick={handleStartConversation}
                  action
                />

                {/* Edit action - manual contacts only */}
                {(!contact.added_via || contact.added_via === 'manual') && (
                  <ContactRow
                    icon={<Edit className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
                    label="[EDIT CONTACT]"
                    onClick={() => setIsEditingContact(true)}
                    action
                    clickable
                  />
                )}
                
                {/* Expand details action */}
                <AccordionTrigger className="flex items-center hover:no-underline p-0 w-full">
                  <ContactRow
                    icon={<ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />}
                    label="[OPEN MORE DETAILS]"
                    action
                  />
                </AccordionTrigger>
              </div>
            </div>

            <AccordionContent>
              <CardContent className="pt-4 px-6 pb-6 bg-muted/5 border-t border-border">
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={`${getAddedViaBadge(contact.added_via).className} flex items-center gap-1 text-xs font-medium`}
                    >
                      {getAddedViaBadge(contact.added_via).icon}
                      <span>{getAddedViaBadge(contact.added_via).text}</span>
                    </Badge>
                  </div>
                  {/* Social Media & Websites */}
                  {(contact.linkedin || contact.facebook || contact.whatsapp || (contact.websites && contact.websites.length > 1)) && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-5 bg-primary rounded-full"></div>
                        <p className="text-sm font-semibold text-foreground">Connect</p>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {contact.linkedin && (
                          <a
                            href={formatSocialLink('linkedin', contact.linkedin)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors group"
                          >
                            <Linkedin className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-foreground group-hover:text-primary">LinkedIn</span>
                          </a>
                        )}
                        {contact.facebook && (
                          <a
                            href={formatSocialLink('facebook', contact.facebook)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors group"
                          >
                            <Facebook className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-foreground group-hover:text-primary">Facebook</span>
                          </a>
                        )}
                        {contact.whatsapp && (
                          <a
                            href={formatSocialLink('whatsapp', contact.whatsapp)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors group"
                          >
                            <MessageCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-foreground group-hover:text-primary">WhatsApp</span>
                          </a>
                        )}
                        {contact.websites && contact.websites.slice(1).map((website, index) => (
                          <a
                            key={index}
                            href={formatWebsiteLink(website)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors group"
                          >
                            <Globe className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground group-hover:text-primary truncate">
                              {website.replace(/^https?:\/\//, '')}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Services */}
                  {contact.services && contact.services.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-5 bg-primary rounded-full"></div>
                        <p className="text-sm font-semibold text-foreground">Services</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {contact.services.map((service, index) => (
                          <Badge key={index} variant="secondary" className="text-xs bg-accent text-accent-foreground border-border">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {contact.notes && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-5 bg-primary rounded-full"></div>
                        <p className="text-sm font-semibold text-foreground">Notes</p>
                      </div>
                      <div className="p-4 bg-card border border-border rounded-lg">
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{contact.notes}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-4 border-t border-border">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="justify-center h-10 border-border"
                      onClick={handleStartConversation}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="justify-center h-10 border-border"
                      onClick={() => setIsEditingContact(true)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="justify-center h-10 border-border"
                      onClick={() => setIsAddingNote(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Note
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="justify-center h-10 border-border"
                      onClick={handleExportVCF}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="justify-center h-10 border-border">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-popover shadow-lg border-border z-50">
                        <DropdownMenuItem onClick={() => setIsShareDialogOpen(true)} className="cursor-pointer">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Share Contact
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer text-destructive focus:text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Contact
                            </DropdownMenuItem>
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
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

// Contact Row Component
interface ContactRowProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  clickable?: boolean;
  action?: boolean;
}

const ContactRow = ({ icon, label, onClick, clickable, action }: ContactRowProps) => {
  const baseClasses = "flex items-center w-full";
  const interactiveClasses = clickable || action ? "cursor-pointer hover:bg-accent/20 rounded-md transition-colors" : "";
  
  return (
    <div 
      className={`${baseClasses} ${interactiveClasses}`}
      onClick={onClick}
    >
      <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center">
        {icon}
      </div>
      <div className={`ml-3 sm:ml-4 text-sm sm:text-base lg:text-lg tracking-wide text-foreground ${action ? 'font-medium' : ''}`}>
        {label}
      </div>
    </div>
  );
};

export default ContactCard;
