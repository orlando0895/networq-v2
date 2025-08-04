import { useState, useEffect } from "react";
import { useContacts } from "@/hooks/useContacts";
import { useUserContactCard } from "@/hooks/useUserContactCard";
import { Button } from "@/components/ui/button";
import ContactCard from "@/components/ContactCard";
import ContactForm from "@/components/ContactForm";
import ContactStats from "@/components/ContactStats";
import ContactFilters from "@/components/ContactFilters";
import EmptyState from "@/components/EmptyState";
import { useToast } from "@/hooks/use-toast";
import type { Database } from '@/integrations/supabase/types';

type Contact = Database['public']['Tables']['contacts']['Row'];

const Index = () => {
  const {
    contacts,
    loading,
    addContact,
    updateContact,
    deleteContact,
    refetch: refetchContacts
  } = useContacts();
  const {
    fetchContactCardByShareCode
  } = useUserContactCard();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [filterTier, setFilterTier] = useState<"all" | "A-player" | "Acquaintance">("all");
  const [filterIndustry, setFilterIndustry] = useState("all");

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
        websites: cardData.websites || [],
        shareCode: shareCode // Pass the share code for mutual connection
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
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20 md:pb-0">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Connections</h1>
              <p className="text-muted-foreground">Manage your network</p>
            </div>
            <ContactForm isOpen={isAddingContact} onOpenChange={setIsAddingContact} onAddContact={addContact} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-6">
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

        <div className="space-y-4">
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
      </main>
    </div>
  );
};

export default Index;
