
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus, UserPlus, Camera, QrCode, Share } from "lucide-react";
import BusinessCardScanner from '@/components/BusinessCardScanner';
import { useUserContactCard } from '@/hooks/useUserContactCard';
import { useToast } from '@/hooks/use-toast';
import QrScanner from 'qr-scanner';
import { supabase } from '@/integrations/supabase/client';
import { parseAndAddFromScan } from '@/lib/scan';
interface NewContact {
  name: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  services: string[];
  tier: "A-player" | "Acquaintance";
  notes: string;
  linkedin: string;
  facebook: string;
  whatsapp: string;
  websites: string[];
  added_via?: string;
  shareCode?: string;
}

interface ContactFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddContact: (contact: NewContact) => Promise<any>;
}

const ContactForm = ({ isOpen, onOpenChange, onAddContact }: ContactFormProps) => {
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    industry: "",
    services: "",
    tier: "Acquaintance" as "A-player" | "Acquaintance",
    notes: "",
    linkedin: "",
    facebook: "",
    whatsapp: "",
    websites: "",
    added_via: "manual"
  });
  const [activeView, setActiveView] = useState<'form' | 'scanner' | 'share-code' | 'qr-scanner'>('form');
  const [shareCode, setShareCode] = useState('');
  const [foundCard, setFoundCard] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  
  const { fetchContactCardByShareCode } = useUserContactCard();
  const { toast } = useToast();

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.email) {
      return;
    }

    const contactData: NewContact = {
      ...newContact,
      services: newContact.services.split(",").map(s => s.trim().toLowerCase()).filter(s => s),
      websites: newContact.websites.split(",").map(w => w.trim()).filter(w => w)
    };

    const result = await onAddContact(contactData);

    if (result?.success) {
      setNewContact({
        name: "",
        email: "",
        phone: "",
        company: "",
        industry: "",
        services: "",
        tier: "Acquaintance",
        notes: "",
        linkedin: "",
        facebook: "",
        whatsapp: "",
        websites: "",
        added_via: "manual"
      });
      onOpenChange(false);
    }
  };

  const handleBusinessCardExtracted = (contactInfo: any) => {
    setNewContact({
      name: contactInfo.name || '',
      email: contactInfo.email || '',
      phone: contactInfo.phone || '',
      company: contactInfo.company || '',
      industry: contactInfo.industry || '',
      services: Array.isArray(contactInfo.services) ? contactInfo.services.join(', ') : contactInfo.services || '',
      tier: "Acquaintance",
      notes: contactInfo.notes || '',
      linkedin: contactInfo.linkedin || '',
      facebook: contactInfo.facebook || '',
      whatsapp: contactInfo.whatsapp || '',
      websites: Array.isArray(contactInfo.websites) ? contactInfo.websites.join(', ') : contactInfo.websites || '',
      added_via: 'business_card'
    });
    setActiveView('form');
  };

  const searchByCode = async (code?: string) => {
    const codeToSearch = code || shareCode.trim();
    if (!codeToSearch) return;
    
    setIsSearching(true);
    const result = await fetchContactCardByShareCode(codeToSearch);
    
    if (result.success && result.data) {
      setFoundCard(result.data);
      if (code) {
        setShareCode(code);
        stopScanning();
      }
    } else {
      setFoundCard(null);
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

  const addByShareCodeAuto = async (code: string) => {
    const codeLower = (code || '').trim().toLowerCase();
    if (!codeLower) return;
    setIsSearching(true);
    try {
      const result = await fetchContactCardByShareCode(codeLower);
      if (result.success && result.data) {
        const card = result.data;
        const addResult = await onAddContact({
          name: card.name,
          email: card.email,
          phone: card.phone || '',
          company: card.company || '',
          industry: card.industry || '',
          services: card.services || [],
          tier: 'Acquaintance',
          notes: 'Added via QR code',
          linkedin: card.linkedin || '',
          facebook: card.facebook || '',
          whatsapp: card.whatsapp || '',
          websites: card.websites || [],
          added_via: 'qr_code',
          shareCode: codeLower,
        });
        if (addResult?.success) {
          setShareCode('');
          setFoundCard(null);
          setActiveView('form');
          onOpenChange(false);
        }
      } else {
        toast({
          title: 'Contact Not Found',
          description: 'No contact found for this share code.',
          variant: 'destructive',
        });
      }
    } catch (e) {
      console.error('Error auto-adding by share code:', e);
      toast({ title: 'Error', description: 'Failed to add contact. Please try again.', variant: 'destructive' });
    } finally {
      setIsSearching(false);
    }
  };

  const addFoundContact = async () => {
    if (!foundCard) return;
    
    const contactData: any = {
      name: foundCard.name,
      email: foundCard.email,
      phone: foundCard.phone || "",
      company: foundCard.company || "",
      industry: foundCard.industry || "",
      services: foundCard.services || [],
      tier: "Acquaintance",
      notes: foundCard.notes || "",
      linkedin: foundCard.linkedin || "",
      facebook: foundCard.facebook || "",
      whatsapp: foundCard.whatsapp || "",
      websites: foundCard.websites || [],
      added_via: 'share_code',
      shareCode: (shareCode || '').trim().toLowerCase(),
    };

    const result = await onAddContact(contactData);
    if (result?.success) {
      setShareCode('');
      setFoundCard(null);
      setActiveView('form');
      onOpenChange(false);
    }
  };

  const addContactByUsername = async (username: string) => {
    const clean = (username || '').trim().toLowerCase();
    if (!clean) return;
    setIsSearching(true);
    try {
      const { data: cardData, error } = await supabase
        .from('user_contact_cards')
        .select('*')
        .eq('username', clean)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (cardData) {
        const addResult = await onAddContact({
          name: cardData.name,
          email: cardData.email,
          phone: cardData.phone || "",
          company: cardData.company || "",
          industry: cardData.industry || "",
          services: cardData.services || [],
          tier: "Acquaintance",
          notes: "Added via QR code",
          linkedin: cardData.linkedin || "",
          facebook: cardData.facebook || "",
          whatsapp: cardData.whatsapp || "",
          websites: cardData.websites || [],
          added_via: 'qr_code',
          shareCode: (cardData as any).share_code,
        });

        if (addResult?.success) {
          setShareCode('');
          setFoundCard(null);
          setActiveView('form');
          onOpenChange(false);
        }
      } else {
        toast({
          title: "Contact Not Found",
          description: `No contact found for username "${clean}".`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error adding contact for username:', username, error);
      toast({
        title: "Error",
        description: `Failed to add contact for username "${clean}". Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const startScanning = async () => {
    try {
      setCameraError('');
      setIsScanning(true);

      // Wait for the video element to be rendered
      await new Promise(resolve => setTimeout(resolve, 100));

      if (!videoRef.current) {
        console.error('Video element not available after rendering');
        setIsScanning(false);
        return;
      }

      if (qrScannerRef.current) {
        await qrScannerRef.current.start();
        return;
      }

      qrScannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          try {
            const text = (result.data || '').trim();
            // Stop scanning to prevent duplicate handling
            stopScanning();

            parseAndAddFromScan(text, {
              addByCode: (code) => addByShareCodeAuto(code),
              addByUsername: (username) => addContactByUsername(username),
              onInvalid: (scanned) => {
                toast({
                  title: 'QR Code Not Recognized',
                  description: `Scanned: "${(scanned || '').substring(0, 40)}${(scanned || '').length > 40 ? '...' : ''}". Please scan a Networq contact QR code.`,
                  variant: 'destructive',
                });
                setTimeout(() => {
                  if (!isScanning) startScanning();
                }, 1500);
              }
            });
          } catch (e) {
            console.error('[QR Scanner] Error processing scan result:', e);
            toast({
              title: 'Scanner Error',
              description: 'Failed to process QR code. Please try again.',
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

  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }
    };
  }, []);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 h-12 px-6 text-base font-medium">
          <Plus className="w-5 h-5 sm:mr-2" />
          <span className="hidden sm:inline">Add Contact</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-6">
          <SheetTitle className="flex items-center gap-2 text-xl font-semibold">
            <UserPlus className="w-6 h-6" />
            Add New Contact
          </SheetTitle>
          
          {activeView === 'form' && (
            <div className="grid grid-cols-3 gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setActiveView('scanner')}
                className="flex items-center gap-1 h-10 text-sm"
              >
                <Camera className="w-3 h-3" />
                Scan Card
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveView('share-code')}
                className="flex items-center gap-1 h-10 text-sm"
              >
                <Share className="w-3 h-3" />
                Share Code
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveView('qr-scanner')}
                className="flex items-center gap-1 h-10 text-sm"
              >
                <QrCode className="w-3 h-3" />
                Scan QR
              </Button>
            </div>
          )}
          
          {activeView !== 'form' && (
            <Button
              variant="ghost"
              onClick={() => {
                setActiveView('form');
                stopScanning();
                setFoundCard(null);
                setShareCode('');
              }}
              className="mt-4"
            >
              ← Back to Form
            </Button>
          )}
        </SheetHeader>
        {activeView === 'form' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="name" className="text-base font-medium">Name *</Label>
                <Input
                  id="name"
                  value={newContact.name}
                  onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                  placeholder="John Doe"
                  className="mt-2 h-12 text-base"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-base font-medium">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                  placeholder="john@company.com"
                  className="mt-2 h-12 text-base"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="phone" className="text-base font-medium">Phone</Label>
                <Input
                  id="phone"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                  placeholder="(555) 123-4567"
                  className="mt-2 h-12 text-base"
                />
              </div>
              <div>
                <Label htmlFor="company" className="text-base font-medium">Company</Label>
                <Input
                  id="company"
                  value={newContact.company}
                  onChange={(e) => setNewContact({...newContact, company: e.target.value})}
                  placeholder="Company Name"
                  className="mt-2 h-12 text-base"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="industry" className="text-base font-medium">Industry</Label>
              <Input
                id="industry"
                value={newContact.industry}
                onChange={(e) => setNewContact({...newContact, industry: e.target.value})}
                placeholder="e.g., Marketing & Design"
                className="mt-2 h-12 text-base"
              />
            </div>

            <div>
              <Label htmlFor="services" className="text-base font-medium">Services (comma-separated)</Label>
              <Input
                id="services"
                value={newContact.services}
                onChange={(e) => setNewContact({...newContact, services: e.target.value})}
                placeholder="web design, logo design, branding"
                className="mt-2 h-12 text-base"
              />
            </div>

            <div>
              <Label htmlFor="tier" className="text-base font-medium">Referral Tier</Label>
              <Select value={newContact.tier} onValueChange={(value: "A-player" | "Acquaintance") => setNewContact({...newContact, tier: value})}>
                <SelectTrigger className="mt-2 h-12 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A-player">A-player (Highly Recommended)</SelectItem>
                  <SelectItem value="Acquaintance">Acquaintance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Social Media Section */}
            <div className="space-y-4 pt-2 border-t border-slate-200">
              <h3 className="text-base font-medium text-slate-900">Social Media & Online Presence</h3>
              
              <div>
                <Label htmlFor="linkedin" className="text-base font-medium">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={newContact.linkedin}
                  onChange={(e) => setNewContact({...newContact, linkedin: e.target.value})}
                  placeholder="linkedin.com/in/johndoe or johndoe"
                  className="mt-2 h-12 text-base"
                />
              </div>

              <div>
                <Label htmlFor="facebook" className="text-base font-medium">Facebook</Label>
                <Input
                  id="facebook"
                  value={newContact.facebook}
                  onChange={(e) => setNewContact({...newContact, facebook: e.target.value})}
                  placeholder="facebook.com/johndoe or johndoe"
                  className="mt-2 h-12 text-base"
                />
              </div>

              <div>
                <Label htmlFor="whatsapp" className="text-base font-medium">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={newContact.whatsapp}
                  onChange={(e) => setNewContact({...newContact, whatsapp: e.target.value})}
                  placeholder="+1234567890 or wa.me/1234567890"
                  className="mt-2 h-12 text-base"
                />
              </div>

              <div>
                <Label htmlFor="websites" className="text-base font-medium">Websites (comma-separated)</Label>
                <Input
                  id="websites"
                  value={newContact.websites}
                  onChange={(e) => setNewContact({...newContact, websites: e.target.value})}
                  placeholder="company.com, portfolio.com"
                  className="mt-2 h-12 text-base"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-base font-medium">Notes</Label>
              <Textarea
                id="notes"
                value={newContact.notes}
                onChange={(e) => setNewContact({...newContact, notes: e.target.value})}
                placeholder="How you met, their specialties, quality of work..."
                rows={4}
                className="mt-2 text-base"
              />
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button onClick={handleAddContact} className="w-full h-12 text-base font-medium">
                Add Contact
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full h-12 text-base">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {activeView === 'share-code' && (
          <div className="space-y-6">
            <div>
              <Label htmlFor="shareCodeInput">Share Code</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="shareCodeInput"
                  value={shareCode}
                  onChange={(e) => setShareCode(e.target.value)}
                  placeholder="Enter 8-character share code"
                  maxLength={8}
                  className="h-12"
                  onKeyPress={(e) => e.key === 'Enter' && searchByCode()}
                />
                <Button onClick={() => searchByCode()} disabled={isSearching || !shareCode.trim()}>
                  {isSearching ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </div>

            {foundCard && (
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{foundCard.name}</h3>
                    <p className="text-slate-600">{foundCard.email}</p>
                  </div>
                  <Button onClick={addFoundContact}>
                    Add Contact
                  </Button>
                </div>
                {foundCard.company && (
                  <p className="text-sm text-slate-600">
                    <strong>Company:</strong> {foundCard.company}
                  </p>
                )}
                {foundCard.phone && (
                  <p className="text-sm text-slate-600">
                    <strong>Phone:</strong> {foundCard.phone}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {activeView === 'qr-scanner' && (
          <div className="space-y-6">
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

            {foundCard && (
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{foundCard.name}</h3>
                    <p className="text-slate-600">{foundCard.email}</p>
                  </div>
                  <Button onClick={addFoundContact}>
                    Add Contact
                  </Button>
                </div>
                {foundCard.company && (
                  <p className="text-sm text-slate-600">
                    <strong>Company:</strong> {foundCard.company}
                  </p>
                )}
                {foundCard.phone && (
                  <p className="text-sm text-slate-600">
                    <strong>Phone:</strong> {foundCard.phone}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </SheetContent>

      <BusinessCardScanner
        isOpen={activeView === 'scanner'}
        onOpenChange={(open) => !open && setActiveView('form')}
        onContactExtracted={handleBusinessCardExtracted}
      />
    </Sheet>
  );
};

export default ContactForm;
