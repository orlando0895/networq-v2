
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Star, Users, Mail, Phone, UserPlus, Edit, Plus, ChevronDown, Trash2, MoreVertical, Linkedin, Facebook, MessageCircle, Globe, MessageSquare, Download } from "lucide-react";
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

  return (
    <>
      <Card className="bg-card border border-border hover:shadow-lg transition-all duration-300 group overflow-hidden">
        <Accordion type="single" collapsible>
          <AccordionItem value={contact.id} className="border-none">
            {/* Business Card Style Layout */}
            <CardHeader className="p-6 bg-gradient-to-br from-background to-muted/20">
              {/* Top Section - Name and Actions */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-border shadow-md">
                    <AvatarImage src={contact.profile_picture_url || undefined} />
                    <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                      {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold text-foreground leading-tight">
                      {contact.name}
                    </CardTitle>
                    <Badge 
                      className={`${
                        contact.tier === "A-player" 
                          ? "bg-amber-100 text-amber-800 border-amber-300 shadow-sm" 
                          : "bg-muted text-muted-foreground border-border"
                      } flex items-center gap-1 text-xs font-medium`}
                    >
                      {contact.tier === "A-player" ? <Star className="w-3 h-3 fill-current" /> : <Users className="w-3 h-3" />}
                      <span>{contact.tier}</span>
                    </Badge>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    className="h-9 px-3 bg-primary hover:bg-primary/90 shadow-sm"
                    onClick={() => setIsShareDialogOpen(true)}
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Refer</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 w-9 p-0 border-border">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-popover shadow-lg border-border z-50">
                      <DropdownMenuItem onClick={handleStartConversation} className="cursor-pointer">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsEditingContact(true)} className="cursor-pointer">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Contact
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsAddingNote(true)} className="cursor-pointer">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Note
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportVCF} className="cursor-pointer">
                        <Download className="w-4 h-4 mr-2" />
                        Save to Phone
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
                  <AccordionTrigger className="hover:no-underline p-2 border-border hover:bg-muted/50 rounded-md transition-colors">
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </AccordionTrigger>
                </div>
              </div>

              {/* Company & Industry */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-primary rounded-full"></div>
                  <div>
                    <p className="text-base font-semibold text-foreground">{contact.company}</p>
                    <p className="text-sm text-muted-foreground">{contact.industry}</p>
                  </div>
                </div>
              </div>

              {/* Essential Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                  <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                  <a 
                    href={formatEmailLink(contact.email)}
                    className="text-sm text-primary hover:text-primary/80 hover:underline break-all font-medium"
                    aria-label={`Email ${contact.name}`}
                  >
                    {contact.email}
                  </a>
                </div>
                {contact.phone && (
                  <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                    <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                    <a 
                      href={formatPhoneLink(contact.phone)}
                      className="text-sm text-primary hover:text-primary/80 hover:underline font-medium"
                      aria-label={`Call ${contact.name}`}
                    >
                      {contact.phone}
                    </a>
                  </div>
                )}
              </div>

              {/* Services Tags */}
              {contact.services && contact.services.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {contact.services.slice(0, 4).map((service, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20 font-medium">
                      {service}
                    </Badge>
                  ))}
                  {contact.services.length > 4 && (
                    <Badge variant="secondary" className="text-xs bg-muted text-muted-foreground border-border">
                      +{contact.services.length - 4} more
                    </Badge>
                  )}
                </div>
              )}
            </CardHeader>

            <AccordionContent>
              <CardContent className="pt-4 px-6 pb-6 bg-muted/5 border-t border-border">
                <div className="space-y-6">
                  {/* Social Media & Websites */}
                  {(contact.linkedin || contact.facebook || contact.whatsapp || (contact.websites && contact.websites.length > 0)) && (
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
                        {contact.websites && contact.websites.map((website, index) => (
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

                  {/* All Services */}
                  {contact.services && contact.services.length > 4 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-5 bg-primary rounded-full"></div>
                        <p className="text-sm font-semibold text-foreground">All Services</p>
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
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="justify-center h-10 text-destructive hover:text-destructive border-border hover:bg-destructive/10">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
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

export default ContactCard;
