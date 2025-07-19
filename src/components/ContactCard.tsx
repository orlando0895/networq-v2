
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Star, Users, Mail, Phone, UserPlus, Edit, Plus, ChevronDown, Trash2, MoreVertical, Linkedin, Facebook, MessageCircle, Globe, MessageSquare } from "lucide-react";
import EditContactForm from "./EditContactForm";
import AddNoteForm from "./AddNoteForm";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';
import { contactHasAccount } from '@/lib/utils';

type Contact = Database['public']['Tables']['contacts']['Row'];

interface ContactCardProps {
  contact: Contact;
  onUpdateContact: (id: string, updates: Partial<Contact>) => Promise<any>;
  onDeleteContact: (id: string) => Promise<any>;
  onSwitchToMessages?: (conversationId: string) => void;
}

const ContactCard = ({ contact, onUpdateContact, onDeleteContact, onSwitchToMessages }: ContactCardProps) => {
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDelete = async () => {
    await onDeleteContact(contact.id);
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

      // Switch to messages tab with the conversation ID
      onSwitchToMessages(conversationId);
      
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
      <Card className="bg-white border border-slate-200 hover:shadow-md transition-all duration-200">
        <Accordion type="single" collapsible>
          <AccordionItem value={contact.id} className="border-none">
            <CardHeader className="pb-2 px-4 sm:px-6 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start flex-col sm:flex-row sm:items-center gap-2 mb-3">
                    <CardTitle className="text-lg sm:text-xl font-semibold text-slate-900 leading-tight">{contact.name}</CardTitle>
                    <Badge 
                      className={`${
                        contact.tier === "A-player" 
                          ? "bg-amber-50 text-amber-700 border-amber-200" 
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      } flex items-center gap-1 text-xs self-start`}
                    >
                      {contact.tier === "A-player" ? <Star className="w-3 h-3 fill-current" /> : <Users className="w-3 h-3" />}
                      <span>{contact.tier}</span>
                    </Badge>
                  </div>
                  <div className="space-y-1 mb-3">
                    <p className="text-base font-medium text-slate-700">{contact.company}</p>
                    <p className="text-sm text-slate-500">{contact.industry}</p>
                  </div>
                  
                  {/* Contact info - show on mobile */}
                  <div className="block sm:hidden space-y-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-sm text-slate-700 break-all">{contact.email}</span>
                    </div>
                    {contact.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{contact.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile actions menu */}
                <div className="flex items-center gap-2 sm:hidden">
                  <Button size="sm" className="h-9 px-3 bg-indigo-600 hover:bg-indigo-700">
                    <UserPlus className="w-4 h-4 mr-1" />
                    Refer
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                     <DropdownMenuContent align="end" className="w-48 bg-white shadow-lg border z-50">
                       {contactHasAccount(contact.added_via) && (
                         <DropdownMenuItem onClick={onSwitchToMessages ? handleStartConversation : undefined} className="cursor-pointer">
                           <MessageSquare className="w-4 h-4 mr-2" />
                           Message
                         </DropdownMenuItem>
                       )}
                      <DropdownMenuItem onClick={() => setIsEditingContact(true)} className="cursor-pointer">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Contact
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsAddingNote(true)} className="cursor-pointer">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Note
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer text-red-600 focus:text-red-700">
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
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Desktop accordion trigger */}
                <AccordionTrigger className="hover:no-underline p-2 ml-2 hidden sm:flex">
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </AccordionTrigger>
              </div>
              
              <div className="flex flex-wrap gap-1 mt-2">
                {contact.services?.slice(0, 3).map((service, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                    {service}
                  </Badge>
                ))}
                {contact.services && contact.services.length > 3 && (
                  <Badge variant="secondary" className="text-xs bg-slate-50 text-slate-600">
                    +{contact.services.length - 3}
                  </Badge>
                )}
              </div>

              {/* Mobile "View Details" button */}
              <div className="block sm:hidden mt-3">
                <AccordionTrigger className="hover:no-underline p-0 w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors">
                  <span className="flex items-center justify-center text-sm font-medium py-2">
                    View Details
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </span>
                </AccordionTrigger>
              </div>
            </CardHeader>

            <AccordionContent>
              <CardContent className="pt-0 px-4 sm:px-6 pb-4">
                <div className="space-y-4">
                  {/* Desktop contact info */}
                  <div className="hidden sm:block space-y-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="text-sm text-slate-700 break-all">{contact.email}</span>
                    </div>
                    {contact.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{contact.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Social Media & Websites */}
                  {(contact.linkedin || contact.facebook || contact.whatsapp || (contact.websites && contact.websites.length > 0)) && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-slate-700">Connect</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {contact.linkedin && (
                          <a
                            href={formatSocialLink('linkedin', contact.linkedin)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <Linkedin className="w-4 h-4" />
                            <span className="hidden sm:inline">LinkedIn</span>
                          </a>
                        )}
                        {contact.facebook && (
                          <a
                            href={formatSocialLink('facebook', contact.facebook)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <Facebook className="w-4 h-4" />
                            <span className="hidden sm:inline">Facebook</span>
                          </a>
                        )}
                        {contact.whatsapp && (
                          <a
                            href={formatSocialLink('whatsapp', contact.whatsapp)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </a>
                        )}
                        {contact.websites && contact.websites.map((website, index) => (
                          <a
                            key={index}
                            href={formatWebsiteLink(website)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 text-xs bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            <Globe className="w-4 h-4" />
                            <span className="hidden sm:inline truncate">{website.replace(/^https?:\/\//, '')}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {contact.notes && (
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">Notes</p>
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{contact.notes}</p>
                    </div>
                  )}
                  
                  {/* Desktop action buttons */}
                  <div className="hidden sm:grid grid-cols-2 lg:grid-cols-5 gap-2">
                    <Button size="sm" className="justify-center h-10">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Refer
                    </Button>
                     {contactHasAccount(contact.added_via) && (
                       <Button 
                         variant="outline" 
                         size="sm" 
                         className="justify-center h-10"
                          onClick={onSwitchToMessages ? handleStartConversation : undefined}
                       >
                         <MessageSquare className="w-4 h-4 mr-2" />
                         Message
                       </Button>
                     )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="justify-center h-10"
                      onClick={() => setIsEditingContact(true)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="justify-center h-10"
                      onClick={() => setIsAddingNote(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Note
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="justify-center h-10 text-red-600 hover:text-red-700 hover:bg-red-50">
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
                            className="bg-red-600 hover:bg-red-700 text-white"
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
    </>
  );
};

export default ContactCard;
