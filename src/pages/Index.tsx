import { useState, useEffect } from "react";
import { LogOut, User } from "lucide-react";
import { useContacts } from "@/hooks/useContacts";
import { useUserContactCard } from "@/hooks/useUserContactCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import ContactCard from "@/components/ContactCard";
import ContactForm from "@/components/ContactForm";
import ContactStats from "@/components/ContactStats";
import ContactFilters from "@/components/ContactFilters";
import EmptyState from "@/components/EmptyState";
import MyContactCardForm from "@/components/MyContactCardForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCodeShare } from "@/components/QRCodeShare";
import { useToast } from "@/hooks/use-toast";
import type { Database } from '@/integrations/supabase/types';

type Contact = Database['public']['Tables']['contacts']['Row'];

const Index = () => {
  const {
    contacts,
    loading,
    addContact,
    updateContact,
    deleteContact
  } = useContacts();
  const {
    fetchContactCardByShareCode
  } = useUserContactCard();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [filterTier, setFilterTier] = useState<"all" | "A-player" | "Acquaintance">("all");
  const [filterIndustry, setFilterIndustry] = useState("all");

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    }
  };

  // Check URL for share code on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shareCode = urlParams.get('add');
    if (shareCode) {
      handleShareCodeFromUrl(shareCode);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);
  const handleShareCodeFromUrl = async (shareCode: string) => {
    const result = await fetchContactCardByShareCode(shareCode);
    if (result.success && result.data) {
      const cardData = result.data;
      const addResult = await addContact({
        name: cardData.name,
        email: cardData.email,
        phone: cardData.phone || undefined,
        company: cardData.company || undefined,
        industry: cardData.industry || undefined,
        services: cardData.services || [],
        tier: 'Acquaintance',
        notes: cardData.notes || undefined,
        linkedin: cardData.linkedin || undefined,
        facebook: cardData.facebook || undefined,
        whatsapp: cardData.whatsapp || undefined,
        websites: cardData.websites || []
      });
      if (addResult.success) {
        toast({
          title: "Contact Added! 🎉",
          description: `${cardData.name} has been added from the shared link.`
        });
      }
    } else {
      toast({
        title: "Invalid Link",
        description: "The shared contact link is invalid or expired.",
        variant: "destructive"
      });
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = !searchTerm || 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      contact.company?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      contact.industry?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      contact.services?.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTier = filterTier === "all" || contact.tier === filterTier;
    const matchesIndustry = filterIndustry === "all" || contact.industry === filterIndustry;
    
    return matchesSearch && matchesTier && matchesIndustry;
  });

  const hasFilters = searchTerm !== "" || filterTier !== "all" || filterIndustry !== "all";

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>;
  }
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white rounded-xl p-2.5">
                <img src="/lovable-uploads/13a3c462-48e9-462a-b56d-edb9dd1a2bbb.png" alt="Networq Logo" className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Networq</h1>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">Your personal referral engine</p>
              </div>
            </div>
            
            {user && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className="hidden sm:inline">{user.email}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center space-x-2">
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl mx-auto">
        <Tabs defaultValue="contacts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="contacts">My Contacts</TabsTrigger>
            <TabsTrigger value="my-card">My Card</TabsTrigger>
            <TabsTrigger value="qr-share">QR Share</TabsTrigger>
          </TabsList>

          <TabsContent value="contacts" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">My Network</h2>
              <ContactForm isOpen={isAddingContact} onOpenChange={setIsAddingContact} onAddContact={addContact} />
            </div>

            <ContactFilters 
              searchTerm={searchTerm} 
              onSearchChange={setSearchTerm} 
              filterTier={filterTier} 
              onFilterChange={setFilterTier} 
              contacts={contacts} 
            />

            <ContactStats 
              contacts={contacts} 
              filterIndustry={filterIndustry}
              onIndustryFilterChange={setFilterIndustry}
            />

            <div className="space-y-4 sm:space-y-6">
              {filteredContacts.map(contact => (
                <ContactCard 
                  key={contact.id} 
                  contact={contact} 
                  onUpdateContact={updateContact} 
                  onDeleteContact={deleteContact} 
                />
              ))}
            </div>

            {filteredContacts.length === 0 && (
              <EmptyState 
                hasFilters={hasFilters} 
                onAddContact={() => setIsAddingContact(true)} 
              />
            )}
          </TabsContent>

          <TabsContent value="my-card">
            <MyContactCardForm />
          </TabsContent>

          <TabsContent value="qr-share" className="flex justify-center">
            <QRCodeShare />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl mx-auto">
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
