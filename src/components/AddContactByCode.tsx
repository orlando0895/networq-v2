
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, ExternalLink, QrCode, Camera, CameraOff } from 'lucide-react';
import { useUserContactCard } from '@/hooks/useUserContactCard';
import { useContacts } from '@/hooks/useContacts';
import { useToast } from '@/hooks/use-toast';
import QrScanner from 'qr-scanner';
import type { Database } from '@/integrations/supabase/types';

type UserContactCard = Database['public']['Tables']['user_contact_cards']['Row'];

const AddContactByCode = () => {
  const [shareCode, setShareCode] = useState('');
  const [foundCard, setFoundCard] = useState<UserContactCard | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  
  const { fetchContactCardByShareCode } = useUserContactCard();
  const { addContact } = useContacts();
  const { toast } = useToast();

  const searchByCode = async (code?: string) => {
    const codeToSearch = code || shareCode.trim();
    if (!codeToSearch) return;
    
    console.log('Searching for contact with code:', codeToSearch);
    setIsSearching(true);
    const result = await fetchContactCardByShareCode(codeToSearch);
    console.log('Search result:', result);
    
    if (result.success && result.data) {
      setFoundCard(result.data);
      console.log('Found contact card:', result.data);
      if (code) {
        // If code came from QR scanner, update the input field
        setShareCode(code);
        // Stop scanning after successful QR code detection
        stopScanning();
      }
    } else {
      setFoundCard(null);
      console.log('No contact found for code:', codeToSearch);
      if (code) {
        toast({
          title: "QR Code Invalid",
          description: "No contact found for this QR code.",
          variant: "destructive"
        });
      }
    }
    setIsSearching(false);
  };

  const addFoundContact = async () => {
    if (!foundCard) return;
    
    setIsAdding(true);
    const result = await addContact({
      name: foundCard.name,
      email: foundCard.email,
      phone: foundCard.phone || undefined,
      company: foundCard.company || undefined,
      industry: foundCard.industry || undefined,
      services: foundCard.services || [],
      tier: 'Acquaintance', // Default tier for shared contacts
      notes: foundCard.notes || undefined,
      linkedin: foundCard.linkedin || undefined,
      facebook: foundCard.facebook || undefined,
      whatsapp: foundCard.whatsapp || undefined,
      websites: foundCard.websites || [],
      user_id: foundCard.user_id, // Pass the user_id for mutual contact addition
      added_via: 'share_code' // Track how this contact was added
    });

    if (result.success) {
      setShareCode('');
      setFoundCard(null);
    }
    setIsAdding(false);
  };

  const startScanning = async () => {
    if (!videoRef.current) return;

    try {
      setCameraError('');
      setIsScanning(true);

      // Check if QR scanner already exists
      if (qrScannerRef.current) {
        await qrScannerRef.current.start();
        return;
      }

      // Create new QR scanner
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR code scanned:', result.data);
          // Extract share code from URL or use the result directly
          let shareCode = result.data;
          
          // If it's a URL containing our contact path, extract the share code
          if (shareCode.includes('/contact/')) {
            console.log('Found contact URL, extracting share code...');
            const match = shareCode.match(/\/contact\/([a-f0-9]{8})/);
            if (match) {
              shareCode = match[1];
              console.log('Extracted share code:', shareCode);
            }
          }
          
          console.log('Searching for contact with share code:', shareCode);
          // Search for the contact
          searchByCode(shareCode);
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment', // Use back camera on mobile
        }
      );

      await qrScannerRef.current.start();
    } catch (error: any) {
      console.error('Camera error:', error);
      setCameraError(error.message || 'Failed to access camera');
      setIsScanning(false);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopScanning = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
    }
    setIsScanning(false);
    setCameraError('');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  const formatUrl = (url: string) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  const formatSocialLink = (platform: string, value: string) => {
    if (value.startsWith('http')) return value;
    
    switch (platform) {
      case 'linkedin':
        return value.startsWith('@') || value.includes('linkedin.com') 
          ? value 
          : `https://linkedin.com/in/${value}`;
      case 'facebook':
        return value.startsWith('@') || value.includes('facebook.com') 
          ? value 
          : `https://facebook.com/${value}`;
      default:
        return value;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add Contact
          </CardTitle>
          <CardDescription>
            Enter a share code or scan a QR code to add someone's contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="code" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="code">Share Code</TabsTrigger>
              <TabsTrigger value="qr">Scan QR Code</TabsTrigger>
            </TabsList>
            
            <TabsContent value="code" className="space-y-4 mt-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="shareCode">Share Code</Label>
                  <Input
                    id="shareCode"
                    value={shareCode}
                    onChange={(e) => setShareCode(e.target.value)}
                    placeholder="Enter 8-character share code"
                    maxLength={8}
                    onKeyPress={(e) => e.key === 'Enter' && searchByCode()}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={() => searchByCode()} disabled={isSearching || !shareCode.trim()}>
                    {isSearching ? 'Searching...' : 'Search'}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="qr" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>QR Code Scanner</Label>
                  <div className="flex gap-2">
                    {!isScanning ? (
                      <Button onClick={startScanning} variant="outline" size="sm">
                        <Camera className="w-4 h-4 mr-2" />
                        Start Camera
                      </Button>
                    ) : (
                      <Button onClick={stopScanning} variant="outline" size="sm">
                        <CameraOff className="w-4 h-4 mr-2" />
                        Stop Camera
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="relative w-full aspect-square max-w-sm mx-auto border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                  {isScanning ? (
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-50">
                      <div className="text-center text-gray-500">
                        <QrCode className="w-12 h-12 mx-auto mb-2" />
                        <p className="text-sm">Camera preview will appear here</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {cameraError && (
                  <div className="text-sm text-red-600 text-center bg-red-50 p-2 rounded">
                    {cameraError}
                  </div>
                )}
                
                <div className="text-xs text-center text-gray-500">
                  Point your camera at a QR code to scan it automatically
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {foundCard && (
            <div className="mt-6">
              <Separator className="mb-4" />
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{foundCard.name}</h3>
                    <p className="text-slate-600">{foundCard.email}</p>
                  </div>
                  <Button onClick={addFoundContact} disabled={isAdding}>
                    {isAdding ? 'Adding...' : 'Add Contact'}
                  </Button>
                </div>

                {(foundCard.company || foundCard.industry) && (
                  <div className="flex flex-wrap gap-2">
                    {foundCard.company && (
                      <Badge variant="outline">{foundCard.company}</Badge>
                    )}
                    {foundCard.industry && (
                      <Badge variant="outline">{foundCard.industry}</Badge>
                    )}
                  </div>
                )}

                {foundCard.phone && (
                  <p className="text-sm text-slate-600">
                    <strong>Phone:</strong> {foundCard.phone}
                  </p>
                )}

                {foundCard.services && foundCard.services.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">Services:</p>
                    <div className="flex flex-wrap gap-1">
                      {foundCard.services.map((service, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {(foundCard.linkedin || foundCard.facebook || foundCard.whatsapp) && (
                  <div className="flex flex-wrap gap-2">
                    {foundCard.linkedin && (
                      <a
                        href={formatSocialLink('linkedin', foundCard.linkedin)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        LinkedIn <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {foundCard.facebook && (
                      <a
                        href={formatSocialLink('facebook', foundCard.facebook)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        Facebook <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {foundCard.whatsapp && (
                      <span className="text-sm text-slate-600">
                        WhatsApp: {foundCard.whatsapp}
                      </span>
                    )}
                  </div>
                )}

                {foundCard.websites && foundCard.websites.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">Websites:</p>
                    <div className="flex flex-wrap gap-2">
                      {foundCard.websites.map((website, index) => (
                        <a
                          key={index}
                          href={formatUrl(website)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          {website} <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {foundCard.notes && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-1">Notes:</p>
                    <p className="text-sm text-slate-600">{foundCard.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AddContactByCode;
