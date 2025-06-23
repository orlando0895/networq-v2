
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Edit } from "lucide-react";
import type { Database } from '@/integrations/supabase/types';

type Contact = Database['public']['Tables']['contacts']['Row'];

interface EditContactFormProps {
  contact: Contact;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateContact: (id: string, updates: Partial<Contact>) => Promise<any>;
}

const EditContactForm = ({ contact, isOpen, onOpenChange, onUpdateContact }: EditContactFormProps) => {
  const [editedContact, setEditedContact] = useState({
    name: contact.name || "",
    email: contact.email || "",
    phone: contact.phone || "",
    company: contact.company || "",
    industry: contact.industry || "",
    services: contact.services?.join(", ") || "",
    tier: contact.tier as "A-player" | "Acquaintance",
    notes: contact.notes || "",
    linkedin: contact.linkedin || "",
    facebook: contact.facebook || "",
    whatsapp: contact.whatsapp || "",
    websites: contact.websites?.join(", ") || ""
  });

  const handleUpdateContact = async () => {
    if (!editedContact.name || !editedContact.email) {
      return;
    }

    const updates = {
      name: editedContact.name,
      email: editedContact.email,
      phone: editedContact.phone || null,
      company: editedContact.company || null,
      industry: editedContact.industry || null,
      services: editedContact.services.split(",").map(s => s.trim().toLowerCase()).filter(s => s),
      tier: editedContact.tier,
      notes: editedContact.notes || null,
      linkedin: editedContact.linkedin || null,
      facebook: editedContact.facebook || null,
      whatsapp: editedContact.whatsapp || null,
      websites: editedContact.websites.split(",").map(w => w.trim()).filter(w => w)
    };

    const result = await onUpdateContact(contact.id, updates);

    if (result?.success) {
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-lg font-semibold">
            <Edit className="w-5 h-5" />
            Edit Contact
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-name" className="text-sm font-medium">Name *</Label>
              <Input
                id="edit-name"
                value={editedContact.name}
                onChange={(e) => setEditedContact({...editedContact, name: e.target.value})}
                placeholder="John Doe"
                className="mt-1 h-12"
              />
            </div>
            <div>
              <Label htmlFor="edit-email" className="text-sm font-medium">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={editedContact.email}
                onChange={(e) => setEditedContact({...editedContact, email: e.target.value})}
                placeholder="john@company.com"
                className="mt-1 h-12"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-phone" className="text-sm font-medium">Phone</Label>
              <Input
                id="edit-phone"
                value={editedContact.phone}
                onChange={(e) => setEditedContact({...editedContact, phone: e.target.value})}
                placeholder="(555) 123-4567"
                className="mt-1 h-12"
              />
            </div>
            <div>
              <Label htmlFor="edit-company" className="text-sm font-medium">Company</Label>
              <Input
                id="edit-company"
                value={editedContact.company}
                onChange={(e) => setEditedContact({...editedContact, company: e.target.value})}
                placeholder="Company Name"
                className="mt-1 h-12"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="edit-industry" className="text-sm font-medium">Industry</Label>
            <Input
              id="edit-industry"
              value={editedContact.industry}
              onChange={(e) => setEditedContact({...editedContact, industry: e.target.value})}
              placeholder="e.g., Marketing & Design"
              className="mt-1 h-12"
            />
          </div>

          <div>
            <Label htmlFor="edit-services" className="text-sm font-medium">Services (comma-separated)</Label>
            <Input
              id="edit-services"
              value={editedContact.services}
              onChange={(e) => setEditedContact({...editedContact, services: e.target.value})}
              placeholder="web design, logo design, branding"
              className="mt-1 h-12"
            />
          </div>

          <div>
            <Label htmlFor="edit-tier" className="text-sm font-medium">Referral Tier</Label>
            <Select value={editedContact.tier} onValueChange={(value: "A-player" | "Acquaintance") => setEditedContact({...editedContact, tier: value})}>
              <SelectTrigger className="mt-1 h-12">
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
            <h3 className="text-sm font-medium text-slate-900">Social Media & Online Presence</h3>
            
            <div>
              <Label htmlFor="edit-linkedin" className="text-sm font-medium">LinkedIn</Label>
              <Input
                id="edit-linkedin"
                value={editedContact.linkedin}
                onChange={(e) => setEditedContact({...editedContact, linkedin: e.target.value})}
                placeholder="linkedin.com/in/johndoe or johndoe"
                className="mt-1 h-12"
              />
            </div>

            <div>
              <Label htmlFor="edit-facebook" className="text-sm font-medium">Facebook</Label>
              <Input
                id="edit-facebook"
                value={editedContact.facebook}
                onChange={(e) => setEditedContact({...editedContact, facebook: e.target.value})}
                placeholder="facebook.com/johndoe or johndoe"
                className="mt-1 h-12"
              />
            </div>

            <div>
              <Label htmlFor="edit-whatsapp" className="text-sm font-medium">WhatsApp</Label>
              <Input
                id="edit-whatsapp"
                value={editedContact.whatsapp}
                onChange={(e) => setEditedContact({...editedContact, whatsapp: e.target.value})}
                placeholder="+1234567890 or wa.me/1234567890"
                className="mt-1 h-12"
              />
            </div>

            <div>
              <Label htmlFor="edit-websites" className="text-sm font-medium">Websites (comma-separated)</Label>
              <Input
                id="edit-websites"
                value={editedContact.websites}
                onChange={(e) => setEditedContact({...editedContact, websites: e.target.value})}
                placeholder="company.com, portfolio.com"
                className="mt-1 h-12"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="edit-notes" className="text-sm font-medium">Notes</Label>
            <Textarea
              id="edit-notes"
              value={editedContact.notes}
              onChange={(e) => setEditedContact({...editedContact, notes: e.target.value})}
              placeholder="How you met, their specialties, quality of work..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleUpdateContact} className="flex-1 h-12">
              Update Contact
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="h-12">
              Cancel
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EditContactForm;
