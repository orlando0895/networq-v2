import { useState, useEffect } from "react";
import { LogOut, User, MessageSquare } from "lucide-react";
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
import Messages from "@/pages/Messages";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-white rounded-xl p-2">
                <img src="/lovable-uploads/13a3c462-48e9-462a-b56d-edb9dd1a2bbb.png" alt="Networq Logo" className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Networq</h1>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed hidden sm:block">Your personal referral engine</p>
              </div>
            </div>
            
            {user && (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className="hidden sm:inline truncate max-w-32 lg:max-w-none">{user.email}</span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center space-x-1 sm:space-x-2">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-4xl mx-auto">
        <Tabs defaultValue="contacts" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-12 sm:h-10">
            <TabsTrigger value="contacts" className="text-xs sm:text-sm px-2 sm:px-4">
              <span className="hidden sm:inline">My Contacts</span>
              <span className="sm:hidden">Contacts</span>
            </TabsTrigger>
            <TabsTrigger value="my-card" className="text-xs sm:text-sm px-2 sm:px-4">
              <span className="hidden sm:inline">My Card</span>
              <span className="sm:hidden">Card</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Messages</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contacts" className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900">My Network</h2>
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

            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
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

          <TabsContent value="messages" className="h-[calc(100vh-140px)] sm:h-[calc(100vh-160px)]">
            <Messages />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-8 sm:mt-16">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-slate-600 leading-relaxed text-xs sm:text-sm lg:text-base">
              <span className="font-semibold">Networq</span> - Turn every introduction into a referral opportunity
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
