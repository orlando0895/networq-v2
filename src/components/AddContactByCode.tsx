
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  
  const { addContact } = useContacts();
  const { fetchContactCardByShareCode } = useUserContactCard();
  const { toast, dismiss } = useToast();
  const navigate = useNavigate();
  const addContactByCode = async (code?: string) => {
    const raw = (code || shareCode.trim());
    const codeToAdd = raw.toLowerCase();
    if (!codeToAdd) return;

    // Validate format early
    const isValidCode = /^[a-f0-9]{8}$/i.test(codeToAdd);
    if (!isValidCode) {
      console.warn('[AddContactByCode] Invalid share code format:', raw);
      // Clear any existing toasts and show a clearer message
      dismiss();
      toast({
        title: 'Invalid Share Code Format',
        description: `Scanned/entered: "${raw}". Expected an 8-character hexadecimal code.`,
        variant: 'destructive',
      });
      return;
    }
    
    setIsAdding(true);
    
    try {
      console.debug('[AddContactByCode] Looking up share code:', codeToAdd);
      // First, fetch the contact card data using the share code
      const result = await fetchContactCardByShareCode(codeToAdd);
      
      if (result.success && result.data) {
        const cardData = result.data;
        
        // Add the contact with the share code for mutual connection
        const addResult = await addContact({
          name: cardData.name,
          email: cardData.email,
          phone: cardData.phone || undefined,
          company: cardData.company || undefined,
          industry: cardData.industry || undefined,
          services: cardData.services || [],
          tier: 'A-player',
          notes: 'Added via share code',
          linkedin: cardData.linkedin || undefined,
          facebook: cardData.facebook || undefined,
          whatsapp: cardData.whatsapp || undefined,
          websites: cardData.websites || [],
          profile_picture_url: cardData.avatar_url || undefined,
          company_logo_url: cardData.company_logo_url || undefined,
          added_via: 'share_code',
          shareCode: codeToAdd // Pass the share code for mutual connection
        });
        
        if (addResult?.success) {
          setShareCode('');
          setFoundCard(null);
        }
      } else {
        // Suppress any previous toast and show a clearer one with the scanned code
        dismiss();
        toast({
          title: 'Contact Not Found',
          description: `No contact found for share code "${codeToAdd}". Ask them to open the app and regenerate a new code.`,
          variant: 'destructive',
        });
        // If the scanner was used previously, allow quick retry
        if (qrScannerRef.current) {
          setTimeout(() => {
            if (!isScanning) startScanning();
          }, 800);
        }
      }
    } catch (error) {
      console.error('[AddContactByCode] Error adding contact for code:', codeToAdd, error);
      dismiss();
      toast({
        title: 'Error',
        description: `Failed to add contact for code "${codeToAdd}". Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
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

      // Create new QR scanner with optimized settings
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          try {
            const text = (result.data || '').trim();
            console.info('[QR Scanner] Raw scanned text:', text);
            console.info('[QR Scanner] Text length:', text.length);
            console.info('[QR Scanner] First 50 chars:', text.substring(0, 50));

            // Stop scanning to prevent duplicate handling
            stopScanning();

            // Enhanced URL pattern matching with more detailed logging
            console.info('[QR Scanner] Starting pattern matching...');

            // 1) Handle /contact/:shareCode pattern
            if (text.includes('/contact/')) {
              console.info('[QR Scanner] Found /contact/ pattern');
              const match = text.match(/\/contact\/([a-f0-9]{8})/i);
              if (match) {
                const code = match[1].toLowerCase();
                console.info('[QR Scanner] Extracted /contact/ code:', code);
                addContactByCode(code);
                return;
              }
              console.warn('[QR Scanner] /contact/ pattern found but no valid code extracted');
            }

            // 2) Handle /public/:identifier (username or share_code) 
            if (text.includes('/public/')) {
              console.info('[QR Scanner] Found /public/ pattern');
              const match = text.match(/\/public\/([^\/?#\s]+)/i);
              if (match) {
                const identifier = match[1].trim();
                console.info('[QR Scanner] Extracted /public/ identifier:', identifier);
                
                if (/^[a-f0-9]{8}$/i.test(identifier)) {
                  const code = identifier.toLowerCase();
                  console.info('[QR Scanner] Identified as share code:', code);
                  addContactByCode(code);
                } else {
                  console.info('[QR Scanner] Identified as username:', identifier);
                  navigate(`/public/${identifier}`);
                }
                return;
              }
              console.warn('[QR Scanner] /public/ pattern found but no identifier extracted');
            }

            // 3) Handle raw 8-char share code
            if (/^[a-f0-9]{8}$/i.test(text)) {
              const code = text.toLowerCase();
              console.info('[QR Scanner] Detected raw share code:', code);
              addContactByCode(code);
              return;
            }

            // 4) Handle URLs that might contain share codes or usernames
            if (text.includes('http')) {
              console.info('[QR Scanner] Found HTTP URL, attempting to extract identifier');
              const urlMatch = text.match(/https?:\/\/[^\/]+\/(?:public|contact)\/([^\/?#\s]+)/i);
              if (urlMatch) {
                const identifier = urlMatch[1].trim();
                if (/^[a-f0-9]{8}$/i.test(identifier)) {
                  const code = identifier.toLowerCase();
                  console.info('[QR Scanner] Extracted share code from URL:', code);
                  addContactByCode(code);
                  return;
                } else {
                  console.info('[QR Scanner] Extracted username from URL:', identifier);
                  navigate(`/public/${identifier}`);
                  return;
                }
              }
            }

            // 5) Last resort: look for any 8-character hex pattern in the text
            const hexPattern = text.match(/[a-f0-9]{8}/i);
            if (hexPattern) {
              const code = hexPattern[0].toLowerCase();
              console.info('[QR Scanner] Found potential share code pattern:', code);
              addContactByCode(code);
              return;
            }

            // 6) Unrecognized format - provide detailed feedback
            console.error('[QR Scanner] No recognizable pattern found in:', text);
            dismiss();
            toast({
              title: 'QR Code Not Recognized',
              description: `Scanned: "${text.substring(0, 40)}${text.length > 40 ? '...' : ''}". Please scan a Networq contact QR code.`,
              variant: 'destructive',
            });
            
            // Auto-retry scanning after delay
            setTimeout(() => {
              if (!isScanning) startScanning();
            }, 2000);
            
          } catch (e) {
            console.error('[QR Scanner] Error processing scan result:', e);
            dismiss();
            toast({
              title: 'Scanner Error',
              description: 'Failed to process QR code. Please try scanning again.',
              variant: 'destructive',
            });
            setTimeout(() => {
              if (!isScanning) startScanning();
            }, 1500);
          }
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
          preferredCamera: 'environment',
          maxScansPerSecond: 5,        // Limit scan frequency for stability
          returnDetailedScanResult: true,
          calculateScanRegion: (video) => {
            // Calculate optimal scan region (center 70% of video)
            const smallerDimension = Math.min(video.videoWidth, video.videoHeight);
            const regionSize = Math.round(0.7 * smallerDimension);
            return {
              x: Math.round((video.videoWidth - regionSize) / 2),
              y: Math.round((video.videoHeight - regionSize) / 2),
              width: regionSize,
              height: regionSize,
            };
          }
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
                    onKeyPress={(e) => e.key === 'Enter' && addContactByCode()}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={() => addContactByCode()} disabled={isAdding || !shareCode.trim()}>
                    {isAdding ? 'Adding...' : 'Add Contact'}
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
                
                <div className="text-xs text-center text-gray-500 space-y-1">
                  <p><strong>Scanning Tips:</strong></p>
                  <p>• Hold steady and keep QR code centered</p>
                  <p>• Ensure good lighting</p>
                  <p>• Keep 6-12 inches from screen</p>
                  <p>• Try different angles if not working</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddContactByCode;
