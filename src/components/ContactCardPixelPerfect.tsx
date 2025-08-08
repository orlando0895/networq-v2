import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Phone, 
  Mail, 
  Home, 
  Laptop, 
  MessageCircle, 
  ChevronDown, 
  Send, 
  Download,
  Users,
  QrCode,
  CreditCard,
  UserCheck,
  Edit
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import EditContactForm from "./EditContactForm";
import AddNoteForm from "./AddNoteForm";
import { ShareContactDialog } from "./ShareContactDialog";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { downloadVCF } from '@/lib/vcf';
import type { Database } from '@/integrations/supabase/types';

type Contact = Database['public']['Tables']['contacts']['Row'];

interface ContactCardProps {
  contact: Contact;
  onUpdateContact: (id: string, updates: Partial<Contact>) => Promise<any>;
  onDeleteContact: (id: string) => Promise<any>;
}

const ContactCardPixelPerfect = ({ contact, onUpdateContact, onDeleteContact }: ContactCardProps) => {
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isMoreDetailsOpen, setIsMoreDetailsOpen] = useState(false);
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

  // Networq logo as SVG - simple "N" with three connected nodes
  const NetworkqLogo = ({ className }: { className?: string }) => (
    <svg 
      viewBox="0 0 50 50" 
      className={className}
      fill="currentColor"
    >
      {/* Three rounded nodes */}
      <circle cx="12" cy="12" r="6"/>
      <circle cx="38" cy="12" r="6"/>
      <circle cx="25" cy="38" r="6"/>
      {/* Diagonal connecting stroke */}
      <path d="M18 12 L32 38" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );

  return (
    <>
      {/* Pixel-Perfect Business Card - 1050x600 scaled for mobile */}
      <Card className="relative bg-white overflow-hidden" 
            style={{ 
              width: '100%', 
              maxWidth: '525px', // Half of 1050px for mobile
              height: '300px',   // Half of 600px for mobile
              aspectRatio: '1050/600'
            }}>
        
        {/* Top-left Networq logo */}
        <div className="absolute top-3 left-3">
          <NetworkqLogo className="text-primary-blue w-6 h-6" />
        </div>

        {/* Top-right UI icons */}
        <div className="absolute flex gap-4" style={{ top: '11px', right: '11px' }}>
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto w-auto text-primary-blue hover:text-accent-sky-blue w-[18px] h-[18px]"
            onClick={() => setIsShareDialogOpen(true)}
          >
            <Send className="w-full h-full" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto w-auto text-primary-blue hover:text-accent-sky-blue w-[18px] h-[18px]"
            onClick={handleExportVCF}
          >
            <Download className="w-full h-full" />
          </Button>
        </div>

        {/* Left column - Icons + Labels */}
        <div className="absolute" style={{ left: '12px', top: '20px', width: '215px' }}>
          {/* Phone Row */}
          {contact.phone && (
            <div className="flex items-center mb-9">
              <button
                onClick={() => window.open(`tel:${contact.phone}`, '_self')}
                className="text-primary-blue hover:text-accent-sky-blue transition-colors w-[22px] h-[22px]"
              >
                <Phone className="w-full h-full" />
              </button>
              <span 
                className="font-montserrat text-navy-ink font-normal tracking-wider"
                style={{ fontSize: '16px', marginLeft: '14px' }}
              >
                (PHONE NUMBER)
              </span>
            </div>
          )}

          {/* Email Row */}
          {contact.email && (
            <div className="flex items-center mb-9">
              <button
                onClick={() => window.open(`mailto:${contact.email}`, '_self')}
                className="text-primary-blue hover:text-accent-sky-blue transition-colors w-[22px] h-[22px]"
              >
                <Mail className="w-full h-full" />
              </button>
              <span 
                className="font-montserrat text-navy-ink font-normal tracking-wider"
                style={{ fontSize: '16px', marginLeft: '14px' }}
              >
                (EMAIL)
              </span>
            </div>
          )}

          {/* Industry Row */}
          {contact.industry && (
            <div className="flex items-center mb-9">
              <div className="text-primary-blue w-[22px] h-[22px]">
                <Home className="w-full h-full" />
              </div>
              <span 
                className="font-montserrat text-navy-ink font-normal tracking-wider"
                style={{ fontSize: '16px', marginLeft: '14px' }}
              >
                (INDUSTRY)
              </span>
            </div>
          )}

          {/* Website Row */}
          {contact.websites && contact.websites.length > 0 && (
            <div className="flex items-center mb-9">
              <button
                onClick={() => window.open(contact.websites![0].startsWith('http') ? contact.websites![0] : `https://${contact.websites![0]}`, '_blank')}
                className="text-primary-blue hover:text-accent-sky-blue transition-colors w-[22px] h-[22px]"
              >
                <Laptop className="w-full h-full" />
              </button>
              <span 
                className="font-montserrat text-navy-ink font-normal tracking-wider"
                style={{ fontSize: '16px', marginLeft: '14px' }}
              >
                (WEBSITE)
              </span>
            </div>
          )}

          {/* Message Row */}
          <div className="flex items-center mb-9">
            <button
              onClick={handleStartConversation}
              className="text-primary-blue hover:text-accent-sky-blue transition-colors w-[22px] h-[22px]"
            >
              <MessageCircle className="w-full h-full" />
            </button>
            <span 
              className="font-montserrat text-navy-ink font-normal tracking-wider"
              style={{ fontSize: '16px', marginLeft: '14px' }}
            >
              [MESSAGE]
            </span>
          </div>

          {/* More Details Row */}
          <div className="flex items-center">
            <button
              onClick={() => setIsMoreDetailsOpen(!isMoreDetailsOpen)}
              className="text-primary-blue hover:text-accent-sky-blue transition-colors w-[22px] h-[22px]"
            >
              <ChevronDown className="w-full h-full" />
            </button>
            <span 
              className="font-montserrat text-navy-ink font-normal tracking-wider"
              style={{ fontSize: '16px', marginLeft: '14px' }}
            >
              [OPEN MORE DETAILS]
            </span>
          </div>
        </div>

        {/* Blue ribbon shape with avatar */}
        <div 
          className="absolute bg-primary-blue"
          style={{ 
            right: '0',
            top: '0',
            width: '165px', // Half of 330px
            height: '300px', // Full height
            borderBottomLeftRadius: '80px'
          }}
        >
          {/* Avatar circle inside ribbon */}
          <div 
            className="absolute"
            style={{ 
              left: '50%',
              top: '92px', // Half of 185px 
              transform: 'translateX(-50%)',
              width: '140px', // Half of 280px
              height: '140px'
            }}
          >
            <Avatar className="w-full h-full border-4 border-medium-gray">
              <AvatarImage src={undefined} alt={contact.name} />
              <AvatarFallback className="bg-very-light-gray text-navy-ink text-2xl font-bold">
                {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {/* Profile photo overlay text */}
            <div 
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 font-montserrat font-extrabold text-navy-ink text-center"
              style={{ fontSize: '14px' }}
            >
              (PROFILE PHOTO)
            </div>
          </div>
        </div>

        {/* Contact name & company (right half center) */}
        <div 
          className="absolute text-center"
          style={{ 
            left: '50%',
            top: '240px', // Below avatar
            transform: 'translateX(-50%)',
            width: '200px'
          }}
        >
          {/* Contact Name */}
          <h1 
            className="font-montserrat font-extrabold text-navy-ink mb-2"
            style={{ fontSize: '28px', lineHeight: '1' }}
          >
            (CONTACT NAME)
          </h1>
          
          {/* Company Name */}
          <p 
            className="font-montserrat font-normal text-navy-ink tracking-wider"
            style={{ fontSize: '16px' }}
          >
            (COMPANY NAME)
          </p>
        </div>

        {/* Logo placeholder */}
        <div 
          className="absolute text-center"
          style={{ 
            right: '82px', // 50px from right + 32px space
            bottom: '45px', // 60-70px below company name area
          }}
        >
          <span 
            className="font-montserrat font-extrabold text-navy-ink"
            style={{ fontSize: '20px' }}
          >
            (LOGO)
          </span>
        </div>

        {/* Bottom-right Networq logo */}
        <div className="absolute bottom-3 right-3">
          <NetworkqLogo className="text-primary-blue w-6 h-6" />
        </div>

        {/* More Details Overlay */}
        {isMoreDetailsOpen && (
          <div className="absolute top-0 left-0 w-full h-full bg-white/95 backdrop-blur-sm z-50 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-montserrat font-bold text-navy-ink text-lg">Contact Details</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMoreDetailsOpen(false)}
                  className="text-navy-ink"
                >
                  ×
                </Button>
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                {contact.phone && (
                  <p className="font-montserrat text-navy-ink">Phone: {contact.phone}</p>
                )}
                {contact.email && (
                  <p className="font-montserrat text-navy-ink">Email: {contact.email}</p>
                )}
                {contact.industry && (
                  <p className="font-montserrat text-navy-ink">Industry: {contact.industry}</p>
                )}
                {contact.websites && contact.websites.length > 0 && (
                  <p className="font-montserrat text-navy-ink">Website: {contact.websites[0]}</p>
                )}
              </div>

              {/* Services */}
              {contact.services && contact.services.length > 0 && (
                <div>
                  <h4 className="font-montserrat font-semibold text-navy-ink mb-2">Services</h4>
                  <div className="flex flex-wrap gap-1">
                    {contact.services.map((service, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {contact.notes && (
                <div>
                  <h4 className="font-montserrat font-semibold text-navy-ink mb-2">Notes</h4>
                  <p className="font-montserrat text-navy-ink text-sm">{contact.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddingNote(true);
                    setIsMoreDetailsOpen(false);
                  }}
                  className="font-montserrat"
                >
                  Add Note
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditingContact(true);
                    setIsMoreDetailsOpen(false);
                  }}
                  className="font-montserrat"
                >
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="font-montserrat text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
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

export default ContactCardPixelPerfect;