import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Star, 
  Mail, 
  Phone, 
  MessageSquare, 
  Download, 
  Share2, 
  Edit,
  Building2,
  Globe,
  Linkedin,
  Facebook,
  MessageCircle,
  UserCheck,
  QrCode,
  CreditCard,
  ChevronRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { downloadVCF } from '@/lib/vcf';
import { formatEmailLink, formatPhoneLink } from '@/lib/utils';
import { ShareContactDialog } from './ShareContactDialog';
import AddNoteForm from './AddNoteForm';
import type { Database } from '@/integrations/supabase/types';

type Contact = Database['public']['Tables']['contacts']['Row'];

interface ModernContactCardProps {
  contact: Contact;
  onUpdateContact: (id: string, updates: Partial<Contact>) => Promise<any>;
  onDeleteContact: (id: string) => Promise<any>;
}

export const ModernContactCard = ({ contact, onUpdateContact, onDeleteContact }: ModernContactCardProps) => {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isNoteFormOpen, setIsNoteFormOpen] = useState(false);
  const [hasAccount, setHasAccount] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if contact has an account on the platform
  useEffect(() => {
    const checkContactAccount = async () => {
      if (!['share_code', 'qr_code', 'mutual_contact', 'business_card'].includes(contact.added_via || '')) {
        setHasAccount(false);
        return;
      }

      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', contact.email)
          .maybeSingle();

        setHasAccount(!profileError && !!profileData);
      } catch (error) {
        setHasAccount(false);
      }
    };

    checkContactAccount();
  }, [contact.email, contact.added_via]);

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
      description: `${contact.name}'s contact info saved to your device.`,
      className: "toast-enter"
    });
  };

  const handleStartConversation = async () => {
    if (!contact.added_via || !['share_code', 'qr_code', 'mutual_contact', 'business_card'].includes(contact.added_via)) {
      toast({
        title: "Messaging Not Available",
        description: "You can only message contacts added through share codes, QR codes, business cards, or mutual contacts.",
        variant: "destructive"
      });
      return;
    }

    try {
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

      navigate(`/messages?conversationId=${conversationId}`, { state: { conversationId } });
      
      toast({
        title: "Conversation started",
        description: `You can now message ${contact.name}`,
        className: "toast-enter"
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

  const getAddedViaBadge = (addedVia: string | null) => {
    switch (addedVia) {
      case 'mutual_contact':
        return {
          icon: <UserCheck className="w-3 h-3" />,
          text: 'Mutual',
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300'
        };
      case 'share_code':
        return {
          icon: <Share2 className="w-3 h-3" />,
          text: 'Shared',
          className: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300'
        };
      case 'qr_code':
        return {
          icon: <QrCode className="w-3 h-3" />,
          text: 'QR Code',
          className: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300'
        };
      case 'business_card':
        return {
          icon: <CreditCard className="w-3 h-3" />,
          text: 'Card',
          className: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300'
        };
      default:
        return {
          icon: <Edit className="w-3 h-3" />,
          text: 'Manual',
          className: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300'
        };
    }
  };

  const getTierColor = (tier: string | null) => {
    switch (tier) {
      case 'A-player':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'Acquaintance':
        return 'bg-gradient-to-r from-primary/60 to-primary-glow/60';
      default:
        return 'bg-gradient-primary';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const badge = getAddedViaBadge(contact.added_via);

  return (
    <>
      <div className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground truncate pr-2">
              {contact.name}
            </h3>
            <Badge className={`${badge.className} text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1.5 shrink-0`}>
              {badge.icon}
              <span>{badge.text}</span>
            </Badge>
          </div>
          
          {/* Primary Action Button */}
          {hasAccount ? (
            <Button
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg mb-4"
              onClick={handleStartConversation}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Message
            </Button>
          ) : (
            <Button
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg mb-4"
              onClick={() => window.open(formatEmailLink(contact.email))}
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>
          )}
        </div>

        {/* Contact Details */}
        <div className="px-6 pb-6 space-y-3">
          {/* Company & Industry */}
          {contact.company && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Building2 className="w-4 h-4 mr-3 text-muted-foreground/70" />
              <span className="font-medium">Company</span>
              <span className="ml-auto text-foreground">{contact.company}</span>
            </div>
          )}
          
          {contact.industry && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Globe className="w-4 h-4 mr-3 text-muted-foreground/70" />
              <span className="font-medium">Industry</span>
              <span className="ml-auto text-foreground">{contact.industry}</span>
            </div>
          )}

          {/* Phone */}
          {contact.phone && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Phone className="w-4 h-4 mr-3 text-muted-foreground/70" />
              <span className="font-medium">Phone</span>
              <Button
                variant="link" 
                className="ml-auto p-0 h-auto text-sm text-primary hover:text-primary/80"
                onClick={() => window.open(formatPhoneLink(contact.phone))}
              >
                {contact.phone}
              </Button>
            </div>
          )}

          {/* Email */}
          <div className="flex items-center text-sm text-muted-foreground">
            <Mail className="w-4 h-4 mr-3 text-muted-foreground/70" />
            <span className="font-medium">Email</span>
            <Button
              variant="link" 
              className="ml-auto p-0 h-auto text-sm text-primary hover:text-primary/80 truncate max-w-[140px]"
              onClick={() => window.open(formatEmailLink(contact.email))}
            >
              {contact.email}
            </Button>
          </div>

          {/* Social Links */}
          {(contact.linkedin || contact.facebook || contact.whatsapp || (contact.websites && contact.websites.length > 0)) && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-medium text-muted-foreground">Social</span>
              <div className="flex items-center gap-2">
                {contact.linkedin && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => window.open(contact.linkedin!, '_blank')}
                  >
                    <Linkedin className="w-4 h-4 text-blue-600" />
                  </Button>
                )}
                {contact.facebook && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => window.open(contact.facebook!, '_blank')}
                  >
                    <Facebook className="w-4 h-4 text-blue-600" />
                  </Button>
                )}
                {contact.whatsapp && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => window.open(contact.whatsapp!, '_blank')}
                  >
                    <MessageCircle className="w-4 h-4 text-green-600" />
                  </Button>
                )}
                {(contact.websites && contact.websites.length > 0) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => window.open(contact.websites![0], '_blank')}
                  >
                    <Globe className="w-4 h-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <Button
              variant="ghost" 
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setIsShareDialogOpen(true)}
            >
              <Share2 className="w-3 h-3 mr-1.5" />
              Share
            </Button>
            <Button
              variant="ghost" 
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={handleExportVCF}
            >
              <Download className="w-3 h-3 mr-1.5" />
              Export
            </Button>
            <Button
              variant="ghost" 
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setIsNoteFormOpen(true)}
            >
              <Edit className="w-3 h-3 mr-1.5" />
              Note
            </Button>
          </div>
        </div>
      </div>

      <ShareContactDialog
        contact={contact}
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
      />

      <AddNoteForm
        contact={contact}
        isOpen={isNoteFormOpen}
        onOpenChange={setIsNoteFormOpen}
        onUpdateContact={onUpdateContact}
      />
    </>
  );
};