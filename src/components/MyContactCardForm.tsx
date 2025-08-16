import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MobileInput } from '@/components/ui/mobile-input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Copy, RefreshCw, Share2, Trash2, Plus, Camera, Scan } from 'lucide-react';
import { useUserContactCard } from '@/hooks/useUserContactCard';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import BusinessCardScanner from '@/components/BusinessCardScanner';
import { ProfilePictureUpload } from './ProfilePictureUpload';

interface ContactCardFormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  services: string;
  notes: string;
  linkedin: string;
  facebook: string;
  whatsapp: string;
  websites: string;
  avatar_url: string;
}

const MyContactCardForm = () => {
  const { contactCard, loading, createContactCard, updateContactCard, regenerateShareCode } = useUserContactCard();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [websites, setWebsites] = useState<string[]>(contactCard?.websites || []);
  const [newWebsite, setNewWebsite] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string>('');

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch, setValue } = useForm<ContactCardFormData>({
    defaultValues: {
      name: contactCard?.name || '',
      email: contactCard?.email || '',
      phone: contactCard?.phone || '',
      company: contactCard?.company || '',
      industry: contactCard?.industry || '',
      services: contactCard?.services?.join(', ') || '',
      notes: contactCard?.notes || '',
      linkedin: contactCard?.linkedin || '',
      facebook: contactCard?.facebook || '',
      whatsapp: contactCard?.whatsapp || '',
      avatar_url: contactCard?.avatar_url || ''
    }
  });

  React.useEffect(() => {
    if (contactCard) {
      reset({
        name: contactCard.name,
        email: contactCard.email,
        phone: contactCard.phone || '',
        company: contactCard.company || '',
        industry: contactCard.industry || '',
        services: contactCard.services?.join(', ') || '',
        notes: contactCard.notes || '',
        linkedin: contactCard.linkedin || '',
        facebook: contactCard.facebook || '',
        whatsapp: contactCard.whatsapp || '',
        avatar_url: contactCard.avatar_url || ''
      });
      setWebsites(contactCard.websites || []);
      setCompanyLogoUrl((contactCard as any).company_logo_url || '');
      setCompanyLogoUrl(contactCard.company_logo_url || '');
    }
  }, [contactCard, reset]);

  // Generate QR code when contact card changes
  useEffect(() => {
    if (contactCard?.share_code) {
      const contactUrl = `${window.location.origin}/public/${contactCard.share_code}`;
      QRCode.toDataURL(contactUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error('Error generating QR code:', err));
    }
  }, [contactCard?.share_code]);

  const addWebsite = () => {
    if (newWebsite.trim() && !websites.includes(newWebsite.trim())) {
      setWebsites([...websites, newWebsite.trim()]);
      setNewWebsite('');
    }
  };

  const removeWebsite = (index: number) => {
    setWebsites(websites.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ContactCardFormData) => {
    const formData = {
      ...data,
      services: data.services ? data.services.split(',').map(s => s.trim()).filter(Boolean) : [],
      websites: websites,
      phone: data.phone || undefined,
      company: data.company || undefined,
      industry: data.industry || undefined,
      notes: data.notes || undefined,
      linkedin: data.linkedin || undefined,
      facebook: data.facebook || undefined,
      whatsapp: data.whatsapp || undefined,
      company_logo_url: companyLogoUrl || undefined
    };

    if (contactCard) {
      await updateContactCard(formData);
    } else {
      await createContactCard(formData);
    }
  };

  const copyShareCode = () => {
    if (contactCard?.share_code) {
      navigator.clipboard.writeText(contactCard.share_code);
      toast({
        title: "Copied!",
        description: "Share code copied to clipboard."
      });
    }
  };

  const copyShareLink = () => {
    if (contactCard?.share_code) {
      const shareUrl = `${window.location.origin}/?add=${contactCard.share_code}`;
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Copied!",
        description: "Share link copied to clipboard."
      });
    }
  };

  const handleBusinessCardExtracted = (contactInfo: any) => {
    reset({
      name: contactInfo.name || '',
      email: contactInfo.email || '',
      phone: contactInfo.phone || '',
      company: contactInfo.company || '',
      industry: contactInfo.industry || '',
      services: Array.isArray(contactInfo.services) ? contactInfo.services.join(', ') : '',
      notes: contactInfo.notes || '',
      linkedin: contactInfo.linkedin || '',
      facebook: contactInfo.facebook || '',
      whatsapp: contactInfo.whatsapp || ''
    });
    if (contactInfo.websites && Array.isArray(contactInfo.websites)) {
      setWebsites(contactInfo.websites);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Share Card */}
      {contactCard && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 mb-2">
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">Share Your Contact Card</span>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {qrCodeUrl && (
                <div className="flex justify-center">
                  <div className="p-2 bg-white rounded-lg shadow-sm border">
                    <img 
                      src={qrCodeUrl} 
                      alt="Contact QR Code" 
                      className="w-24 h-24"
                    />
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs">
                <Label className="text-xs">Share Code:</Label>
                <Badge variant="secondary" className="font-mono text-xs">
                  {contactCard.share_code}
                </Badge>
                <Button size="sm" variant="outline" onClick={copyShareCode}>
                  <Copy className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={regenerateShareCode}>
                  <RefreshCw className="w-3 h-3" />
                </Button>
              </div>
              <Button onClick={copyShareLink} className="w-full" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Copy Share Link
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Form */}
      <Card>
        {contactCard ? (
          <Accordion type="single" collapsible>
            <AccordionItem value="edit-form" className="border-0">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-semibold">Edit Contact Card</span>
                    <CardDescription className="text-sm">
                      Update your information
                    </CardDescription>
                  </div>
                  {!isMobile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowScanner(true);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      Scan Card
                    </Button>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                {/* Photos & Logos Section */}
                <div className="mb-4">
                  <div className="w-full rounded-lg border bg-muted/30 p-3 sm:p-4">
                    <Label className="block text-sm font-medium mb-3">Photos & Logos</Label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground min-w-16">Profile:</span>
                        <ProfilePictureUpload
                          currentAvatarUrl={watch('avatar_url')}
                          onAvatarUpdate={(url) => setValue('avatar_url', url || '')}
                          userInitials={watch('name')?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                          compact={true}
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground min-w-16">Company:</span>
                        <ProfilePictureUpload
                          currentAvatarUrl={companyLogoUrl}
                          onAvatarUpdate={(url) => setCompanyLogoUrl(url || '')}
                          userInitials={watch('company')?.split(' ').map(n => n[0]).join('').toUpperCase() || 'CO'}
                          variant="companyLogo"
                          compact={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                  {/* Scan Business Card Button */}
                  <div className="flex justify-center pb-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowScanner(true)}
                      className="flex items-center gap-2"
                    >
                      <Scan className="w-4 h-4" />
                      Scan Your Business Card
                    </Button>
                  </div>
                  
                  {/* Essential Fields */}
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="name" className="text-sm">Name *</Label>
                      <MobileInput
                        id="name"
                        {...register('name', { required: 'Name is required' })}
                        autoCapitalize="words"
                      />
                      {errors.name && (
                        <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm">Email *</Label>
                      <MobileInput
                        id="email"
                        type="email"
                        {...register('email', { required: 'Email is required' })}
                      />
                      {errors.email && (
                        <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="phone" className="text-sm">Phone</Label>
                        <MobileInput id="phone" type="tel" {...register('phone')} />
                      </div>

                      <div>
                        <Label htmlFor="company" className="text-sm">Company</Label>
                        <MobileInput id="company" {...register('company')} autoCapitalize="words" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="industry" className="text-sm">Industry</Label>
                        <MobileInput id="industry" {...register('industry')} autoCapitalize="words" />
                      </div>

                      <div>
                        <Label htmlFor="services" className="text-sm">Services</Label>
                        <MobileInput id="services" {...register('services')} placeholder="comma-separated" />
                      </div>
                    </div>
                  </div>

                  {/* Optional Sections - Collapsed on mobile */}
                  <Accordion type="multiple" defaultValue={isMobile ? [] : ["social", "websites", "about"]}>
                    {/* Social Profiles */}
                    <AccordionItem value="social">
                      <AccordionTrigger className="py-2 text-sm">Social Profiles</AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-2">
                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <Label htmlFor="linkedin" className="text-sm">LinkedIn</Label>
                            <MobileInput id="linkedin" {...register('linkedin')} placeholder="Profile URL" inputMode="url" />
                          </div>

                          <div>
                            <Label htmlFor="facebook" className="text-sm">Facebook</Label>
                            <MobileInput id="facebook" {...register('facebook')} placeholder="Profile URL" inputMode="url" />
                          </div>

                          <div>
                            <Label htmlFor="whatsapp" className="text-sm">WhatsApp</Label>
                            <MobileInput id="whatsapp" {...register('whatsapp')} placeholder="Phone or link" inputMode="tel" />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Websites */}
                    <AccordionItem value="websites">
                      <AccordionTrigger className="py-2 text-sm">Websites</AccordionTrigger>
                      <AccordionContent className="space-y-3 pt-2">
                        <div className="flex gap-2">
                          <MobileInput
                            value={newWebsite}
                            onChange={(e) => setNewWebsite(e.target.value)}
                            placeholder="Add website URL"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addWebsite())}
                            inputMode="url"
                            className="flex-1"
                          />
                          <Button type="button" onClick={addWebsite} size="sm">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {websites.map((website, index) => (
                            <Badge key={index} variant="secondary" className="gap-1 text-xs">
                              {website.length > 20 ? `${website.substring(0, 20)}...` : website}
                              <button
                                type="button"
                                onClick={() => removeWebsite(index)}
                                className="ml-1 hover:text-red-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* About */}
                    <AccordionItem value="about">
                      <AccordionTrigger className="py-2 text-sm">About</AccordionTrigger>
                      <AccordionContent className="pt-2">
                        <div>
                          <Label htmlFor="notes" className="text-sm">Bio / Additional Information</Label>
                          <Textarea 
                            id="notes" 
                            {...register('notes')} 
                            placeholder="Tell others about yourself..."
                            className="mt-1 min-h-20"
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  <div className="sticky bottom-20 md:bottom-4 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-4 pb-safe-bottom">
                    <Button type="submit" disabled={isSubmitting} className="w-full touch-target">
                      {isSubmitting ? 'Saving...' : 'Update Contact Card'}
                    </Button>
                  </div>
                </form>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Create Contact Card</CardTitle>
                  <CardDescription className="text-sm">
                    Create your digital business card
                  </CardDescription>
                </div>
                {!isMobile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowScanner(true)}
                    className="flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Scan Card
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Photos & Logos Section */}
              <div className="mb-4">
                <div className="w-full rounded-lg border bg-muted/30 p-3 sm:p-4">
                  <Label className="block text-sm font-medium mb-3">Photos & Logos</Label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground min-w-16">Profile:</span>
                      <ProfilePictureUpload
                        currentAvatarUrl={watch('avatar_url')}
                        onAvatarUpdate={(url) => setValue('avatar_url', url || '')}
                        userInitials={watch('name')?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                        compact={true}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground min-w-16">Company:</span>
                      <ProfilePictureUpload
                        currentAvatarUrl={companyLogoUrl}
                        onAvatarUpdate={(url) => setCompanyLogoUrl(url || '')}
                        userInitials={watch('company')?.split(' ').map(n => n[0]).join('').toUpperCase() || 'CO'}
                        variant="companyLogo"
                        compact={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                {/* Scan Business Card Button */}
                <div className="flex justify-center pb-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowScanner(true)}
                    className="flex items-center gap-2"
                  >
                    <Scan className="w-4 h-4" />
                    Scan Your Business Card
                  </Button>
                </div>
                
                {/* Essential Fields */}
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name" className="text-sm">Name *</Label>
                    <MobileInput
                      id="name"
                      {...register('name', { required: 'Name is required' })}
                      autoCapitalize="words"
                    />
                    {errors.name && (
                      <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm">Email *</Label>
                    <MobileInput
                      id="email"
                      type="email"
                      {...register('email', { required: 'Email is required' })}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="phone" className="text-sm">Phone</Label>
                      <MobileInput id="phone" type="tel" {...register('phone')} />
                    </div>

                    <div>
                      <Label htmlFor="company" className="text-sm">Company</Label>
                      <MobileInput id="company" {...register('company')} autoCapitalize="words" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="industry" className="text-sm">Industry</Label>
                      <MobileInput id="industry" {...register('industry')} autoCapitalize="words" />
                    </div>

                    <div>
                      <Label htmlFor="services" className="text-sm">Services</Label>
                      <MobileInput id="services" {...register('services')} placeholder="comma-separated" />
                    </div>
                  </div>
                </div>

                {/* Optional Sections - Collapsed on mobile */}
                <Accordion type="multiple" defaultValue={isMobile ? [] : ["social", "websites", "about"]}>
                  {/* Social Profiles */}
                  <AccordionItem value="social">
                    <AccordionTrigger className="py-2 text-sm">Social Profiles</AccordionTrigger>
                    <AccordionContent className="space-y-3 pt-2">
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <Label htmlFor="linkedin" className="text-sm">LinkedIn</Label>
                          <MobileInput id="linkedin" {...register('linkedin')} placeholder="Profile URL" inputMode="url" />
                        </div>

                        <div>
                          <Label htmlFor="facebook" className="text-sm">Facebook</Label>
                          <MobileInput id="facebook" {...register('facebook')} placeholder="Profile URL" inputMode="url" />
                        </div>

                        <div>
                          <Label htmlFor="whatsapp" className="text-sm">WhatsApp</Label>
                          <MobileInput id="whatsapp" {...register('whatsapp')} placeholder="Phone or link" inputMode="tel" />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Websites */}
                  <AccordionItem value="websites">
                    <AccordionTrigger className="py-2 text-sm">Websites</AccordionTrigger>
                    <AccordionContent className="space-y-3 pt-2">
                      <div className="flex gap-2">
                        <MobileInput
                          value={newWebsite}
                          onChange={(e) => setNewWebsite(e.target.value)}
                          placeholder="Add website URL"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addWebsite())}
                          inputMode="url"
                          className="flex-1"
                        />
                        <Button type="button" onClick={addWebsite} size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {websites.map((website, index) => (
                          <Badge key={index} variant="secondary" className="gap-1 text-xs">
                            {website.length > 20 ? `${website.substring(0, 20)}...` : website}
                            <button
                              type="button"
                              onClick={() => removeWebsite(index)}
                              className="ml-1 hover:text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* About */}
                  <AccordionItem value="about">
                    <AccordionTrigger className="py-2 text-sm">About</AccordionTrigger>
                    <AccordionContent className="pt-2">
                      <div>
                        <Label htmlFor="notes" className="text-sm">Bio / Additional Information</Label>
                        <Textarea 
                          id="notes" 
                          {...register('notes')} 
                          placeholder="Tell others about yourself..."
                          className="mt-1 min-h-20"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="sticky bottom-20 md:bottom-4 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-4 pb-safe-bottom">
                  <Button type="submit" disabled={isSubmitting} className="w-full touch-target">
                    {isSubmitting ? 'Saving...' : 'Create Contact Card'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </>
        )}
      </Card>

      {/* Mobile FAB for Scanner */}
      {isMobile && (
        <Button
          onClick={() => setShowScanner(true)}
          className="fixed bottom-24 right-4 rounded-full h-14 w-14 shadow-lg z-40"
          size="lg"
        >
          <Scan className="h-6 w-6" />
        </Button>
      )}

      <BusinessCardScanner
        isOpen={showScanner}
        onOpenChange={setShowScanner}
        onContactExtracted={handleBusinessCardExtracted}
      />
    </div>
  );
};

export default MyContactCardForm;
