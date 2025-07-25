import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy, Mail, MessageSquare, Download, Share, MessageCircle, Linkedin } from "lucide-react";
import type { Database } from '@/integrations/supabase/types';
import { downloadVCF, type ContactData } from "@/lib/vcf";

type Contact = Database['public']['Tables']['contacts']['Row'];

interface ShareContactDialogProps {
  contact: Contact;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareContactDialog = ({ contact, isOpen, onClose }: ShareContactDialogProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();

  const formatContactForSharing = (): ContactData => ({
    name: contact.name,
    email: contact.email,
    phone: contact.phone || undefined,
    company: contact.company || undefined,
    industry: contact.industry || undefined,
    linkedin: contact.linkedin || undefined,
    facebook: contact.facebook || undefined,
    whatsapp: contact.whatsapp || undefined,
    websites: contact.websites || undefined,
    notes: contact.notes || undefined,
  });

  const getContactText = () => {
    const lines = [
      `📧 ${contact.name}`,
      `📧 ${contact.email}`,
    ];
    
    if (contact.phone) lines.push(`📞 ${contact.phone}`);
    if (contact.company) lines.push(`🏢 ${contact.company}`);
    if (contact.industry) lines.push(`💼 ${contact.industry}`);
    if (contact.linkedin) lines.push(`💼 LinkedIn: ${contact.linkedin}`);
    if (contact.whatsapp) lines.push(`💬 WhatsApp: ${contact.whatsapp}`);
    if (contact.websites?.length) {
      contact.websites.forEach(website => lines.push(`🌐 ${website}`));
    }

    return lines.join('\n');
  };

  const handleNativeShare = async () => {
    if (!navigator.share) {
      toast({
        title: "Sharing not supported",
        description: "Your browser doesn't support native sharing. Try copying to clipboard instead.",
        variant: "destructive"
      });
      return;
    }

    setIsSharing(true);
    try {
      await navigator.share({
        title: `Contact: ${contact.name}`,
        text: getContactText(),
      });
      
      toast({
        title: "Contact shared",
        description: `Successfully shared ${contact.name}'s contact information`,
      });
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        toast({
          title: "Sharing failed",
          description: "Failed to share contact. Please try another method.",
          variant: "destructive"
        });
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getContactText());
      toast({
        title: "Copied to clipboard",
        description: `${contact.name}'s contact information copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Contact: ${contact.name}`);
    const body = encodeURIComponent(`I'd like to share this contact with you:\n\n${getContactText()}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    
    toast({
      title: "Email opened",
      description: "Email app opened with contact information",
    });
  };

  const handleSMSShare = () => {
    const text = encodeURIComponent(`Contact: ${contact.name}\n\n${getContactText()}`);
    window.open(`sms:?body=${text}`, '_blank');
    
    toast({
      title: "SMS opened",
      description: "SMS app opened with contact information",
    });
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`Contact: ${contact.name}\n\n${getContactText()}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    
    toast({
      title: "WhatsApp opened",
      description: "WhatsApp opened with contact information",
    });
  };

  const handleLinkedInShare = () => {
    const text = encodeURIComponent(`I'd like to share this professional contact: ${contact.name} at ${contact.company || 'their company'}`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&title=${text}`, '_blank');
    
    toast({
      title: "LinkedIn opened",
      description: "LinkedIn opened for sharing",
    });
  };

  const handleDownloadVCF = () => {
    const contactData = formatContactForSharing();
    downloadVCF(contactData);
    
    toast({
      title: "Contact downloaded",
      description: `${contact.name}'s contact card downloaded as VCF file`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Contact: {contact.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-3 py-4">
          {/* Native Share (Mobile) */}
          {navigator.share && (
            <Button
              onClick={handleNativeShare}
              disabled={isSharing}
              className="w-full justify-start"
              variant="outline"
            >
              <Share className="w-4 h-4 mr-3" />
              Share via device
            </Button>
          )}

          {/* Copy to Clipboard */}
          <Button
            onClick={handleCopyToClipboard}
            className="w-full justify-start"
            variant="outline"
          >
            <Copy className="w-4 h-4 mr-3" />
            Copy to clipboard
          </Button>

          {/* Email */}
          <Button
            onClick={handleEmailShare}
            className="w-full justify-start"
            variant="outline"
          >
            <Mail className="w-4 h-4 mr-3" />
            Share via email
          </Button>

          {/* SMS */}
          <Button
            onClick={handleSMSShare}
            className="w-full justify-start"
            variant="outline"
          >
            <MessageSquare className="w-4 h-4 mr-3" />
            Share via SMS
          </Button>

          {/* WhatsApp */}
          <Button
            onClick={handleWhatsAppShare}
            className="w-full justify-start"
            variant="outline"
          >
            <MessageCircle className="w-4 h-4 mr-3" />
            Share via WhatsApp
          </Button>

          {/* LinkedIn */}
          <Button
            onClick={handleLinkedInShare}
            className="w-full justify-start"
            variant="outline"
          >
            <Linkedin className="w-4 h-4 mr-3" />
            Share via LinkedIn
          </Button>

          {/* Download VCF */}
          <Button
            onClick={handleDownloadVCF}
            className="w-full justify-start"
            variant="outline"
          >
            <Download className="w-4 h-4 mr-3" />
            Download contact card (.vcf)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};