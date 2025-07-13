
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus, UserPlus, Camera } from "lucide-react";
import BusinessCardScanner from '@/components/BusinessCardScanner';

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
    websites: ""
  });
  const [showScanner, setShowScanner] = useState(false);

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
        websites: ""
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
      websites: Array.isArray(contactInfo.websites) ? contactInfo.websites.join(', ') : contactInfo.websites || ''
    });
  };

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
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-xl font-semibold">
              <UserPlus className="w-6 h-6" />
              Add New Contact
            </SheetTitle>
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
        </SheetHeader>
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
      </SheetContent>

      <BusinessCardScanner
        isOpen={showScanner}
        onOpenChange={setShowScanner}
        onContactExtracted={handleBusinessCardExtracted}
      />
    </Sheet>
  );
};

export default ContactForm;
