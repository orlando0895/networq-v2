import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserContactCard } from '@/hooks/useUserContactCard';
import { QrCode, Download, Share2, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const QRCodeShare = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const { contactCard } = useUserContactCard();
  const { toast } = useToast();

  useEffect(() => {
    if (contactCard?.share_code) {
      // Generate QR code containing a URL to view the contact card
      const contactUrl = `${window.location.origin}/contact/${contactCard.share_code}`;
      QRCode.toDataURL(contactUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error('Error generating QR code:', err));
    }
  }, [contactCard?.share_code]);

  const handleCopyShareCode = async () => {
    if (contactCard?.share_code) {
      try {
        await navigator.clipboard.writeText(contactCard.share_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: "Share Code Copied! 📋",
          description: "Your contact share code has been copied to clipboard."
        });
      } catch (err) {
        console.error('Failed to copy share code:', err);
      }
    }
  };

  const handleDownloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.download = `${contactCard?.name || 'contact'}-qr-code.png`;
      link.href = qrCodeUrl;
      link.click();
      toast({
        title: "QR Code Downloaded! 📱",
        description: "Your QR code has been saved to your downloads."
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share && contactCard?.share_code) {
      const contactUrl = `${window.location.origin}/contact/${contactCard.share_code}`;
      try {
        await navigator.share({
          title: `Connect with ${contactCard.name}`,
          text: `View my digital business card`,
          url: contactUrl
        });
      } catch (err) {
        // Fallback to copy if sharing is not supported
        handleCopyShareLink();
      }
    } else {
      handleCopyShareLink();
    }
  };

  const handleCopyShareLink = async () => {
    if (contactCard?.share_code) {
      const contactUrl = `${window.location.origin}/contact/${contactCard.share_code}`;
      try {
        await navigator.clipboard.writeText(contactUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: "Share Link Copied! 🔗",
          description: "Your contact card link has been copied to clipboard."
        });
      } catch (err) {
        console.error('Failed to copy share link:', err);
      }
    }
  };

  if (!contactCard) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <QrCode className="w-5 h-5" />
            Quick Share
          </CardTitle>
          <CardDescription>
            Create your contact card to generate a QR code
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <QrCode className="w-5 h-5" />
          Quick Share
        </CardTitle>
        <CardDescription>
          Share your digital business card - no app required
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {qrCodeUrl && (
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-lg shadow-sm border">
              <img 
                src={qrCodeUrl} 
                alt="Contact QR Code" 
                className="w-56 h-56"
              />
            </div>
          </div>
        )}
        
        <div className="text-center space-y-2">
          <div className="text-sm text-muted-foreground">Share Code</div>
          <div className="font-mono text-lg font-semibold tracking-wider">
            {contactCard.share_code}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <Button
            onClick={handleCopyShareLink}
            variant="outline"
            className="w-full"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Share Link
              </>
            )}
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleDownloadQR}
              variant="outline"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            
            <Button
              onClick={handleShare}
              variant="outline"
              size="sm"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>

          <Button
            onClick={handleCopyShareCode}
            variant="ghost"
            size="sm"
            className="w-full text-xs"
          >
            Copy Share Code: {contactCard.share_code}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Anyone can scan this QR code to view your digital business card and save it to their contacts
        </div>
      </CardContent>
    </Card>
  );
};