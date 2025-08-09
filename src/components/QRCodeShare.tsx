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
      // Generate QR code pointing to public profile
      const publicUrl = contactCard.username 
        ? `${window.location.origin}/public/${contactCard.username}`
        : `${window.location.origin}/public/${contactCard.share_code}`;
        
      console.log('🔄 Generating QR code with share code:', contactCard.share_code);
      console.log('🔗 QR code URL:', publicUrl);
        
      QRCode.toDataURL(publicUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
        .then((url) => {
          setQrCodeUrl(url);
          console.log('✅ QR code generated successfully');
        })
        .catch((err) => console.error('❌ Error generating QR code:', err));
    }
  }, [contactCard?.share_code, contactCard?.username]);

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
      const publicUrl = contactCard.username 
        ? `${window.location.origin}/public/${contactCard.username}`
        : `${window.location.origin}/public/${contactCard.share_code}`;
      
      try {
        await navigator.share({
          title: `Connect with ${contactCard.name}`,
          text: `Check out my digital business card and save my contact info!`,
          url: publicUrl
        });
      } catch (err) {
        // Fallback to copy if sharing is not supported
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    if (contactCard) {
      const publicUrl = contactCard.username 
        ? `${window.location.origin}/public/${contactCard.username}`
        : `${window.location.origin}/public/${contactCard.share_code}`;
      
      try {
        await navigator.clipboard.writeText(publicUrl);
        toast({
          title: "Link Copied! 🔗",
          description: "Your public profile link has been copied to clipboard."
        });
      } catch (err) {
        console.error('Failed to copy link:', err);
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
          Scan to view your public digital business card - no app required!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {qrCodeUrl && (
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-lg shadow-sm border">
              <img 
                src={qrCodeUrl} 
                alt="Contact QR Code" 
                className="w-48 h-48"
              />
            </div>
          </div>
        )}
        
        <div className="text-center space-y-3">
          <div>
            <div className="text-sm text-muted-foreground">Share Code</div>
            <div className="font-mono text-lg font-semibold tracking-wider">
              {contactCard.share_code}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground">Public URL</div>
            <div className="text-xs font-mono bg-muted p-2 rounded">
              {contactCard.username 
                ? `${window.location.host}/public/${contactCard.username}`
                : `${window.location.host}/public/${contactCard.share_code}`
              }
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <Button
            onClick={handleCopyLink}
            variant="default"
            className="w-full"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Public Link
          </Button>
          
          <Button
            onClick={handleCopyShareCode}
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
                Copy Share Code
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
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Anyone can scan this QR code to view your digital business card and download your contact info - no app required!
        </div>
      </CardContent>
    </Card>
  );
};