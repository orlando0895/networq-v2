
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Users, Star, UserPlus, Network, Mail, Phone, Edit, Filter, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  services: string[];
  tier: "A-player" | "Acquaintance";
  notes: string;
  addedDate: string;
}

const Index = () => {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: "1",
      name: "Sarah Chen",
      email: "sarah@designstudio.com",
      phone: "(555) 123-4567",
      company: "Design Studio Pro",
      industry: "Marketing & Design",
      services: ["logo design", "web design", "branding", "graphic design"],
      tier: "A-player",
      notes: "Met at BNI meeting. Excellent work quality, very reliable.",
      addedDate: "2024-01-15"
    },
    {
      id: "2",
      name: "Mike Rodriguez",
      email: "mike@handyhelp.com",
      phone: "(555) 987-6543",
      company: "HandyHelp Services",
      industry: "Home Services",
      services: ["handyman", "plumbing", "electrical", "home repair"],
      tier: "A-player",
      notes: "Highly recommended by 3 clients. Always on time.",
      addedDate: "2024-02-03"
    },
    {
      id: "3",
      name: "Jennifer Walsh",
      email: "jen@coachingpro.com",
      phone: "(555) 456-7890",
      company: "Executive Coaching Pro",
      industry: "Professional Services",
      services: ["business coaching", "executive coaching", "leadership training"],
      tier: "Acquaintance",
      notes: "Met at networking mixer. Good speaker.",
      addedDate: "2024-02-10"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [filterTier, setFilterTier] = useState<"all" | "A-player" | "Acquaintance">("all");
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    industry: "",
    services: "",
    tier: "Acquaintance" as "A-player" | "Acquaintance",
    notes: ""
  });

  const { toast } = useToast();

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = !searchTerm || 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTier = filterTier === "all" || contact.tier === filterTier;
    
    return matchesSearch && matchesTier;
  });

  const handleAddContact = () => {
    if (!newContact.name || !newContact.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least name and email.",
        variant: "destructive"
      });
      return;
    }

    const contact: Contact = {
      id: Date.now().toString(),
      ...newContact,
      services: newContact.services.split(",").map(s => s.trim().toLowerCase()).filter(s => s),
      addedDate: new Date().toISOString().split('T')[0]
    };

    setContacts([contact, ...contacts]);
    setNewContact({
      name: "",
      email: "",
      phone: "",
      company: "",
      industry: "",
      services: "",
      tier: "Acquaintance",
      notes: ""
    });
    setIsAddingContact(false);
    
    toast({
      title: "Contact Added! 🎉",
      description: `${contact.name} has been added to your network.`
    });
  };

  const handleTierFilter = (tier: "A-player") => {
    setFilterTier(tier);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-2.5">
                <Network className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Networq</h1>
                <p className="text-sm text-slate-600 leading-relaxed">Your personal referral engine</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" className="hidden sm:flex">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite to Circle
              </Button>
              <Dialog open={isAddingContact} onOpenChange={setIsAddingContact}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contact
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                      <UserPlus className="w-5 h-5" />
                      Add New Contact
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-sm font-medium">Name *</Label>
                        <Input
                          id="name"
                          value={newContact.name}
                          onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                          placeholder="John Doe"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newContact.email}
                          onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                          placeholder="john@company.com"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                        <Input
                          id="phone"
                          value={newContact.phone}
                          onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                          placeholder="(555) 123-4567"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="company" className="text-sm font-medium">Company</Label>
                        <Input
                          id="company"
                          value={newContact.company}
                          onChange={(e) => setNewContact({...newContact, company: e.target.value})}
                          placeholder="Company Name"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="industry" className="text-sm font-medium">Industry</Label>
                      <Input
                        id="industry"
                        value={newContact.industry}
                        onChange={(e) => setNewContact({...newContact, industry: e.target.value})}
                        placeholder="e.g., Marketing & Design"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="services" className="text-sm font-medium">Services (comma-separated)</Label>
                      <Input
                        id="services"
                        value={newContact.services}
                        onChange={(e) => setNewContact({...newContact, services: e.target.value})}
                        placeholder="web design, logo design, branding"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="tier" className="text-sm font-medium">Referral Tier</Label>
                      <Select value={newContact.tier} onValueChange={(value: "A-player" | "Acquaintance") => setNewContact({...newContact, tier: value})}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A-player">A-player (Highly Recommended)</SelectItem>
                          <SelectItem value="Acquaintance">Acquaintance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
                      <Textarea
                        id="notes"
                        value={newContact.notes}
                        onChange={(e) => setNewContact({...newContact, notes: e.target.value})}
                        placeholder="How you met, their specialties, quality of work..."
                        rows={3}
                        className="mt-1"
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleAddContact} className="flex-1">
                        Add Contact
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddingContact(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Search & Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by name, service, or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 text-base border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant={filterTier === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterTier("all")}
              className="transition-all duration-200"
            >
              All ({contacts.length})
            </Button>
            <Button
              variant={filterTier === "A-player" ? "default" : "outline"}
              size="sm"
              onClick={() => handleTierFilter("A-player")}
              className="transition-all duration-200"
            >
              <Star className="w-3 h-3 mr-1 fill-current" />
              A-Players ({contacts.filter(c => c.tier === "A-player").length})
            </Button>
            <Button
              variant={filterTier === "Acquaintance" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterTier("Acquaintance")}
              className="transition-all duration-200"
            >
              Acquaintances ({contacts.filter(c => c.tier === "Acquaintance").length})
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Contacts</p>
                <p className="text-2xl font-bold text-slate-900">{contacts.length}</p>
              </div>
              <Users className="w-5 h-5 text-slate-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">A-Players</p>
                <p className="text-2xl font-bold text-slate-900">{contacts.filter(c => c.tier === "A-player").length}</p>
              </div>
              <Star className="w-5 h-5 text-amber-400 fill-current" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Industries</p>
                <p className="text-2xl font-bold text-slate-900">{new Set(contacts.map(c => c.industry)).size}</p>
              </div>
              <Network className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Contacts Grid */}
        <div className="space-y-4">
          {filteredContacts.map((contact) => (
            <Card key={contact.id} className="bg-white border border-slate-200 hover:shadow-md transition-all duration-200 hover-scale">
              <Accordion type="single" collapsible>
                <AccordionItem value={contact.id} className="border-none">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <CardTitle className="text-lg font-semibold text-slate-900">{contact.name}</CardTitle>
                          <Badge 
                            className={`${
                              contact.tier === "A-player" 
                                ? "bg-amber-50 text-amber-700 border-amber-200" 
                                : "bg-slate-50 text-slate-600 border-slate-200"
                            } flex items-center gap-1`}
                          >
                            {contact.tier === "A-player" ? <Star className="w-3 h-3 fill-current" /> : <Users className="w-3 h-3" />}
                            {contact.tier}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-1">{contact.company}</p>
                        <p className="text-sm text-slate-500">{contact.industry}</p>
                      </div>
                      <AccordionTrigger className="hover:no-underline p-2">
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </AccordionTrigger>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-3">
                      {contact.services.slice(0, 3).map((service, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                          {service}
                        </Badge>
                      ))}
                      {contact.services.length > 3 && (
                        <Badge variant="secondary" className="text-xs bg-slate-50 text-slate-600">
                          +{contact.services.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <AccordionContent>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-700">{contact.email}</span>
                          </div>
                          {contact.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-700">{contact.phone}</span>
                            </div>
                          )}
                          {contact.notes && (
                            <div>
                              <p className="text-sm font-medium text-slate-700 mb-1">Notes</p>
                              <p className="text-sm text-slate-600 leading-relaxed">{contact.notes}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <Button size="sm" className="justify-start">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Refer
                          </Button>
                          <Button variant="outline" size="sm" className="justify-start">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="justify-start">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Note
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </Card>
          ))}
        </div>

        {filteredContacts.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchTerm || filterTier !== "all" ? "No contacts found" : "No contacts yet"}
            </h3>
            <p className="text-slate-600 mb-4 leading-relaxed">
              {searchTerm || filterTier !== "all" 
                ? "Try adjusting your search or filters" 
                : "Add your first contact to start building your referral network"}
            </p>
            {!searchTerm && filterTier === "all" && (
              <Button onClick={() => setIsAddingContact(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Contact
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">
            <p className="text-slate-600 leading-relaxed">
              <span className="font-semibold">Networq</span> - Turn every introduction into a referral opportunity
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
