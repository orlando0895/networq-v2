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
import { Copy, RefreshCw, Share2, Trash2, Plus, Camera } from 'lucide-react';
import { useUserContactCard } from '@/hooks/useUserContactCard';
import { useToast } from '@/hooks/use-toast';
import DeleteAccountDialog from '@/components/DeleteAccountDialog';
import BusinessCardScanner from '@/components/BusinessCardScanner';

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
}

const MyContactCardForm = () => {
  const { contactCard, loading, createContactCard, updateContactCard, regenerateShareCode } = useUserContactCard();
  const { toast } = useToast();
  const [websites, setWebsites] = useState<string[]>(contactCard?.websites || []);
  const [newWebsite, setNewWebsite] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ContactCardFormData>({
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
      whatsapp: contactCard?.whatsapp || ''
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
        whatsapp: contactCard.whatsapp || ''
      });
      setWebsites(contactCard.websites || []);
    }
  }, [contactCard, reset]);

  // Generate QR code when contact card changes
  useEffect(() => {
    if (contactCard?.share_code) {
      const contactUrl = `${window.location.origin}/contact/${contactCard.share_code}`;
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
      whatsapp: data.whatsapp || undefined
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
    <div className="space-y-6">
      {contactCard && (
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
          <CardContent className="space-y-4">
            {qrCodeUrl && (
              <div className="flex justify-center">
                <div className="p-3 bg-white rounded-lg shadow-sm border">
                  <img 
                    src={qrCodeUrl} 
                    alt="Contact QR Code" 
                    className="w-32 h-32"
                  />
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Label>Share Code:</Label>
              <Badge variant="secondary" className="font-mono text-sm">
                {contactCard.share_code}
              </Badge>
              <Button size="sm" variant="outline" onClick={copyShareCode}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={regenerateShareCode}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button onClick={copyShareLink} className="flex-1">
                <Share2 className="w-4 h-4 mr-2" />
                Copy Share Link
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {contactCard ? 'Edit Your Contact Card' : 'Create Your Contact Card'}
              </CardTitle>
              <CardDescription>
                {contactCard ? 'Update your contact information' : 'Create a contact card that you can share with others'}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowScanner(true)}
              className="flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Scan Card
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  {...register('name', { required: 'Name is required' })}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
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
                  <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
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
                      className="ml-1 hover:text-red-600"
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

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Saving...' : contactCard ? 'Update Contact Card' : 'Create Contact Card'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteAccountDialog />
        </CardContent>
      </Card>

      <BusinessCardScanner
        isOpen={showScanner}
        onOpenChange={setShowScanner}
        onContactExtracted={handleBusinessCardExtracted}
      />
    </div>
  );
};

export default MyContactCardForm;
