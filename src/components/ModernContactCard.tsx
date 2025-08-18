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
import type { Database } from '@/integrations/supabase/types';

type Contact = Database['public']['Tables']['contacts']['Row'];

interface ModernContactCardProps {
  contact: Contact;
  onUpdateContact: (id: string, updates: Partial<Contact>) => Promise<any>;
  onDeleteContact: (id: string) => Promise<any>;
}

export const ModernContactCard = ({ contact, onUpdateContact, onDeleteContact }: ModernContactCardProps) => {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
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
      <div className="group card-floating">
        
        <div className="p-6">
          {/* Header with Avatar and Actions */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                <AvatarImage 
                  src={contact.profile_picture_url} 
                  alt={`${contact.name} profile`}
                />
                <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold text-lg">
                  {getInitials(contact.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-heading text-xl font-semibold text-foreground leading-tight">
                  {contact.name}
                </h3>
                {contact.company && (
                  <div className="flex items-center gap-1 mt-1">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{contact.company}</p>
                  </div>
                )}
                {contact.industry && (
                  <p className="text-xs text-muted-foreground mt-1">{contact.industry}</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 ripple-effect"
                      onClick={() => setIsShareDialogOpen(true)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share Contact</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 ripple-effect"
                      onClick={handleExportVCF}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download vCard</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Contact Methods - Message First with Hierarchy */}
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Primary Action: Message (if available) */}
            {hasAccount && (
              <Button
                size="sm"
                variant="default"
                className="h-9 px-4 text-sm font-medium bg-gradient-primary hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ripple-effect"
                onClick={handleStartConversation}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </Button>
            )}
            
            {/* Secondary Actions */}
            <Button
              size="sm"
              variant="secondary"
              className="h-9 px-3 text-xs font-medium hover:bg-gradient-accent transition-all duration-200 ripple-effect"
              onClick={() => window.open(formatEmailLink(contact.email))}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            
            {contact.phone && (
              <Button
                size="sm"
                variant="secondary"
                className="h-9 px-3 text-xs font-medium hover:bg-gradient-accent transition-all duration-200 ripple-effect"
                onClick={() => window.open(formatPhoneLink(contact.phone))}
              >
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
            )}
          </div>

          {/* Tags and Metadata */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={`${badge.className} text-xs font-semibold uppercase tracking-wide border px-3 py-1.5 rounded-full`}>
                {badge.icon}
                <span className="ml-1.5">{badge.text}</span>
              </Badge>
              
              {contact.tier && (
                <Badge 
                  variant="outline" 
                  className="text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-full border-primary/20 bg-gradient-accent"
                >
                  {contact.tier === 'A-player' ? '⭐ A-PLAYER' : 'ACQUAINTANCE'}
                </Badge>
              )}
            </div>

            {/* Social Links - Compact */}
            <div className="flex items-center gap-1">
              {contact.linkedin && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => window.open(contact.linkedin!, '_blank')}
                >
                  <Linkedin className="w-3 h-3 text-blue-600" />
                </Button>
              )}
              {contact.facebook && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => window.open(contact.facebook!, '_blank')}
                >
                  <Facebook className="w-3 h-3 text-blue-600" />
                </Button>
              )}
              {contact.whatsapp && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => window.open(contact.whatsapp!, '_blank')}
                >
                  <MessageCircle className="w-3 h-3 text-green-600" />
                </Button>
              )}
              {(contact.websites && contact.websites.length > 0) && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => window.open(contact.websites![0], '_blank')}
                >
                  <Globe className="w-3 h-3 text-muted-foreground" />
                </Button>
              )}
              
              {/* Expand indicator */}
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        </div>

        {/* Hover overlay with subtle animation */}
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>

      <ShareContactDialog
        contact={contact}
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
      />
    </>
  );
};