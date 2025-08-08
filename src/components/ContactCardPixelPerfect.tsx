import React, { useState } from "react";
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

  // Row component for consistent layout
  const Row = ({ icon, label, className = "", onClick }: { 
    icon: React.ReactNode; 
    label: string; 
    className?: string;
    onClick?: () => void;
  }) => (
    <div className={`flex items-center ${className}`}>
      <div className="w-[44px] h-[44px] flex items-center justify-center text-primary-blue">
        {onClick ? (
          <button onClick={onClick} className="w-full h-full flex items-center justify-center hover:scale-110 transition-transform">
            {icon}
          </button>
        ) : (
          icon
        )}
      </div>
      <div className="ml-[28px] text-[32px] tracking-[0.02em] text-navy-ink">{label}</div>
    </div>
  );

  // Icon components with blue fill using design system colors
  const PhoneIcon = () => (
    <svg width="44" height="44" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24c1.11.37 2.31.57 3.56.57a1 1 0 011 1V21a1 1 0 01-1 1C10.3 22 2 13.7 2 3a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.56a1 1 0 01-.24 1.01l-2.2 2.22z"/>
    </svg>
  );

  const MailIcon = () => (
    <svg width="44" height="44" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M2 5h20v14H2z" />
      <path fill="#fff" d="M3 7l9 6 9-6v2l-9 6-9-6V7z" opacity="0.2" />
    </svg>
  );

  const HomeIcon = () => (
    <svg width="44" height="44" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M12 3l9 8h-3v10H6V11H3l9-8zM10 13h4v6h-4v-6z"/>
    </svg>
  );

  const LaptopIcon = () => (
    <svg width="44" height="44" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M4 5h16v10H4z"/>
      <path fill="currentColor" d="M2 17h20v2H2z" />
    </svg>
  );

  const ChatIcon = () => (
    <svg width="44" height="44" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M4 5h16v10H7l-3 3V5z"/>
      <rect x="7" y="8" width="7" height="1.8" fill="#fff" opacity="0.5" />
      <rect x="7" y="11" width="9" height="1.8" fill="#fff" opacity="0.5" />
    </svg>
  );

  const ChevronDoubleDown = () => (
    <svg width="44" height="44" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="currentColor" d="M12 13l-6-6 2-2 4 4 4-4 2 2-6 6z"/>
      <path fill="currentColor" d="M12 21l-6-6 2-2 4 4 4-4 2 2-6 6z"/>
    </svg>
  );

  return (
    <>
      {/* Business Card Layout - 1050x600 scaled for mobile */}
      <div className="w-full max-w-[525px] h-[300px] bg-white relative overflow-hidden mx-auto">
        
        {/* Top-left brand mark */}
        <div className="absolute top-[9px] left-[9px]">
          <svg width="25" height="25" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#16B3C6" />
                <stop offset="100%" stopColor="#0685D9" />
              </linearGradient>
            </defs>
            <path d="M12 12c0-3.314 2.686-6 6-6s6 2.686 6 6v16l16-16c2.343-2.343 6.142-2.343 8.485 0s2.343 6.142 0 8.485L32.485 36.485 44 48c2.343 2.343 2.343 6.142 0 8.485S37.858 58.828 35.515 56.485L20 41v11c0 3.314-2.686 6-6 6s-6-2.686-6-6V12z" fill="url(#g1)"/>
          </svg>
        </div>

        {/* Bottom-right brand mark */}
        <div className="absolute bottom-[9px] right-[9px]">
          <svg width="25" height="25" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#16B3C6" />
                <stop offset="100%" stopColor="#0685D9" />
              </linearGradient>
            </defs>
            <path d="M12 12c0-3.314 2.686-6 6-6s6 2.686 6 6v16l16-16c2.343-2.343 6.142-2.343 8.485 0s2.343 6.142 0 8.485L32.485 36.485 44 48c2.343 2.343 2.343 6.142 0 8.485S37.858 58.828 35.515 56.485L20 41v11c0 3.314-2.686 6-6 6s-6-2.686-6-6V12z" fill="url(#g2)"/>
          </svg>
        </div>

        {/* Right blue ribbon */}
        <div className="absolute right-0 top-0 w-[165px] h-[185px] bg-primary-blue rounded-b-[80px]" />

        {/* Avatar circle inside ribbon */}
        <div className="absolute right-[12.5px] top-[17.5px] w-[140px] h-[140px] rounded-full flex items-center justify-center">
          <Avatar className="w-[140px] h-[140px] border-2 border-medium-gray">
            <AvatarImage src={contact.profile_picture_url || undefined} alt={contact.name} />
            <AvatarFallback className="bg-medium-gray text-very-light-gray text-4xl font-bold">
              {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {/* Overlay label */}
          <div className="absolute bottom-[26%] left-1/2 -translate-x-1/2 text-[14px] font-extrabold text-navy-ink tracking-tight">
            (PROFILE PHOTO)
          </div>
        </div>

        {/* Top-right action icons */}
        <div className="absolute top-[11px] right-[39px]">
          <button 
            onClick={() => setIsShareDialogOpen(true)}
            className="hover:scale-110 transition-transform"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary-blue">
              <path d="M3 11l17-7-7 17-2.5-6.5L3 11z" fill="currentColor"/>
            </svg>
          </button>
        </div>
        <div className="absolute top-[11px] right-[11px]">
          <button 
            onClick={handleExportVCF}
            className="hover:scale-110 transition-transform"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary-blue">
              <path d="M12 3v10m0 0l4-4m-4 4l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 19h14v2H5z" fill="currentColor"/>
            </svg>
          </button>
        </div>

        {/* Right text block */}
        <div className="absolute left-[260px] right-0 top-[170px] text-center">
          <div className="text-[28px] font-extrabold text-navy-ink leading-none">
            {contact.name}
          </div>
          <div className="mt-[10px] text-[16px] font-normal text-navy-ink tracking-wide">
            {contact.company || ""}
          </div>
          <div className="mt-[32px] text-[20px] font-extrabold text-navy-ink">
            (LOGO)
          </div>
        </div>

        {/* Left column */}
        <div className="absolute left-[12px] top-[44px] w-[215px]">
          {/* Phone Row */}
          {contact.phone && (
            <Row
              icon={<PhoneIcon />}
              label={contact.phone}
              onClick={() => window.open(`tel:${contact.phone}`, '_self')}
            />
          )}
          
          {/* Email Row */}
          {contact.email && (
            <Row
              className={contact.phone ? "mt-[16px]" : ""}
              icon={<MailIcon />}
              label={contact.email}
              onClick={() => window.open(`mailto:${contact.email}`, '_self')}
            />
          )}
          
          {/* Industry Row */}
          {contact.industry && (
            <Row
              className="mt-[16px]"
              icon={<HomeIcon />}
              label={contact.industry}
            />
          )}
          
          {/* Website Row */}
          {contact.websites && contact.websites.length > 0 && (
            <Row
              className="mt-[16px]"
              icon={<LaptopIcon />}
              label={contact.websites[0]}
              onClick={() => window.open(contact.websites![0].startsWith('http') ? contact.websites![0] : `https://${contact.websites![0]}`, '_blank')}
            />
          )}
          
          {/* Message Row */}
          <Row
            className="mt-[16px]"
            icon={<ChatIcon />}
            label="[MESSAGE]"
            onClick={handleStartConversation}
          />
          
          {/* More Details Row */}
          <Row
            className="mt-[16px]"
            icon={<ChevronDoubleDown />}
            label="[OPEN MORE DETAILS]"
            onClick={() => setIsMoreDetailsOpen(!isMoreDetailsOpen)}
          />
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
      </div>

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