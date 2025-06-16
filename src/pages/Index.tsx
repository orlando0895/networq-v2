import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Users, Star, UserPlus, Network, Mail, Phone, Edit, ChevronDown } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useContacts } from "@/hooks/useContacts";

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
  const { contacts, loading, addContact } = useContacts();
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

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = !searchTerm || 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.services?.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTier = filterTier === "all" || contact.tier === filterTier;
    
    return matchesSearch && matchesTier;
  });

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.email) {
      return;
    }

    const result = await addContact({
      ...newContact,
      services: newContact.services.split(",").map(s => s.trim().toLowerCase()).filter(s => s)
    });

    if (result?.success) {
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
    }
  };

  const handleTierFilter = (tier: "A-player") => {
    setFilterTier(tier);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile-Optimized Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-2">
                <Network className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Networq</h1>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">Your personal referral engine</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Mobile Sheet for Add Contact */}
              <Sheet open={isAddingContact} onOpenChange={setIsAddingContact}>
                <SheetTrigger asChild>
                  <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200">
                    <Plus className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Add Contact</span>
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2 text-lg font-semibold">
                      <UserPlus className="w-5 h-5" />
                      Add New Contact
                    </SheetTitle>
                  </SheetHeader>
                  <div className="space-y-4 mt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-sm font-medium">Name *</Label>
                        <Input
                          id="name"
                          value={newContact.name}
                          onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                          placeholder="John Doe"
                          className="mt-1 h-12"
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
                          className="mt-1 h-12"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone" className="text-sm font-medium">Phone</Label>
                        <Input
                          id="phone"
                          value={newContact.phone}
                          onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                          placeholder="(555) 123-4567"
                          className="mt-1 h-12"
                        />
                      </div>
                      <div>
                        <Label htmlFor="company" className="text-sm font-medium">Company</Label>
                        <Input
                          id="company"
                          value={newContact.company}
                          onChange={(e) => setNewContact({...newContact, company: e.target.value})}
                          placeholder="Company Name"
                          className="mt-1 h-12"
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
                        className="mt-1 h-12"
                      />
                    </div>

                    <div>
                      <Label htmlFor="services" className="text-sm font-medium">Services (comma-separated)</Label>
                      <Input
                        id="services"
                        value={newContact.services}
                        onChange={(e) => setNewContact({...newContact, services: e.target.value})}
                        placeholder="web design, logo design, branding"
                        className="mt-1 h-12"
                      />
                    </div>

                    <div>
                      <Label htmlFor="tier" className="text-sm font-medium">Referral Tier</Label>
                      <Select value={newContact.tier} onValueChange={(value: "A-player" | "Acquaintance") => setNewContact({...newContact, tier: value})}>
                        <SelectTrigger className="mt-1 h-12">
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
                      <Button onClick={handleAddContact} className="flex-1 h-12">
                        Add Contact
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddingContact(false)} className="h-12">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl mx-auto">
        {/* Mobile-Optimized Search & Filter Section */}
        <div className="mb-6 sm:mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by name, service, or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 text-base border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 transition-colors h-12"
            />
          </div>
          
          {/* Mobile Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterTier === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterTier("all")}
              className="transition-all duration-200 h-10"
            >
              All ({contacts.length})
            </Button>
            <Button
              variant={filterTier === "A-player" ? "default" : "outline"}
              size="sm"
              onClick={() => handleTierFilter("A-player")}
              className="transition-all duration-200 h-10"
            >
              <Star className="w-3 h-3 mr-1 fill-current" />
              A-Players ({contacts.filter(c => c.tier === "A-player").length})
            </Button>
            <Button
              variant={filterTier === "Acquaintance" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterTier("Acquaintance")}
              className="transition-all duration-200 h-10"
            >
              Acquaintances ({contacts.filter(c => c.tier === "Acquaintance").length})
            </Button>
          </div>
        </div>

        {/* Mobile-Optimized Stats */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl p-3 sm:p-6 border border-slate-200">
            <div className="text-center">
              <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Total</p>
              <p className="text-lg sm:text-2xl font-bold text-slate-900">{contacts.length}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-3 sm:p-6 border border-slate-200">
            <div className="text-center">
              <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">A-Players</p>
              <p className="text-lg sm:text-2xl font-bold text-slate-900">{contacts.filter(c => c.tier === "A-player").length}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-3 sm:p-6 border border-slate-200">
            <div className="text-center">
              <p className="text-xs sm:text-sm font-medium text-slate-600 mb-1">Industries</p>
              <p className="text-lg sm:text-2xl font-bold text-slate-900">{new Set(contacts.map(c => c.industry).filter(Boolean)).size}</p>
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Contacts Grid */}
        <div className="space-y-3 sm:space-y-4">
          {filteredContacts.map((contact) => (
            <Card key={contact.id} className="bg-white border border-slate-200 hover:shadow-md transition-all duration-200">
              <Accordion type="single" collapsible>
                <AccordionItem value={contact.id} className="border-none">
                  <CardHeader className="pb-3 px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                          <CardTitle className="text-base sm:text-lg font-semibold text-slate-900 truncate">{contact.name}</CardTitle>
                          <Badge 
                            className={`${
                              contact.tier === "A-player" 
                                ? "bg-amber-50 text-amber-700 border-amber-200" 
                                : "bg-slate-50 text-slate-600 border-slate-200"
                            } flex items-center gap-1 text-xs`}
                          >
                            {contact.tier === "A-player" ? <Star className="w-3 h-3 fill-current" /> : <Users className="w-3 h-3" />}
                            <span className="hidden sm:inline">{contact.tier}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-1 truncate">{contact.company}</p>
                        <p className="text-sm text-slate-500 truncate">{contact.industry}</p>
                      </div>
                      <AccordionTrigger className="hover:no-underline p-2 ml-2">
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </AccordionTrigger>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-3">
                      {contact.services?.slice(0, 2).map((service, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                          {service}
                        </Badge>
                      ))}
                      {contact.services && contact.services.length > 2 && (
                        <Badge variant="secondary" className="text-xs bg-slate-50 text-slate-600">
                          +{contact.services.length - 2}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <AccordionContent>
                    <CardContent className="pt-0 px-4 sm:px-6">
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <span className="text-sm text-slate-700 break-all">{contact.email}</span>
                          </div>
                          {contact.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
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
                        
                        {/* Mobile-Optimized Action Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <Button size="sm" className="justify-center h-10">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Refer
                          </Button>
                          <Button variant="outline" size="sm" className="justify-center h-10">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="justify-center h-10">
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
            <p className="text-slate-600 mb-4 leading-relaxed px-4">
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
        <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto">
          <div className="text-center">
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              <span className="font-semibold">Networq</span> - Turn every introduction into a referral opportunity
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
