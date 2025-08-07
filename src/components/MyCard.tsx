import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, RefreshCw, Share2, Trash2, Plus, Camera, QrCode, Edit, Eye, Download, Check } from 'lucide-react';
import { useUserContactCard } from '@/hooks/useUserContactCard';
import { useToast } from '@/hooks/use-toast';
import { DeleteAccountDialog, BusinessCardScanner } from '@/components/LazyComponents';
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

export const MyCard = () => {
  const { contactCard, loading, createContactCard, updateContactCard, regenerateShareCode } = useUserContactCard();
  const { toast } = useToast();
  const [websites, setWebsites] = useState<string[]>(contactCard?.websites || []);
  const [newWebsite, setNewWebsite] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(!contactCard);

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
      setIsEditing(false);
    }
  }, [contactCard, reset]);

  // Generate QR code when contact card changes
  useEffect(() => {
    if (contactCard?.share_code) {
      const publicUrl = contactCard.username 
        ? `${window.location.origin}/public/${contactCard.username}`
        : `${window.location.origin}/public/${contactCard.share_code}`;
      
      QRCode.toDataURL(publicUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error('Error generating QR code:', err));
    }
  }, [contactCard?.share_code, contactCard?.username]);

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
      whatsapp: data.whatsapp || undefined
    };

    const result = contactCard 
      ? await updateContactCard(formData)
      : await createContactCard(formData);

    if (result?.success) {
      setIsEditing(false);
    }
  };

  const handleCopyShareCode = async () => {
    if (contactCard?.share_code) {
      try {
        await navigator.clipboard.writeText(contactCard.share_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: "Share Code Copied!",
          description: "Your contact share code has been copied to clipboard."
        });
      } catch (err) {
        console.error('Failed to copy share code:', err);
      }
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
          title: "Link Copied!",
          description: "Your public profile link has been copied to clipboard."
        });
      } catch (err) {
        console.error('Failed to copy link:', err);
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
        title: "QR Code Downloaded!",
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
        handleCopyLink();
      }
    } else {
      handleCopyLink();
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
    setIsEditing(true);
  };

  const handlePreview = () => {
    if (contactCard?.share_code) {
      const publicUrl = contactCard.username 
        ? `/public/${contactCard.username}`
        : `/public/${contactCard.share_code}`;
      window.open(publicUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Actions - Only show if contact card exists */}
      {contactCard && (
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-12 justify-start" disabled>
            <QrCode className="h-4 w-4 mr-2" />
            QR Code
          </Button>
          <Button variant="outline" className="h-12 justify-start" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" className="h-12 justify-start" onClick={() => setIsEditing(!isEditing)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" className="h-12 justify-start" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>
      )}

      {/* Share Your Contact Card Section - Only show when not editing */}
      {contactCard && !isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Share Your Contact Card
            </CardTitle>
            <CardDescription>
              Share your contact information with others using these options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* QR Code */}
            {qrCodeUrl && (
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg border shadow-sm">
                  <img 
                    src={qrCodeUrl} 
                    alt="Contact QR Code" 
                    className="w-40 h-40"
                  />
                </div>
              </div>
            )}
            
            {/* Share Code */}
            <div className="text-center space-y-3">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Share Code</div>
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="secondary" className="font-mono text-lg px-4 py-2">
                    {contactCard.share_code}
                  </Badge>
                  <Button size="sm" variant="ghost" onClick={handleCopyShareCode}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={regenerateShareCode}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Public URL */}
              <div>
                <div className="text-sm text-muted-foreground mb-1">Public URL</div>
                <div className="text-xs font-mono bg-muted p-3 rounded-md break-all">
                  {contactCard.username 
                    ? `${window.location.host}/public/${contactCard.username}`
                    : `${window.location.host}/public/${contactCard.share_code}`
                  }
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button onClick={handleCopyLink} className="w-full h-12" size="lg">
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              <Button onClick={handleDownloadQR} variant="outline" className="w-full h-12" size="lg">
                <Download className="w-4 h-4 mr-2" />
                Download QR
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Card Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {!contactCard ? 'Create Your Contact Card' : isEditing ? 'Edit Your Contact Card' : 'Your Contact Card'}
              </CardTitle>
              <CardDescription>
                {!contactCard 
                  ? 'Create a contact card that you can share with others'
                  : isEditing 
                    ? 'Update your contact information'
                    : 'Your digital business card information'
                }
              </CardDescription>
            </div>
            {isEditing && (
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
          {isEditing ? (
            <>
              <div className="mb-6">
                <Label className="block text-sm font-medium mb-2">Profile Picture</Label>
                <ProfilePictureUpload
                  currentAvatarUrl={watch('avatar_url')}
                  onAvatarUpdate={(url) => setValue('avatar_url', url || '')}
                  userInitials={watch('name')?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                />
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      {...register('name', { required: 'Name is required' })}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email', { required: 'Email is required' })}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" {...register('phone')} />
                  </div>

                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input id="company" {...register('company')} />
                  </div>

                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Input id="industry" {...register('industry')} />
                  </div>

                  <div>
                    <Label htmlFor="services">Services (comma-separated)</Label>
                    <Input id="services" {...register('services')} />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input id="linkedin" {...register('linkedin')} placeholder="Profile URL or username" />
                  </div>

                  <div>
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input id="facebook" {...register('facebook')} placeholder="Profile URL or username" />
                  </div>

                  <div>
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input id="whatsapp" {...register('whatsapp')} placeholder="Phone number or link" />
                  </div>
                </div>

                <div>
                  <Label>Websites</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newWebsite}
                      onChange={(e) => setNewWebsite(e.target.value)}
                      placeholder="Add website URL"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addWebsite())}
                    />
                    <Button type="button" onClick={addWebsite} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {websites.map((website, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        {website}
                        <button
                          type="button"
                          onClick={() => removeWebsite(index)}
                          className="ml-1 hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" {...register('notes')} placeholder="Additional information about yourself" />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? 'Saving...' : contactCard ? 'Update Contact Card' : 'Create Contact Card'}
                  </Button>
                  {contactCard && (
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </>
          ) : contactCard ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  {contactCard.avatar_url ? (
                    <img src={contactCard.avatar_url} alt={contactCard.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-semibold text-primary">
                      {contactCard.name?.charAt(0)?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{contactCard.name}</h3>
                  <p className="text-muted-foreground">{contactCard.company || contactCard.industry}</p>
                  <p className="text-sm text-muted-foreground">{contactCard.email}</p>
                </div>
              </div>
              
              {(contactCard.phone || contactCard.services?.length) && (
                <div className="space-y-2 text-sm">
                  {contactCard.phone && (
                    <div>
                      <span className="font-medium">Phone:</span> {contactCard.phone}
                    </div>
                  )}
                  {contactCard.services?.length && (
                    <div>
                      <span className="font-medium">Services:</span> {contactCard.services.join(', ')}
                    </div>
                  )}
                </div>
              )}

              {contactCard.notes && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm">{contactCard.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Edit className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">No Contact Card Yet</h3>
              <p className="text-muted-foreground mb-4">Create your digital business card to start sharing your professional information.</p>
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Create Contact Card
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      {contactCard && !isEditing && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>
              Permanently delete your account and all associated data. This action cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DeleteAccountDialog />
          </CardContent>
        </Card>
      )}

      {/* Business Card Scanner */}
      <BusinessCardScanner
        isOpen={showScanner}
        onOpenChange={setShowScanner}
        onContactExtracted={handleBusinessCardExtracted}
      />
    </div>
  );
};