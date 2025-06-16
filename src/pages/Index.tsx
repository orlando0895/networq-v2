
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Users, Star, UserPlus, Network } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    industry: "",
    services: "",
    tier: "Acquaintance" as const,
    notes: ""
  });

  const { toast } = useToast();

  const filteredContacts = contacts.filter(contact => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      contact.name.toLowerCase().includes(searchLower) ||
      contact.company.toLowerCase().includes(searchLower) ||
      contact.industry.toLowerCase().includes(searchLower) ||
      contact.services.some(service => service.toLowerCase().includes(searchLower))
    );
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
      title: "Contact Added",
      description: `${contact.name} has been added to your network.`
    });
  };

  const getTierColor = (tier: string) => {
    return tier === "A-player" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600";
  };

  const getTierIcon = (tier: string) => {
    return tier === "A-player" ? <Star className="w-3 h-3 fill-current" /> : <Users className="w-3 h-3" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-2">
                <Network className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Networq</h1>
                <p className="text-sm text-gray-600">Your digital referral rolodex</p>
              </div>
            </div>
            <Dialog open={isAddingContact} onOpenChange={setIsAddingContact}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Add New Contact
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={newContact.name}
                        onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newContact.email}
                        onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={newContact.phone}
                        onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={newContact.company}
                        onChange={(e) => setNewContact({...newContact, company: e.target.value})}
                        placeholder="Company Name"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Input
                      id="industry"
                      value={newContact.industry}
                      onChange={(e) => setNewContact({...newContact, industry: e.target.value})}
                      placeholder="e.g., Marketing & Design"
                    />
                  </div>

                  <div>
                    <Label htmlFor="services">Services (comma-separated)</Label>
                    <Input
                      id="services"
                      value={newContact.services}
                      onChange={(e) => setNewContact({...newContact, services: e.target.value})}
                      placeholder="web design, logo design, branding"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tier">Referral Tier</Label>
                    <Select value={newContact.tier} onValueChange={(value: "A-player" | "Acquaintance") => setNewContact({...newContact, tier: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A-player">A-player (Highly Recommended)</SelectItem>
                        <SelectItem value="Acquaintance">Acquaintance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newContact.notes}
                      onChange={(e) => setNewContact({...newContact, notes: e.target.value})}
                      placeholder="How you met, their specialties, quality of work..."
                      rows={3}
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
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by name, service, or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 text-lg shadow-lg border-0 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Contacts</p>
                  <p className="text-3xl font-bold">{contacts.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100">A-Players</p>
                  <p className="text-3xl font-bold">{contacts.filter(c => c.tier === "A-player").length}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-200 fill-current" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Industries</p>
                  <p className="text-3xl font-bold">{new Set(contacts.map(c => c.industry)).size}</p>
                </div>
                <Network className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-lg transition-shadow duration-200 bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{contact.name}</CardTitle>
                    <p className="text-sm text-gray-600">{contact.company}</p>
                  </div>
                  <Badge className={`${getTierColor(contact.tier)} flex items-center gap-1`}>
                    {getTierIcon(contact.tier)}
                    {contact.tier}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Industry</p>
                    <p className="text-sm text-gray-600">{contact.industry}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700">Services</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {contact.services.slice(0, 3).map((service, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                      {contact.services.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{contact.services.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">Contact</p>
                    <p className="text-sm text-gray-600">{contact.email}</p>
                    {contact.phone && <p className="text-sm text-gray-600">{contact.phone}</p>}
                  </div>

                  {contact.notes && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">Notes</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{contact.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredContacts.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No contacts found" : "No contacts yet"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? "Try searching for different services or contact names" 
                : "Add your first contact to start building your referral network"}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsAddingContact(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Contact
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">
              <span className="font-semibold">Networq</span> - Turn every introduction into a referral opportunity
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
